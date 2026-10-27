import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  Server,
  ChevronDown,
  RefreshCw,
  Users,
  Maximize2,
  Minimize2,
  AlertTriangle,
  SkipForward,
} from 'lucide-react';
import Hls from 'hls.js';
import { Episode, MediaItem } from '../types/schema';
import { authStorage } from '../services/storage';
import { useAccent } from '../context/AccentContext';
import { usePlayerStore } from '../store/playerStore';
import { useSettingsStore } from '../store/settingsStore';
import { WatchPartyModal } from './WatchPartyModal';
import {
  STREAM_PROVIDERS,
  VIDFAST_SERVERS,
  ProviderCategory,
  getNextProvider,
  getProvidersByCategory,
} from '../services/providers';

interface VideoPlayerProps {
  item: MediaItem;
  episode?: Episode;
  initialProviderId?: string;
  onClose: () => void;
  onNextEpisode?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  item,
  episode,
  initialProviderId,
  onClose,
  onNextEpisode: _onNextEpisode,
}) => {
  const { accentHex } = useAccent();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const {
    setCurrentTime: setStoreTime,
    setDuration: setStoreDuration,
    setPlaying: setStorePlaying,
  } = usePlayerStore();

  // Determine if this is an explicit direct .m3u8 live IPTV feed (NOT TMDB movies/tv)
  const isDirectHlsStream = Boolean(
    item.overview === 'Live match broadcast' ||
    item.overview === 'Live IPTV stream' ||
    (item.streamUrl &&
      item.streamUrl.includes('.m3u8') &&
      item.media_type !== 'movie' &&
      item.media_type !== 'tv')
  );

  const { defaultProvider } = useSettingsStore();

  const [selectedProviderId, setSelectedProviderId] = useState<string>(() => {
    if (isDirectHlsStream) return 'hls';
    if (initialProviderId && STREAM_PROVIDERS.some((p) => p.id === initialProviderId && p.id !== 'vidfast')) {
      return initialProviderId;
    }
    if (defaultProvider && defaultProvider !== 'vidfast' && STREAM_PROVIDERS.some((p) => p.id === defaultProvider)) {
      return defaultProvider;
    }
    return 'vidlink';
  });

  const [selectedServerId, setSelectedServerId] = useState<string>('Alpha');
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [menuTab, setMenuTab] = useState<ProviderCategory | 'vidfast-nodes'>('fastest');
  const [showParty, setShowParty] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStreamError, setHasStreamError] = useState(false);

  const hideTimerRef = useRef<number | null>(null);

  const activeProvider = useMemo(
    () => STREAM_PROVIDERS.find((p) => p.id === selectedProviderId),
    [selectedProviderId]
  );

  const nextProvider = useMemo(
    () => getNextProvider(selectedProviderId),
    [selectedProviderId]
  );

  // Compute embed URL for the active provider
  const embedUrl = useMemo(() => {
    if (!activeProvider || selectedProviderId === 'hls') return '';
    const isTv = item.media_type === 'tv' || Boolean(episode);

    if (isTv) {
      return activeProvider.getTvUrl(
        item.id,
        episode?.season_number || 1,
        episode?.episode_number || 1,
        {
          server: selectedServerId,
          themeHex: accentHex,
        }
      );
    }

    return activeProvider.getMovieUrl(item.id, {
      server: selectedServerId,
      themeHex: accentHex,
    });
  }, [activeProvider, selectedProviderId, selectedServerId, item, episode, accentHex]);

  // Reset error and show loading when provider, server or reload changes
  useEffect(() => {
    setHasStreamError(false);
    setIsIframeLoading(true);
  }, [selectedProviderId, selectedServerId, reloadKey]);

  // Direct HLS initialization for IPTV / .m3u8 live channels only
  const hlsStreamUrl = episode?.streamUrl || item.streamUrl || '';
  useEffect(() => {
    if (selectedProviderId !== 'hls' || !videoRef.current) return;

    if (!hlsStreamUrl) {
      setHasStreamError(true);
      return;
    }

    const video = videoRef.current;
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });
      hlsRef.current = hls;
      hls.loadSource(hlsStreamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.error('Fatal HLS Stream error:', data);
          setHasStreamError(true);
        }
      });
      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsStreamUrl;
      video.play().catch(() => {});
      video.onerror = () => setHasStreamError(true);
    }
  }, [selectedProviderId, hlsStreamUrl, reloadKey]);

  // Listen to postMessage events from VidFast / VidLink for background progress sync
  useEffect(() => {
    const handlePostMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data) return;

        const payload = data.data || data;
        if (data.type === 'timeupdate' || data.event === 'timeupdate') {
          if (typeof payload.currentTime === 'number') {
            setStoreTime(payload.currentTime);
            if (payload.duration) {
              setStoreDuration(payload.duration);
              authStorage.saveProgress(item.id, payload.currentTime, payload.duration, item);
            }
          }
        } else if (data.type === 'play' || data.event === 'play') {
          setStorePlaying(true);
        } else if (data.type === 'pause' || data.event === 'pause') {
          setStorePlaying(false);
        }
      } catch {
        // Ignore unparseable third-party messages
      }
    };

    window.addEventListener('message', handlePostMessage);
    return () => window.removeEventListener('message', handlePostMessage);
  }, [item, setStoreTime, setStoreDuration, setStorePlaying]);

  // Ensure playback progress is recorded under the active user even for embed providers without postMessage
  useEffect(() => {
    const existing = authStorage.getProgress(item.id);
    if (!existing) {
      authStorage.saveProgress(item.id, 15, 7200, item);
    }
    const heartbeat = setInterval(() => {
      authStorage.updateWatchHeartbeat(item.id, item);
    }, 15000);
    return () => clearInterval(heartbeat);
  }, [item]);

  // Auto-hide top bar after mouse inactivity (ONLY when not loading and not in menus)
  const handleMouseMove = useCallback(() => {
    setShowTopBar(true);
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = window.setTimeout(() => {
      if (!showServerMenu && !showParty && !hasStreamError && !isIframeLoading) {
        setShowTopBar(false);
      }
    }, 3800);
  }, [showServerMenu, showParty, hasStreamError, isIframeLoading]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  // Keyboard controls: ESC to close, F for fullscreen, S for switch next server
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showServerMenu) {
          setShowServerMenu(false);
        } else if (showParty) {
          setShowParty(false);
        } else {
          onClose();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 's' || e.key === 'S') {
        handleFailoverNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showServerMenu, showParty, onClose, nextProvider]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleReload = () => {
    setReloadKey((k) => k + 1);
  };

  const handleFailoverNext = () => {
    setSelectedProviderId(nextProvider.id);
    setReloadKey((k) => k + 1);
  };

  const currentTabProviders = useMemo(() => {
    if (menuTab === 'vidfast-nodes') return [];
    return getProvidersByCategory(menuTab);
  }, [menuTab]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black overflow-hidden select-none"
    >
      {/* 1. Fast Fullscreen Player Frame or Real Error Display */}
      {hasStreamError ? (
        <div className="flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto space-y-4 animate-fadeIn">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Stream Unavailable on {activeProvider?.name || 'Current Server'}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Could not establish a stable connection with this streaming host. Click below to automatically failover to the next active cloud mirror.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleFailoverNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-black bg-white hover:bg-white/90 active:scale-95 transition-all shadow-lg"
            >
              <SkipForward className="h-4 w-4 fill-black" />
              <span>Switch to {nextProvider.name}</span>
            </button>

            <button
              onClick={handleReload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-white/10 hover:bg-white/20 active:scale-95 transition-all border border-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Server</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-semibold text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      ) : selectedProviderId === 'hls' ? (
        <video
          ref={videoRef}
          controls
          className="h-full w-full object-contain bg-black"
          playsInline
        />
      ) : (
        <>
          {/* Loading Spinner & Status Overlay */}
          {isIframeLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 transition-opacity duration-300">
              <div className="flex flex-col items-center gap-4 p-6 text-center max-w-sm">
                <div
                  className="h-12 w-12 rounded-full border-4 border-t-transparent animate-spin shadow-2xl"
                  style={{ borderColor: accentHex, borderTopColor: 'transparent' }}
                />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white tracking-wide flex items-center justify-center gap-2">
                    <Server className="h-4 w-4" style={{ color: accentHex }} />
                    <span>Connecting to {activeProvider?.name || 'Streaming Host'}...</span>
                  </p>
                  <p className="text-xs text-zinc-400">
                    Loading high-speed stream for <span className="text-zinc-200 font-semibold">{item.title || item.name}</span>
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={handleFailoverNext}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-zinc-300 hover:text-white border border-white/15 transition-all active:scale-95 shadow-md"
                  >
                    <SkipForward className="h-3.5 w-3.5" style={{ color: accentHex }} />
                    <span>Slow loading? Try {nextProvider.name}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <iframe
            key={`${selectedProviderId}-${selectedServerId}-${reloadKey}-${item.id}`}
            src={embedUrl}
            className="h-full w-full border-0 bg-black"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            title={item.title || item.name}
            onLoad={() => setIsIframeLoading(false)}
            onError={() => {
              setIsIframeLoading(false);
              setHasStreamError(true);
            }}
          />
        </>
      )}

      {/* 2. Sleek Floating Top Bar (Stays visible while loading or in menus) */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3 sm:p-5 bg-gradient-to-b from-black/95 via-black/70 to-transparent transition-opacity duration-300 pointer-events-auto ${
          showTopBar || isIframeLoading || showServerMenu || hasStreamError
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Left: Back Button & Title Info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all shadow-lg"
            title="Close Player (Esc)"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex flex-col truncate">
            <h2 className="text-sm sm:text-base font-bold text-white truncate drop-shadow-md">
              {item.title || item.name}
            </h2>
            {episode ? (
              <p className="text-[11px] sm:text-xs text-zinc-300 truncate font-medium">
                Season {episode.season_number} • Episode {episode.episode_number}: {episode.title}
              </p>
            ) : item.release_date ? (
              <p className="text-[11px] sm:text-xs text-zinc-400">
                {item.release_date.split('-')[0]} • {item.media_type === 'tv' ? 'Series' : 'Movie'}
              </p>
            ) : null}
          </div>
        </div>

        {/* Right: Controls, Server Switcher, Auto-Failover */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Auto-Failover to Next Server */}
          <button
            onClick={handleFailoverNext}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 hover:bg-white/20 border border-white/15 text-xs font-semibold text-zinc-200 backdrop-blur-md transition-all active:scale-95 shadow-lg"
            title={`Auto-switch to next server: ${nextProvider.name} (Key: S)`}
          >
            <SkipForward className="h-3.5 w-3.5" style={{ color: accentHex }} />
            <span>Next Server</span>
          </button>

          {/* Provider / Server Selector Button */}
          <div className="relative">
            <button
              onClick={() => setShowServerMenu(!showServerMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-xs font-semibold text-white backdrop-blur-md transition-all active:scale-95 shadow-lg"
              title="Change Streaming Provider / Server"
            >
              <Server className="h-3.5 w-3.5" style={{ color: accentHex }} />
              <span className="hidden sm:inline">
                {activeProvider?.name || 'Servers'}
              </span>
              <span className="sm:hidden">
                {activeProvider?.name || 'Server'}
              </span>
              <ChevronDown
                className={`h-3 w-3 text-zinc-400 transition-transform ${
                  showServerMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Provider / Server Categorized Dropdown Menu */}
            {showServerMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-11 right-0 w-84 sm:w-96 max-h-[480px] overflow-hidden rounded-2xl bg-[#141419]/98 border border-white/15 shadow-2xl backdrop-blur-2xl z-50 flex flex-col"
              >
                {/* Categorized Tabs Header */}
                <div className="p-2 border-b border-white/10 bg-black/50">
                  <div className="grid grid-cols-5 gap-1 bg-white/5 p-1 rounded-xl text-[10px] font-bold">
                    <button
                      onClick={() => setMenuTab('fastest')}
                      className={`py-1.5 px-0.5 rounded-lg transition-all text-center truncate ${
                        menuTab === 'fastest'
                          ? 'bg-white/20 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                      style={{
                        color: menuTab === 'fastest' ? accentHex : undefined,
                      }}
                    >
                      Fastest
                    </button>
                    <button
                      onClick={() => setMenuTab('ott')}
                      className={`py-1.5 px-0.5 rounded-lg transition-all text-center truncate ${
                        menuTab === 'ott'
                          ? 'bg-white/20 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                      style={{
                        color: menuTab === 'ott' ? accentHex : undefined,
                      }}
                    >
                      OTT
                    </button>
                    <button
                      onClick={() => setMenuTab('international')}
                      className={`py-1.5 px-0.5 rounded-lg transition-all text-center truncate ${
                        menuTab === 'international'
                          ? 'bg-white/20 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                      style={{
                        color: menuTab === 'international' ? accentHex : undefined,
                      }}
                    >
                      Dubs
                    </button>
                    <button
                      onClick={() => setMenuTab('backup')}
                      className={`py-1.5 px-0.5 rounded-lg transition-all text-center truncate ${
                        menuTab === 'backup'
                          ? 'bg-white/20 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                      style={{
                        color: menuTab === 'backup' ? accentHex : undefined,
                      }}
                    >
                      Backup
                    </button>
                    <button
                      onClick={() => setMenuTab('vidfast-nodes')}
                      className={`py-1.5 px-0.5 rounded-lg transition-all text-center truncate ${
                        menuTab === 'vidfast-nodes'
                          ? 'bg-white/20 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                      style={{
                        color: menuTab === 'vidfast-nodes' ? accentHex : undefined,
                      }}
                    >
                      Nodes
                    </button>
                  </div>
                </div>

                {/* Tab List */}
                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/20 max-h-[360px]">
                  {menuTab === 'vidfast-nodes' ? (
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1 py-1 mb-1.5 flex items-center justify-between">
                        <span>VidFast Regional Mirrors</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          14 Nodes Online
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {VIDFAST_SERVERS.map((srv) => {
                          const isSelected =
                            selectedProviderId === 'vidfast' && selectedServerId === srv.id;
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
                              <span className="text-[9px] text-zinc-400 truncate mt-0.5">
                                {srv.tag}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {currentTabProviders.map((prov) => {
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
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="font-semibold truncate"
                                  style={{
                                    color: isSelected ? accentHex : undefined,
                                  }}
                                >
                                  {prov.name}
                                </span>
                                {prov.countryCode && (
                                  <span className="text-[9px] text-zinc-400 font-mono">
                                    [{prov.countryCode}]
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-400 truncate">
                                {prov.description}
                              </span>
                            </div>
                            {prov.badge && (
                              <span
                                className="text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0"
                                style={{
                                  backgroundColor: isSelected
                                    ? `${accentHex}30`
                                    : 'rgba(255,255,255,0.08)',
                                  color: isSelected ? accentHex : '#a1a1aa',
                                }}
                              >
                                {prov.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Reload Frame Button */}
          <button
            onClick={handleReload}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 hover:bg-white/20 border border-white/15 text-white backdrop-blur-md transition-all active:scale-95 shadow-lg"
            title="Reload Embed"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          {/* Watch Party Button */}
          <button
            onClick={() => setShowParty(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white backdrop-blur-md transition-all active:scale-95 shadow-lg"
            title="Start Watch Party"
          >
            <Users className="h-3.5 w-3.5" style={{ color: accentHex }} />
            <span className="hidden sm:inline">Party</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 hover:bg-white/20 border border-white/15 text-white backdrop-blur-md transition-all active:scale-95 shadow-lg"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Watch Party Modal */}
      {showParty && (
        <WatchPartyModal
          isOpen={showParty}
          onClose={() => setShowParty(false)}
        />
      )}
    </div>
  );
};
