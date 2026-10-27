import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  ArrowLeft,
  FastForward,
  Sliders,
  Users,
  PictureInPicture,
  RefreshCw,
  Server,
  ChevronDown,
} from 'lucide-react';
import Hls from 'hls.js';
import { Episode, MediaItem } from '../types/schema';
import { authStorage } from '../services/supabase';
import { DEFAULT_STREAM } from '../services/api';
import { useAccent } from '../context/AccentContext';
import { usePlayerStore } from '../store/playerStore';
import { PictureSoundPanel } from './PictureSoundPanel';
import { WatchPartyModal } from './WatchPartyModal';
import { STREAM_PROVIDERS, VIDFAST_SERVERS } from '../services/providers';

interface VideoPlayerProps {
  item: MediaItem;
  episode?: Episode;
  onClose: () => void;
  onNextEpisode?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  item,
  episode,
  onClose,
  onNextEpisode,
}) => {
  const { accentHex } = useAccent();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const {
    setCurrentTime: setStoreTime,
    setDuration: setStoreDuration,
    setPlaying: setStorePlaying,
  } = usePlayerStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [showParty, setShowParty] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);

  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const [playbackErrorMessage, setPlaybackErrorMessage] = useState<string | null>(null);
  const [isStalled, setIsStalled] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const inactivityTimerRef = useRef<number | null>(null);

  const streamUrl = episode?.streamUrl || item.streamUrl || DEFAULT_STREAM;

  // Multi-Provider Streaming Engine State
  const isDirectHlsStream = !!(
    (episode?.streamUrl && episode.streamUrl.includes('.m3u8')) ||
    (item.streamUrl && item.streamUrl.includes('.m3u8')) ||
    item.overview === 'Live match broadcast' ||
    item.overview === 'Live IPTV stream'
  );
  const [selectedProviderId, setSelectedProviderId] = useState<string>(
    isDirectHlsStream ? 'hls' : 'vidfast'
  );
  const [selectedServerId, setSelectedServerId] = useState<string>('Alpha');
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [menuTab, setMenuTab] = useState<'providers' | 'servers'>('providers');

  const activeProvider = STREAM_PROVIDERS.find((p) => p.id === selectedProviderId);

  const embedUrl = React.useMemo(() => {
    if (!activeProvider || selectedProviderId === 'hls') return '';
    const isTv = item.media_type === 'tv' || !!episode;
    if (isTv) {
      return activeProvider.getTvUrl(
        item.id,
        episode?.season_number || 1,
        episode?.episode_number || 1,
        {
          server: selectedServerId,
          themeHex: accentHex,
          startAt: currentTime > 0 ? currentTime : undefined,
        }
      );
    } else {
      return activeProvider.getMovieUrl(item.id, {
        server: selectedServerId,
        themeHex: accentHex,
        startAt: currentTime > 0 ? currentTime : undefined,
      });
    }
  }, [activeProvider, selectedProviderId, selectedServerId, item, episode, accentHex, currentTime]);

  // Listen to PostMessage events from embedded players (VidFast, etc.)
  useEffect(() => {
    const handlePostMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data) return;

        if (data.type === 'timeupdate' || data.event === 'timeupdate') {
          const payload = data.data || data;
          if (typeof payload.currentTime === 'number') {
            setCurrentTime(payload.currentTime);
            setStoreTime(payload.currentTime);
          }
          if (typeof payload.duration === 'number' && payload.duration > 0) {
            setDuration(payload.duration);
            setStoreDuration(payload.duration);
          }
        } else if (data.type === 'play' || data.event === 'play') {
          setIsPlaying(true);
          setStorePlaying(true);
        } else if (data.type === 'pause' || data.event === 'pause') {
          setIsPlaying(false);
          setStorePlaying(false);
        }
      } catch {
        // ignore non-json messages
      }
    };

    window.addEventListener('message', handlePostMessage);
    return () => window.removeEventListener('message', handlePostMessage);
  }, [setStoreTime, setStoreDuration, setStorePlaying]);

  // Manual retry handler
  const handleRetryPlayback = () => {
    setHasPlaybackError(false);
    setPlaybackErrorMessage(null);
    setIsStalled(false);
    setRetryCount((c) => c + 1);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
      const hls = new Hls({
        enableWorker: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        backBufferLength: 90,
      });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        setIsPlaying(true);
      });
    } else {
      video.src = streamUrl;
      video.play().catch(() => {});
    }
  };

  // Initialize HLS with lifecycle event listeners
  useEffect(() => {
    if (selectedProviderId !== 'hls') {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const saved = authStorage.getProgress(item.id);
    if (saved && saved.progress_seconds > 0) {
      video.currentTime = saved.progress_seconds;
    }

    if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
      const hls = new Hls({
        enableWorker: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        backBufferLength: 90,
      });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setHasPlaybackError(false);
        setIsStalled(false);
        video.play().catch(() => {});
        setIsPlaying(true);
      });

      // FRAG_CHANGED: Track fragment playback and clear any pending stall
      hls.on(Hls.Events.FRAG_CHANGED, () => {
        setHasPlaybackError(false);
        setIsStalled(false);
      });

      // ERROR Lifecycle Handler: Automatic retry / recovery or user banner
      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.warn('Hls error event:', data.type, data.details, data.fatal);

        if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
          setIsStalled(true);
          if (hls.levels && hls.levels.length > 1 && hls.currentLevel > 0) {
            hls.currentLevel = Math.max(0, hls.currentLevel - 1);
          }
        }

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              if (hls.levels && hls.levels.length > 1 && hls.currentLevel > 0) {
                hls.currentLevel = Math.max(0, hls.currentLevel - 1);
                hls.startLoad();
              } else {
                setHasPlaybackError(true);
                setPlaybackErrorMessage('Live stream connection interrupted. Click to retry.');
              }
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().catch(() => {});
      setIsPlaying(true);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, item.id, retryCount, selectedProviderId]);

  // Periodic progress saving
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && isPlaying) {
        authStorage.saveProgress(
          item.id,
          videoRef.current.currentTime,
          videoRef.current.duration || 100
        );
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [item.id, isPlaying]);

  // Auto-hide controls
  const resetInactivityTimer = () => {
    setShowControls(true);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = window.setTimeout(() => {
      if (isPlaying && !showPanel && !showParty) {
        setShowControls(false);
        setShowSpeedMenu(false);
      }
    }, 3000);
  };

  const handleMouseMove = () => {
    resetInactivityTimer();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
        case 'KeyJ':
          e.preventDefault();
          seekBy(-10);
          break;
        case 'ArrowRight':
        case 'KeyL':
          e.preventDefault();
          seekBy(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyD':
          e.preventDefault();
          setShowPanel(prev => !prev);
          break;
        case 'Escape':
          if (!document.fullscreenElement) {
            onClose();
          }
          break;
      }
      resetInactivityTimer();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, onClose, showPanel]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
      setStorePlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
      setStorePlaying(false);
    }
  };

  const seekBy = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    setDuration(video.duration || 0);
    setStoreTime(video.currentTime);
    setStoreDuration(video.duration || 0);

    if (video.buffered.length > 0) {
      setBufferedTime(video.buffered.end(video.buffered.length - 1));
    }
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const targetTime = Number(e.target.value);
    if (!video) return;
    video.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleScrubberHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = pos * (duration || 0);
    setHoverPosition(pos * 100);
    setHoverTime(time);
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
      video.volume = volume || 0.5;
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const changeSpeed = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP not available:', err);
    }
  };

  const remainingSeconds = duration - currentTime;
  const isNearEnd = duration > 60 && remainingSeconds > 0 && remainingSeconds <= 20;

  const handleContainerClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, select, [role="button"], iframe')) return;
    setShowControls(prev => !prev);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={handleContainerClick}
      className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black ${
        showControls ? 'cursor-default' : 'cursor-none'
      }`}
    >
      {selectedProviderId === 'hls' ? (
        <video
          ref={videoRef}
          onTimeUpdate={handleTimeUpdate}
          className="h-full w-full object-contain"
          playsInline
        />
      ) : (
        <iframe
          src={embedUrl}
          className="h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          title={item.title || item.name}
        />
      )}

      {/* Top Header Bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3.5 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-2.5 sm:gap-3.5 text-white transition-transform hover:scale-105"
        >
          <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:bg-white/20">
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="text-left">
            <h3 className="text-sm sm:lg font-bold truncate max-w-[200px] sm:max-w-md">{item.title || item.name}</h3>
            {episode && (
              <p className="text-[11px] sm:text-xs text-zinc-400">
                S{episode.season_number}:E{episode.episode_number} - {episode.title}
              </p>
            )}
          </div>
        </button>

        <div className="flex items-center gap-2">
          {/* Provider / Server Selector Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowServerMenu(!showServerMenu);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-white/15 text-xs font-semibold text-white hover:bg-white/15 backdrop-blur-md transition-all shadow-lg"
              style={{ borderColor: showServerMenu ? accentHex : undefined }}
            >
              <Server className="h-3.5 w-3.5" style={{ color: accentHex }} />
              <span className="max-w-[130px] truncate">
                {selectedProviderId === 'vidfast'
                  ? `VidFast (${selectedServerId})`
                  : activeProvider?.name || 'Direct Stream'}
              </span>
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </button>

            {/* Server & Provider Dropdown Menu */}
            {showServerMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-10 right-0 w-80 max-h-[420px] overflow-hidden rounded-2xl bg-[#141419]/98 border border-white/15 shadow-2xl backdrop-blur-2xl z-50 flex flex-col"
              >
                {/* Header with Tabs */}
                <div className="p-2 border-b border-white/10 bg-black/40">
                  <div className="flex rounded-xl bg-white/5 p-1 gap-1">
                    <button
                      onClick={() => setMenuTab('providers')}
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                        menuTab === 'providers'
                          ? 'bg-white/15 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                      style={{
                        color: menuTab === 'providers' ? accentHex : undefined,
                      }}
                    >
                      Providers ({STREAM_PROVIDERS.length})
                    </button>
                    <button
                      onClick={() => setMenuTab('servers')}
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                        menuTab === 'servers'
                          ? 'bg-white/15 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                      style={{
                        color: menuTab === 'servers' ? accentHex : undefined,
                      }}
                    >
                      VidFast Servers ({VIDFAST_SERVERS.length})
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/20">
                  {menuTab === 'providers' ? (
                    <div className="space-y-1">
                      {STREAM_PROVIDERS.map((prov) => {
                        const isSelected = selectedProviderId === prov.id;
                        return (
                          <button
                            key={prov.id}
                            onClick={() => {
                              setSelectedProviderId(prov.id);
                              setShowServerMenu(false);
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-left text-xs transition-all flex items-center justify-between group ${
                              isSelected
                                ? 'bg-white/15 font-bold text-white ring-1 ring-white/20'
                                : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <div className="flex flex-col truncate pr-2">
                              <span
                                className="font-semibold"
                                style={{
                                  color: isSelected ? accentHex : undefined,
                                }}
                              >
                                {prov.name}
                              </span>
                              <span className="text-[10px] text-zinc-400 truncate">
                                {prov.description}
                              </span>
                            </div>
                            {prov.badge && (
                              <span
                                className="text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0"
                                style={{
                                  backgroundColor: isSelected ? `${accentHex}30` : 'rgba(255,255,255,0.08)',
                                  color: isSelected ? accentHex : '#a1a1aa',
                                }}
                              >
                                {prov.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}

                      {/* Direct HLS Stream */}
                      <div className="pt-1 mt-1 border-t border-white/5">
                        <button
                          onClick={() => {
                            setSelectedProviderId('hls');
                            setShowServerMenu(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-left text-xs transition-all flex items-center justify-between ${
                            selectedProviderId === 'hls'
                              ? 'bg-white/15 font-bold text-white ring-1 ring-white/20'
                              : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span
                              className="font-semibold"
                              style={{
                                color: selectedProviderId === 'hls' ? accentHex : undefined,
                              }}
                            >
                              Direct Stream (HLS)
                            </span>
                            <span className="text-[10px] text-zinc-400">Native Video / IPTV Channel</span>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                            Direct HLS
                          </span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1 py-1 mb-1 flex items-center justify-between">
                        <span>VidFast Cloud Mirrors</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          14 Active
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {VIDFAST_SERVERS.map((srv) => {
                          const isSelected = selectedProviderId === 'vidfast' && selectedServerId === srv.id;
                          return (
                            <button
                              key={srv.id}
                              onClick={() => {
                                setSelectedProviderId('vidfast');
                                setSelectedServerId(srv.id);
                                setShowServerMenu(false);
                              }}
                              className={`p-2 rounded-xl text-left text-xs transition-all flex flex-col ${
                                isSelected
                                  ? 'bg-white/15 font-bold text-white ring-1 ring-white/20'
                                  : 'text-zinc-300 hover:bg-white/5 hover:text-white bg-black/20'
                              }`}
                            >
                              <span
                                className="font-semibold truncate"
                                style={{
                                  color: isSelected ? accentHex : undefined,
                                }}
                              >
                                {srv.name}
                              </span>
                              <span className="text-[9px] text-zinc-400 truncate mt-0.5">{srv.tag}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowParty(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 backdrop-blur-md"
          >
            <Users className="h-3.5 w-3.5" style={{ color: accentHex }} />
            <span>Party</span>
          </button>
        </div>
      </div>

      {/* Floating Next Episode Card */}
      {isNearEnd && onNextEpisode && (
        <div className="absolute bottom-28 right-8 z-30 flex items-center gap-4 rounded-xl bg-[#131317]/95 p-4 border border-white/15 shadow-2xl backdrop-blur-md animate-fadeIn">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: accentHex }}>
              Up Next
            </span>
            <p className="text-sm font-semibold text-white">Next episode begins in {Math.ceil(remainingSeconds)}s</p>
          </div>
          <button
            onClick={onNextEpisode}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-black hover:bg-zinc-200 transition-all active:scale-95 shadow"
          >
            <FastForward className="h-4 w-4 fill-black" />
            <span>Play Now</span>
          </button>
        </div>
      )}

      {/* Picture & Sound Panel */}
      <PictureSoundPanel
        isOpen={showPanel}
        onClose={() => setShowPanel(false)}
        currentTime={currentTime}
      />

      {/* Watch Party Modal */}
      <WatchPartyModal
        isOpen={showParty}
        onClose={() => setShowParty(false)}
      />

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 flex flex-col p-3.5 sm:p-6 pb-6 sm:pb-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber Timeline */}
        <div
          onMouseMove={handleScrubberHover}
          onMouseLeave={() => setHoverTime(null)}
          className="relative mb-3 flex items-center cursor-pointer group"
        >
          {/* Buffered Background Bar */}
          <div className="absolute h-1 w-full rounded-full bg-white/20 group-hover:h-2 transition-all">
            <div
              className="h-full rounded-full bg-white/40"
              style={{ width: `${(bufferedTime / (duration || 1)) * 100}%` }}
            />
          </div>

          {/* Played Bar */}
          <div
            className="absolute h-1 rounded-full group-hover:h-2 transition-all pointer-events-none shadow"
            style={{
              width: `${(currentTime / (duration || 1)) * 100}%`,
              background: accentHex,
            }}
          />

          {/* Scrubber Input */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleScrubberChange}
            className="relative z-10 h-3 w-full opacity-0 cursor-pointer"
          />

          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              style={{ left: `${hoverPosition}%` }}
              className="absolute -top-8 -translate-x-1/2 rounded bg-black/90 px-2 py-0.5 text-xs font-mono text-white shadow pointer-events-none border border-white/20"
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={togglePlay}
              className="transition-transform hover:scale-110 active:scale-95 p-1"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-5 w-5 sm:h-6 sm:w-6" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-white" />}
            </button>

            <button
              onClick={() => seekBy(-10)}
              className="transition-transform hover:scale-110 active:scale-95 text-zinc-300 hover:text-white p-1"
              title="Seek back 10s"
            >
              <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <button
              onClick={() => seekBy(10)}
              className="transition-transform hover:scale-110 active:scale-95 text-zinc-300 hover:text-white p-1"
              title="Seek forward 10s"
            >
              <RotateCw className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Volume Control - desktop only */}
            <div className="hidden sm:flex items-center gap-2 group">
              <button onClick={toggleMute} className="transition-transform hover:scale-110 text-zinc-300 hover:text-white">
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : volume < 0.5 ? (
                  <Volume1 className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={e => handleVolumeChange(Number(e.target.value))}
                className="h-1 w-0 group-hover:w-20 transition-all duration-300 bg-white/30 rounded cursor-pointer"
                style={{ accentColor: accentHex }}
              />
            </div>

            <span className="text-[11px] sm:text-xs text-zinc-300 font-mono ml-1 sm:ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-4">
            {/* Picture & Sound Panel Button */}
            <button
              onClick={() => setShowPanel(!showPanel)}
              className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              title="Picture & Sound (Black bars, dialogue boost, subtitle sync) [D]"
              style={{ color: showPanel ? accentHex : undefined }}
            >
              <Sliders className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-0.5 text-xs font-semibold px-1.5 sm:px-2 py-1 rounded hover:bg-white/10 text-zinc-300 hover:text-white"
              >
                <span>{playbackSpeed}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-9 right-0 w-28 rounded-lg bg-[#18181d] border border-white/10 py-1 shadow-2xl">
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(s => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`w-full px-3 py-1.5 text-left text-xs hover:bg-white/10 ${
                        playbackSpeed === s ? 'font-bold' : 'text-zinc-300'
                      }`}
                      style={{ color: playbackSpeed === s ? accentHex : undefined }}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Picture-in-Picture Toggle */}
            <button
              onClick={togglePiP}
              className="transition-transform hover:scale-110 active:scale-95 text-zinc-300 hover:text-white p-1"
              title="Picture in Picture"
              aria-label="Picture in Picture"
            >
              <PictureInPicture className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="transition-transform hover:scale-110 active:scale-95 text-zinc-300 hover:text-white p-1"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Stream Interruption / Rebuffering & Retry Banner */}
      {(hasPlaybackError || isStalled) && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="max-w-md w-full bg-[#18181d] border border-white/10 rounded-2xl p-6 text-center shadow-2xl">
            <div
              className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 bg-white/5 border"
              style={{ borderColor: accentHex }}
            >
              <RefreshCw
                className={`w-6 h-6 ${isStalled ? 'animate-spin' : ''}`}
                style={{ color: accentHex }}
              />
            </div>
            <h4 className="text-white font-bold text-base mb-1">
              {hasPlaybackError ? 'Stream Interrupted' : 'Buffering Stream...'}
            </h4>
            <p className="text-zinc-400 text-xs mb-5">
              {playbackErrorMessage ||
                'Automatically optimizing adaptive bitrate (ABR) for connection stability.'}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleRetryPlayback}
                className="px-5 py-2 rounded-lg text-sm font-bold text-black bg-white hover:bg-zinc-200 transition-all active:scale-95 flex items-center gap-2 shadow"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Stream</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-300 hover:text-white bg-white/10 hover:bg-white/15 transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
