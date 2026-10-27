/**
 * Stream Failover State Machine and Exponential Backoff Retry Manager
 * CuddleCast Live Sports & Formula 1 Center
 *
 * Implements D-01 (Hybrid WatchItBetter Streaming Model), D-02 (Sandboxed Embed Security),
 * and D-03 (Live Channel Availability State).
 */

export type FailoverState =
  | 'HLS_PRIMARY'
  | 'RETRYING'
  | 'EMBED_FALLBACK'
  | 'CHANNEL_MIRROR';

export type StreamErrorCategory =
  | 'NETWORK_ERROR'
  | 'MEDIA_ERROR'
  | 'KEY_SYSTEM_ERROR'
  | 'MUX_ERROR'
  | 'UNKNOWN_ERROR';

export type ChannelHealthStatus = 'EXCELLENT' | 'DEGRADED' | 'FAILED' | 'OFFLINE';

export interface ChannelHealth {
  channelId: string;
  status: ChannelHealthStatus;
  lastError?: string;
  consecutiveFailures: number;
  lastChecked: number;
}

export interface StreamErrorDetails {
  category: StreamErrorCategory;
  isFatal: boolean;
  rawError?: unknown;
  message?: string;
}

export interface FailoverEvent {
  state: FailoverState;
  attempt: number;
  maxAttempts: number;
  message: string;
  delayMs?: number;
  errorDetails?: StreamErrorDetails;
}

export interface FailoverConfig {
  retryDelays?: number[];
  maxAttempts?: number;
  fallbackEmbedIndex?: number;
}

export const RETRY_DELAYS_MS = [1000, 2500, 5000] as const;
export const MAX_RETRY_ATTEMPTS = 3;

/**
 * Categorize Hls.js error types into structured categories.
 */
export function categorizeHlsError(
  errorType?: string,
  errorDetails?: string
): StreamErrorCategory {
  const normType = (errorType || '').toLowerCase();
  const normDetails = (errorDetails || '').toLowerCase();

  if (
    normType === 'networkerror' ||
    normDetails.includes('network') ||
    normDetails.includes('manifest') ||
    normDetails.includes('403') ||
    normDetails.includes('404') ||
    normDetails.includes('timeout')
  ) {
    return 'NETWORK_ERROR';
  }
  if (
    normType === 'mediaerror' ||
    normDetails.includes('buffer') ||
    normDetails.includes('decode') ||
    normDetails.includes('demux') ||
    normDetails.includes('media')
  ) {
    return 'MEDIA_ERROR';
  }
  if (normType === 'keysystemerror' || normDetails.includes('key')) {
    return 'KEY_SYSTEM_ERROR';
  }
  if (normType === 'muxerror' || normDetails.includes('mux')) {
    return 'MUX_ERROR';
  }
  return 'UNKNOWN_ERROR';
}

/**
 * StreamFailoverManager manages the 4-state lifecycle of a live stream channel:
 * HLS_PRIMARY -> RETRYING (1s, 2.5s, 5s backoff) -> EMBED_FALLBACK -> CHANNEL_MIRROR
 */
export class StreamFailoverManager {
  private state: FailoverState = 'HLS_PRIMARY';
  private attempt = 0;
  private readonly maxAttempts: number;
  private readonly retryDelays: number[];
  private retryTimer: number | null = null;
  private stateListeners: Set<(event: FailoverEvent) => void> = new Set();
  private retryListeners: Set<(attempt: number) => void> = new Set();
  private channelHealthMap: Map<string, ChannelHealth> = new Map();
  private activeChannelId: string | null = null;
  private currentEvent: FailoverEvent;

  constructor(config?: FailoverConfig) {
    this.retryDelays = config?.retryDelays ?? [...RETRY_DELAYS_MS];
    this.maxAttempts = config?.maxAttempts ?? MAX_RETRY_ATTEMPTS;

    this.currentEvent = {
      state: 'HLS_PRIMARY',
      attempt: 0,
      maxAttempts: this.maxAttempts,
      message: 'Direct HLS primary stream active',
    };
  }

