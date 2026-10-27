import React, { useState, useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture2,
  RefreshCw,
  AlertTriangle,
  Radio,
  Tv,
  CheckCircle2,
} from 'lucide-react';
import { StreamChannel } from '../../types/sports';
import {
  StreamFailoverManager,
  FailoverState,
  FailoverEvent,
} from '../../services/streamFailover';
import { SandboxedEmbedPlayer } from './SandboxedEmbedPlayer';

import '@material/web/progress/circular-progress.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/filled-button.js';

export interface TheaterStreamPlayerProps {
  channel: StreamChannel;
  sessionTitle: string;
  circuitName?: string;
  isInterrupted?: boolean;
  onChannelFailover?: (nextChannelId: string) => void;
  onFullscreenToggle?: () => void;
  className?: string;
}

/**
 * TheaterStreamPlayer implements the 16:9 primary viewport for CuddleCast Live Sports.
 *
 * Core Capabilities (D-01, D-02, D-03, D-06):
 * - Direct low-latency HLS (.m3u8) playback with worker acceleration.
 * - Deterministic exponential failover manager (1s, 2.5s, 5s backoff).
 * - Automatic transition to SandboxedEmbedPlayer with ad-redirect isolation.
 * - HTML5 native Picture-in-Picture (PiP) for direct HLS feeds.
 * - Graceful fallback / tooltip when PiP is attempted on sandboxed embeds.
 * - Locked 16:9 aspect ratio ensuring zero Cumulative Layout Shift (CLS 0.0).
 */
