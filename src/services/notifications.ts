/**
 * Web Notification Alerts, In-App Dispatcher, and Web Audio Chime Service
 * CuddleCast Live Sports & Formula 1 Center
 *
 * Implements D-09: Web Notification Alerts & Permissions
 * Threat Mitigations: T-04-01 (Permission abuse gate), T-04-02 (Web Audio unhandled suspension)
 */

import { MotorsportSession } from '../types/sports';

export interface InAppAlert {
  id: string;
  sessionId: string;
  title: string;
  body: string;
  timestamp: number;
}

export interface ScheduledTimer {
  t15Timer?: number;
  t0Timer?: number;
}

const STORAGE_KEY = 'cuddlecast_race_alerts';

export class SportsNotificationService {
  private scheduledTimers: Map<string, ScheduledTimer> = new Map();
  private audioContext: AudioContext | null = null;
  private inAppListeners: Set<(alert: InAppAlert) => void> = new Set();

  constructor() {
    // Listen for custom cross-window or inter-component alert events
    if (typeof window !== 'undefined') {
      window.addEventListener('cuddlecast:session-alert', ((event: CustomEvent<InAppAlert>) => {
        this.notifyInAppListeners(event.detail);
      }) as EventListener);
    }
  }

  /**
   * Check if the browser supports the Web Notification API
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Check if notification permission is currently granted
   */
  public hasPermission(): boolean {
    if (!this.isSupported()) return false;
    return Notification.permission === 'granted';
  }