  /**
   * Set active channel context for health tracking.
   */
  public setActiveChannel(channelId: string): void {
    this.activeChannelId = channelId;
    if (!this.channelHealthMap.has(channelId)) {
      this.channelHealthMap.set(channelId, {
        channelId,
        status: 'EXCELLENT',
        consecutiveFailures: 0,
        lastChecked: Date.now(),
      });
    }
  }

  /**
   * Return the current state of the failover state machine.
   */
  public getState(): FailoverState {
    return this.state;
  }

  /**
   * Return the current retry attempt count.
   */
  public getAttempt(): number {
    return this.attempt;
  }

  /**
   * Return the current failover event payload.
   */
  public getCurrentEvent(): FailoverEvent {
    return this.currentEvent;
  }

  /**
   * Subscribe to state transition events.
   * Returns an unsubscribe function.
   */
  public onStateChange(listener: (event: FailoverEvent) => void): () => void {
    this.stateListeners.add(listener);
    // Immediately emit current state to new listener
    listener(this.currentEvent);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  /**
   * Subscribe to retry execution trigger events.
   * Returns an unsubscribe function.
   */
  public onRetry(listener: (attempt: number) => void): () => void {
    this.retryListeners.add(listener);
    return () => {
      this.retryListeners.delete(listener);
    };
  }

  /**
   * Handle an Hls.js error event.
   * Non-fatal errors are logged and swallowed so Hls.js can recover internally.
   * Fatal errors trigger exponential backoff retry up to 3 attempts, then transition to EMBED_FALLBACK.
   */
  public handleHlsError(
    isFatal: boolean,
    errorType?: string,
    errorDetails?: string,
    rawError?: unknown
  ): void {
    const category = categorizeHlsError(errorType, errorDetails);
    const details: StreamErrorDetails = {
      category,
      isFatal,
      rawError,
      message: errorDetails || errorType,
    };

    if (!isFatal) {
      console.warn('[StreamFailover] Non-fatal HLS error encountered:', details);
      this.updateChannelHealthStatus(this.activeChannelId, 'DEGRADED', errorDetails);
      return;
    }

    console.error('[StreamFailover] Fatal HLS error encountered:', details);
    this.updateChannelHealthStatus(this.activeChannelId, 'DEGRADED', errorDetails);

    // If already in fallback or mirror, do not trigger further HLS retries
    if (this.state === 'EMBED_FALLBACK' || this.state === 'CHANNEL_MIRROR') {
      return;
    }

    this.attempt += 1;

    if (this.attempt <= this.maxAttempts) {
      const delayIndex = Math.min(this.attempt - 1, this.retryDelays.length - 1);
      const delayMs = this.retryDelays[delayIndex];

      this.state = 'RETRYING';
      const message = `Stream Connection Failed: Unable to reach primary HLS stream. Retrying connection (Attempt ${this.attempt} of ${this.maxAttempts}) before switching to secure mirror...`;

      this.currentEvent = {
        state: 'RETRYING',
        attempt: this.attempt,
        maxAttempts: this.maxAttempts,
        message,
        delayMs,
        errorDetails: details,
      };

      this.emitStateChange(this.currentEvent);

      this.clearRetryTimer();
      this.retryTimer = window.setTimeout(() => {
        this.retryTimer = null;
        console.info(`[StreamFailover] Executing retry attempt ${this.attempt}/${this.maxAttempts}`);
        this.emitRetry(this.attempt);
      }, delayMs);
    } else {
      // Retries exhausted -> Transition to EMBED_FALLBACK
      this.clearRetryTimer();
      this.updateChannelHealthStatus(this.activeChannelId, 'FAILED', errorDetails);
      this.transitionToEmbedFallback(
        'Primary Stream Offline: Switched to Sandboxed Embed Mirror 1. If playback does not begin, choose Channel 2 from the switcher above.',
        details
      );
    }
  }

  /**
   * Transition directly to EMBED_FALLBACK (e.g. embed-only channel or manual fallback).
   */
  public transitionToEmbedFallback(
    customMessage?: string,
    errorDetails?: StreamErrorDetails
  ): void {
    this.clearRetryTimer();
    this.state = 'EMBED_FALLBACK';
    const message =
      customMessage ??
      'Primary Stream Offline: Switched to Sandboxed Embed Mirror 1. If playback does not begin, choose Channel 2 from the switcher above.';

    this.currentEvent = {
      state: 'EMBED_FALLBACK',
      attempt: this.attempt,
      maxAttempts: this.maxAttempts,
      message,
      errorDetails,
    };

    this.emitStateChange(this.currentEvent);
  }

  /**
   * Switch to a manual channel mirror (e.g. Channel 2, Sky Sports IT, Onboard).
   */
  public switchToMirror(channelIndex: number, channelName?: string): void {
    this.clearRetryTimer();
    this.state = 'CHANNEL_MIRROR';
    const label = channelName ? ` (${channelName})` : '';
    const message = `Switched to Channel Mirror ${channelIndex + 1}${label}.`;

    this.currentEvent = {
      state: 'CHANNEL_MIRROR',
      attempt: this.attempt,
      maxAttempts: this.maxAttempts,
      message,
    };

    this.emitStateChange(this.currentEvent);
  }

  /**
   * Trigger an immediate manual retry without waiting for backoff timer.
   */
  public triggerImmediateRetry(): void {
    this.clearRetryTimer();
    this.attempt = 0;
    this.state = 'HLS_PRIMARY';
    this.currentEvent = {
      state: 'HLS_PRIMARY',
      attempt: 0,
      maxAttempts: this.maxAttempts,
      message: 'Reconnecting to direct HLS stream...',
    };
    this.emitStateChange(this.currentEvent);
    this.emitRetry(1);
  }

  /**
   * Reset state back to HLS_PRIMARY, resetting retry counters and cancelling timers.
   * Called when the user switches channels or forces a reload.
   */
  public reset(newChannelId?: string): void {
    this.clearRetryTimer();
    this.state = 'HLS_PRIMARY';
    this.attempt = 0;

    if (newChannelId) {
      this.setActiveChannel(newChannelId);
    }

    this.currentEvent = {
      state: 'HLS_PRIMARY',
      attempt: 0,
      maxAttempts: this.maxAttempts,
      message: 'Direct HLS primary stream active',
    };

    this.emitStateChange(this.currentEvent);
  }

  /**
   * Destroy the manager, cancelling timers and clearing all listeners.
   */
  public destroy(): void {
    this.clearRetryTimer();
    this.stateListeners.clear();
    this.retryListeners.clear();
  }

  // ---------------------------------------------------------------------------
  // Health Tracking
  // ---------------------------------------------------------------------------

  public updateChannelHealthStatus(
    channelId: string | null,
    status: ChannelHealthStatus,
    lastError?: string
  ): void {
    if (!channelId) return;

    const existing = this.channelHealthMap.get(channelId) || {
      channelId,
      status: 'EXCELLENT',
      consecutiveFailures: 0,
      lastChecked: Date.now(),
    };

    const consecutiveFailures =
      status === 'FAILED'
        ? existing.consecutiveFailures + 1
        : status === 'EXCELLENT'
        ? 0
        : existing.consecutiveFailures;

    this.channelHealthMap.set(channelId, {
      channelId,
      status,
      lastError,
      consecutiveFailures,
      lastChecked: Date.now(),
    });
  }

  public getChannelHealth(channelId: string): ChannelHealth | undefined {
    return this.channelHealthMap.get(channelId);
  }

  public getAllChannelHealth(): Record<string, ChannelHealth> {
    const result: Record<string, ChannelHealth> = {};
    this.channelHealthMap.forEach((val, key) => {
      result[key] = val;
    });
    return result;
  }

  // ---------------------------------------------------------------------------
  // Internal Helpers
  // ---------------------------------------------------------------------------

  private clearRetryTimer(): void {
    if (this.retryTimer !== null) {
      window.clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  private emitStateChange(event: FailoverEvent): void {
    this.stateListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[StreamFailover] Error in state listener:', err);
      }
    });
  }

  private emitRetry(attempt: number): void {
    this.retryListeners.forEach((listener) => {
      try {
        listener(attempt);
      } catch (err) {
        console.error('[StreamFailover] Error in retry listener:', err);
      }
    });
  }
}