export const TheaterStreamPlayer: React.FC<TheaterStreamPlayerProps> = ({
  channel,
  sessionTitle,
  circuitName,
  isInterrupted = false,
  onChannelFailover: _onChannelFailover,
  onFullscreenToggle,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const failoverManagerRef = useRef<StreamFailoverManager | null>(null);
  const hideControlsTimerRef = useRef<number | null>(null);

  // Failover state
  const [failoverState, setFailoverState] = useState<FailoverState>('HLS_PRIMARY');
  const [failoverEvent, setFailoverEvent] = useState<FailoverEvent | null>(null);

  // Playback & UI state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [dismissFallbackBanner, setDismissFallbackBanner] = useState(false);

  // Initialize Failover Manager once
  if (!failoverManagerRef.current) {
    failoverManagerRef.current = new StreamFailoverManager();
  }

  // Detect browser Picture-in-Picture support
  useEffect(() => {
    const isSupported =
      typeof document !== 'undefined' &&
      'pictureInPictureEnabled' in document &&
      Boolean(document.pictureInPictureEnabled);
    setIsPiPSupported(isSupported);
  }, []);

  // Sync failover manager events to React state
  useEffect(() => {
    const manager = failoverManagerRef.current;
    if (!manager) return;

    const unsubState = manager.onStateChange((event) => {
      setFailoverState(event.state);
      setFailoverEvent(event);
      if (event.state === 'EMBED_FALLBACK') {
        setDismissFallbackBanner(false);
      }
    });

    const unsubRetry = manager.onRetry(() => {
      // Re-trigger load in HLS
      if (hlsRef.current && channel.playlist) {
        setIsBuffering(true);
        hlsRef.current.loadSource(channel.playlist);
        hlsRef.current.startLoad();
      } else if (videoRef.current && channel.playlist) {
        videoRef.current.src = channel.playlist;
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      }
    });

    return () => {
      unsubState();
      unsubRetry();
    };
  }, [channel.playlist]);

  // Clean teardown helper for Hls.js
  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.detachMedia();
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  // Handle stream initialization & channel changes
  useEffect(() => {
    const manager = failoverManagerRef.current;
    if (!manager) return;

    manager.reset(channel.id);
    destroyHls();
    setIsBuffering(true);
    setDismissFallbackBanner(false);

    // If channel is explicitly embed type or lacks an HLS playlist, switch directly to embed
    if (channel.type === 'embed' || !channel.playlist) {
      manager.transitionToEmbedFallback();
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    // Direct HLS playback using Hls.js
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });

      hlsRef.current = hls;
      hls.loadSource(channel.playlist);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        manager.updateChannelHealthStatus(channel.id, 'EXCELLENT');
        video.play().catch(() => {
          // Autoplay policy might require initial user interaction or mute
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setIsBuffering(false);
          manager.handleHlsError(true, data.type, data.details, data);
        } else {
          manager.handleHlsError(false, data.type, data.details, data);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari HLS
      video.src = channel.playlist;
      video.addEventListener('loadedmetadata', () => {
        setIsBuffering(false);
        video.play().catch(() => {});
      });
      video.addEventListener('error', (e) => {
        setIsBuffering(false);
        manager.handleHlsError(true, 'networkError', 'Safari native HLS error', e);
      });
    } else {
      // Unsupported browser -> Fallback to embed
      manager.transitionToEmbedFallback();
    }

    return () => {
      destroyHls();
    };
  }, [channel.id, channel.playlist, channel.type, destroyHls]);

  // Track video element events (buffering, play/pause, volume)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleVolume = () => setIsMuted(video.muted);

    const handleEnterPiP = () => setIsPiPActive(true);
    const handleLeavePiP = () => setIsPiPActive(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('volumechange', handleVolume);
    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('volumechange', handleVolume);
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, [failoverState]);

  // Fullscreen sync
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = Boolean(document.fullscreenElement);
      setIsFullscreen(isFull);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Controls auto-hide on inactivity
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      window.clearTimeout(hideControlsTimerRef.current);
    }
    hideControlsTimerRef.current = window.setTimeout(() => {
      if (isPlaying && !isBuffering && failoverState === 'HLS_PRIMARY') {
        setShowControls(false);
      }
    }, 3500);
  }, [isPlaying, isBuffering, failoverState]);

  useEffect(() => {
    return () => {
      if (hideControlsTimerRef.current) {
        window.clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, []);

  // Control Actions
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const togglePiP = async () => {
    if (failoverState === 'EMBED_FALLBACK' || failoverState === 'CHANNEL_MIRROR') {
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('[TheaterStreamPlayer] Picture-in-Picture request failed:', err);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          onFullscreenToggle?.();
        })
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
          onFullscreenToggle?.();
        })
        .catch(() => {});
    }
  };

  const handleManualRetry = () => {
    if (failoverManagerRef.current) {
      setIsBuffering(true);
      failoverManagerRef.current.triggerImmediateRetry();
    }
  };

  const isEmbedActive =
    failoverState === 'EMBED_FALLBACK' || failoverState === 'CHANNEL_MIRROR';

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full aspect-video bg-[#303841] overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_35px_-5px_rgba(0,112,243,0.25)] select-none group ${className}`}
      style={{ aspectRatio: '16 / 9', backgroundColor: '#303841' }}
    >
      {/* 1. Primary Direct HLS Video Canvas */}
      {!isEmbedActive && (
        <video
          ref={videoRef}
          playsInline
          className="w-full h-full object-contain bg-black cursor-pointer"
          onClick={togglePlay}
        />
      )}

      {/* 2. Sandboxed Embed Fallback Mirror */}
      {isEmbedActive && (
        <SandboxedEmbedPlayer
          src={channel.player}
          title={`${channel.name} Live Stream`}
          isPausedOrOffline={isInterrupted}
          offlineMessage="Broadcaster Feed Interrupted: Upstream broadcast temporarily paused. Standing by for live feed restoration..."
          className="w-full h-full"
        />
      )}

      {/* 3. Interrupted Broadcast State Banner (Docked Across Top Canvas) */}
      {isInterrupted && (
        <div className="absolute top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-2.5 bg-amber-500/90 text-black font-semibold text-xs backdrop-blur-md shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-black" />
            <span>
              Broadcaster Feed Interrupted: Upstream broadcast temporarily paused. Standing by for live feed restoration...
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded bg-black/20">
            <Radio className="h-3 w-3 animate-pulse" />
            <span>STANDBY</span>
          </div>
        </div>
      )}

      {/* 4. Exponential Backoff Retry Status Alert Banner */}
      {failoverState === 'RETRYING' && !isInterrupted && (
        <div className="absolute top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-2.5 bg-amber-600/95 text-white font-medium text-xs backdrop-blur-md shadow-lg border-b border-amber-400/30 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-amber-300 animate-ping" />
            <span>
              {failoverEvent?.message ||
                `Stream Connection Failed: Unable to reach primary HLS stream. Retrying connection (Attempt ${failoverEvent?.attempt || 1} of 3) before switching to secure mirror...`}
            </span>
          </div>
          <md-filled-tonal-button
            onClick={handleManualRetry}
            className="text-[11px] font-semibold"
            style={{
              '--md-filled-tonal-button-container-color': 'rgba(0, 0, 0, 0.3)',
              '--md-filled-tonal-button-label-text-color': '#FFFFFF',
            }}
          >
            <RefreshCw className="h-3 w-3 mr-1" slot="icon" />
            Retry Now
          </md-filled-tonal-button>
        </div>
      )}

      {/* 5. Sandboxed Embed Fallback Notice Banner */}
      {failoverState === 'EMBED_FALLBACK' && !dismissFallbackBanner && !isInterrupted && (
        <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-2 bg-black/80 text-zinc-200 text-xs backdrop-blur-md border-b border-white/10 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Tv className="h-3.5 w-3.5 text-[#0070F3] shrink-0" />
            <span className="line-clamp-1">
              Primary Stream Offline: Switched to Sandboxed Embed Mirror 1. If playback does not begin, choose Channel 2 from the switcher above.
            </span>
          </div>
          <button
            onClick={() => setDismissFallbackBanner(true)}
            className="text-[11px] text-zinc-400 hover:text-white underline ml-3 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 6. Centered Buffering Spinner for HLS Mode */}
      {isBuffering && !isEmbedActive && !isInterrupted && failoverState !== 'RETRYING' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-xs pointer-events-none">
          <md-circular-progress
            indeterminate
            style={{
              '--md-circular-progress-active-indicator-color': '#0070F3',
              '--md-circular-progress-size': '52px',
            }}
          />
          <span className="mt-3 text-xs font-semibold text-zinc-300 tracking-wider animate-pulse">
            Buffering Live Stream...
          </span>
        </div>
      )}

      {/* 7. Centered Retry Overlay for RETRYING State */}
      {failoverState === 'RETRYING' && !isEmbedActive && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
          <md-circular-progress
            indeterminate
            style={{
              '--md-circular-progress-active-indicator-color': '#F59E0B',
              '--md-circular-progress-size': '56px',
            }}
          />
          <div className="mt-4 text-center space-y-1">
            <p className="text-sm font-semibold text-white tracking-wide">
              Reconnecting (Attempt {failoverEvent?.attempt || 1} of 3)...
            </p>
            <p className="text-xs text-zinc-400">
              Backing off for {((failoverEvent?.delayMs || 1000) / 1000).toFixed(1)}s before failover
            </p>
          </div>
        </div>
      )}

      {/* 8. Top Ambient Header Overlay (Metadata & Channel Health Badge) */}
      <div
        className={`absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Left: Stream Health & Channel Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white shadow-lg">
            {!isEmbedActive ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{channel.bitrate || '1080p 60fps'} • HLS Live</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-[#0070F3]" />
                <span>Embed Mirror 1 • Sandboxed</span>
              </>
            )}
          </div>

          <span className="hidden sm:inline-block text-xs font-medium text-zinc-300 px-2 py-1 rounded bg-white/5 border border-white/5">
            {channel.name}
          </span>
        </div>

        {/* Right: Session Title & Circuit */}
        <div className="text-right">
          <div className="text-xs sm:text-sm font-bold text-white tracking-tight drop-shadow">
            {sessionTitle}
          </div>
          {circuitName && (
            <div className="text-[11px] font-mono text-zinc-400">
              {circuitName}
            </div>
          )}
        </div>
      </div>

      {/* 9. Floating Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Left: Playback & Volume Controls */}
        <div className="flex items-center gap-2">
          {!isEmbedActive && (
            <md-icon-button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause Stream' : 'Play Stream'}
              title={isPlaying ? 'Pause Stream' : 'Play Stream'}
              className="text-white hover:text-[#0070F3] transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 fill-current" />
              )}
            </md-icon-button>
          )}

          {!isEmbedActive && (
            <md-icon-button
              onClick={toggleMute}
              aria-label="Toggle Audio Mute"
              title="Toggle Audio Mute"
              className="text-white hover:text-[#0070F3] transition-colors"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-rose-400" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </md-icon-button>
          )}

          {/* Direct stream health indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 text-[11px] font-mono text-zinc-300 border border-white/5">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>Live Sync 0.0s CLS</span>
          </div>
        </div>

        {/* Right: Picture-in-Picture, Reconnect & Fullscreen Controls */}
        <div className="flex items-center gap-2">
          {/* Manual Reconnect Action */}
          <md-icon-button
            onClick={handleManualRetry}
            aria-label="Retry Stream Connection"
            title="Retry Stream Connection"
            className="text-white hover:text-amber-400 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </md-icon-button>

          {/* Picture-in-Picture Trigger (D-06) */}
          {isPiPSupported && (
            <div className="relative inline-block group/pip">
              <md-icon-button
                onClick={togglePiP}
                disabled={isEmbedActive}
                aria-label={
                  isEmbedActive
                    ? 'Picture-in-Picture requires direct HLS stream'
                    : 'Open Picture-in-Picture'
                }
                title={
                  isEmbedActive
                    ? 'Picture-in-Picture requires direct HLS stream. Switch to HLS feed for floating player.'
                    : 'Open Picture-in-Picture'
                }
                className={`transition-colors ${
                  isEmbedActive
                    ? 'opacity-40 cursor-not-allowed'
                    : isPiPActive
                    ? 'text-[#0070F3]'
                    : 'text-white hover:text-[#0070F3]'
                }`}
              >
                <PictureInPicture2 className="h-5 w-5" />
              </md-icon-button>

              {/* Tooltip for Disabled Embed PiP */}
              {isEmbedActive && (
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover/pip:block z-50 w-64 p-2 text-[11px] text-zinc-200 bg-neutral-900 border border-white/10 rounded-lg shadow-xl pointer-events-none">
                  Picture-in-Picture requires direct HLS stream. Switch to HLS feed for floating player.
                </div>
              )}
            </div>
          )}

          {/* Fullscreen Trigger */}
          <md-icon-button
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen Mode"
            title="Toggle Fullscreen Mode"
            className="text-white hover:text-[#0070F3] transition-colors"
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </md-icon-button>
        </div>
      </div>
    </div>
  );
};