  /**
   * Explicit user gesture gate: requests permission from the browser.
   * Mitigates T-04-01 by never requesting permission automatically without user action.
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }
    try {
      const result = await Notification.requestPermission();
      return result;
    } catch (err) {
      console.warn('[SportsNotificationService] Error requesting notification permission:', err);
      return 'denied';
    }
  }

  /**
   * Retrieve list of session IDs with active race alerts from localStorage
   */
  public getScheduledSessionIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter((id) => typeof id === 'string');
        }
      }
    } catch {
      // Fallback on parse error
    }
    return [];
  }

  /**
   * Check if alerts are enabled for a specific session ID
   */
  public isAlertEnabled(sessionId: string): boolean {
    const list = this.getScheduledSessionIds();
    return list.includes(sessionId);
  }

  /**
   * Save the list of session IDs to localStorage
   */
  private saveScheduledSessionIds(ids: string[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (err) {
      console.error('[SportsNotificationService] Failed to persist alert preferences:', err);
    }
  }

  /**
   * Synthesize gentle dual-tone audio chime (880Hz then 1320Hz sine wave, 120ms each)
   * as a fallback when permissions are denied or as an in-tab feedback chime.
   * Mitigates T-04-02 by safely managing AudioContext state.
   */
  public async playChime(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const now = this.audioContext.currentTime;

      // Tone 1: 880 Hz (A5) for 120ms
      const osc1 = this.audioContext.createOscillator();
      const gain1 = this.audioContext.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.audioContext.destination);

      osc1.start(now);
      osc1.stop(now + 0.12);

      // Tone 2: 1320 Hz (E6) for 120ms (starting slightly before tone 1 ends for smooth transition)
      const osc2 = this.audioContext.createOscillator();
      const gain2 = this.audioContext.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, now + 0.1);
      gain2.gain.setValueAtTime(0.22, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc2.connect(gain2);
      gain2.connect(this.audioContext.destination);

      osc2.start(now + 0.1);
      osc2.stop(now + 0.24);
    } catch (e) {
      // Audio playback blocked or unsupported - fail silently
      console.debug('[SportsNotificationService] Audio chime failed:', e);
    }
  }

  /**
   * Dispatch notification either through browser Web Notification or in-app toast
   */
  public dispatchAlert(sessionId: string, title: string, body: string): void {
    const alert: InAppAlert = {
      id: `${sessionId}-${Date.now()}`,
      sessionId,
      title,
      body,
      timestamp: Date.now(),
    };

    // 1. Play chime
    this.playChime().catch(() => {});

    // 2. Browser native notification if permission granted
    if (this.hasPermission()) {
      try {
        const notif = new Notification(title, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: `cuddlecast-${sessionId}`,
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (err) {
        console.warn('[SportsNotificationService] Error creating native notification:', err);
      }
    }

    // 3. Dispatch in-app alert event for visual UI toast
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cuddlecast:session-alert', { detail: alert })
      );
    }
    this.notifyInAppListeners(alert);
  }

  /**
   * Schedule session alerts at T-15 minutes and Lights Out (T-0)
   */
  public scheduleSessionAlert(
    session: MotorsportSession | { id: string; name?: string; event?: string; starts_at: string; series?: { name: string } }
  ): void {
    const sessionId = session.id;
    const seriesName = session.series?.name || 'Formula 1';
    const sessionName = session.name || 'Grand Prix Session';
    const eventName = session.event ? ` - ${session.event}` : '';

    // Clear existing timers for this session if any
    this.cancelSessionTimers(sessionId);

    // Save to persistent preferences
    const currentIds = this.getScheduledSessionIds();
    if (!currentIds.includes(sessionId)) {
      currentIds.push(sessionId);
      this.saveScheduledSessionIds(currentIds);
    }

    const startTime = new Date(session.starts_at).getTime();
    const now = Date.now();
    const deltaMs = startTime - now;

    if (deltaMs <= 0) {
      // Already started or live
      return;
    }

    const timers: ScheduledTimer = {};

    // 1. T-15m reminder (15 minutes = 900,000 ms before start)
    const t15Delta = deltaMs - 15 * 60 * 1000;
    if (t15Delta > 0 && t15Delta < 2147483647) {
      timers.t15Timer = window.setTimeout(() => {
        this.dispatchAlert(
          sessionId,
          `🏎️ ${seriesName}: ${sessionName}${eventName}`,
          `${sessionName} starts in 15 minutes! Tune in now.`
        );
      }, t15Delta);
    }

    // 2. Lights Out (T-0)
    if (deltaMs > 0 && deltaMs < 2147483647) {
      timers.t0Timer = window.setTimeout(() => {
        this.dispatchAlert(
          sessionId,
          `🟢 Lights Out! ${seriesName}: ${sessionName}${eventName}`,
          `${sessionName} is now LIVE. Watch stream now!`
        );
        this.cancelSessionAlert(sessionId);
      }, deltaMs);
    }

    this.scheduledTimers.set(sessionId, timers);
  }

  /**
   * Clear active timers in memory without removing from storage
   */
  private cancelSessionTimers(sessionId: string): void {
    const existing = this.scheduledTimers.get(sessionId);
    if (existing) {
      if (existing.t15Timer) clearTimeout(existing.t15Timer);
      if (existing.t0Timer) clearTimeout(existing.t0Timer);
      this.scheduledTimers.delete(sessionId);
    }
  }

  /**
   * Cancel session alert and remove from localStorage
   */
  public cancelSessionAlert(sessionId: string): void {
    this.cancelSessionTimers(sessionId);
    const updated = this.getScheduledSessionIds().filter((id) => id !== sessionId);
    this.saveScheduledSessionIds(updated);
  }

  /**
   * Toggle alert status for a session. Returns the new enabled boolean.
   */
  public async toggleSessionAlert(
    session: MotorsportSession | { id: string; name?: string; event?: string; starts_at: string; series?: { name: string } }
  ): Promise<boolean> {
    const isCurrentlyEnabled = this.isAlertEnabled(session.id);

    if (isCurrentlyEnabled) {
      this.cancelSessionAlert(session.id);
      return false;
    } else {
      // If notification permission is default, ask for it
      if (this.isSupported() && Notification.permission === 'default') {
        await this.requestPermission();
      }
      this.scheduleSessionAlert(session);
      return true;
    }
  }

  /**
   * Reset all notification preferences and cancel all pending timers
   */
  public resetAllAlerts(): void {
    for (const [sessionId] of this.scheduledTimers) {
      this.cancelSessionTimers(sessionId);
    }
    this.scheduledTimers.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * Register a listener for in-app alert events
   */
  public onInAppAlert(listener: (alert: InAppAlert) => void): () => void {
    this.inAppListeners.add(listener);
    return () => {
      this.inAppListeners.delete(listener);
    };
  }

  private notifyInAppListeners(alert: InAppAlert): void {
    for (const listener of this.inAppListeners) {
      try {
        listener(alert);
      } catch (err) {
        console.error('[SportsNotificationService] Listener error:', err);
      }
    }
  }
}

export const sportsNotifications = new SportsNotificationService();
