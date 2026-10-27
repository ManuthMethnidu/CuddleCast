import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  Server,
  ChevronDown,
  RefreshCw,
  Users,
  Maximize2,
  Minimize2,
  Tv,
} from 'lucide-react';
import Hls from 'hls.js';
import { Episode, MediaItem } from '../types/schema';
import { authStorage } from '../services/supabase';
import { DEFAULT_STREAM } from '../services/api';
import { useAccent } from '../context/AccentContext';
import { usePlayerStore } from '../store/playerStore';
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

  // Determine if this is a direct .m3u8 / live IPTV feed
  const isDirectHlsStream = Boolean(
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
  const [showParty, setShowParty] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hideTimerRef = useRef<number | null>(null);

  const activeProvider = useMemo(
    () => STREAM_PROVIDERS.find((p) => p.id === selectedProviderId),
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

  // Direct HLS initialization for IPTV / .m3u8 streams
  const hlsStreamUrl = episode?.streamUrl || item.streamUrl || DEFAULT_STREAM;
  useEffect(() => {
    if (selectedProviderId !== 'hls' || !videoRef.current) return;

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
      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsStreamUrl;
      video.play().catch(() => {});
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
              authStorage.saveProgress(item.id, payload.currentTime, payload.duration);
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
  }, [item.id, setStoreTime, setStoreDuration, setStorePlaying]);

  // Auto-hide top bar after mouse inactivity
  const handleMouseMove = useCallback(() => {
    setShowTopBar(true);
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = window.setTimeout(() => {
      if (!showServerMenu && !showParty) {
        setShowTopBar(false);
      }
    }, 3200);
  }, [showServerMenu, showParty]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  // Keyboard controls: ESC to close, F for fullscreen
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showServerMenu, showParty, onClose]);

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

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black overflow-hidden select-none"
    >
      {/* 1. Fast Fullscreen Player Frame */}
      {selectedProviderId === 'hls' ? (
        <video
          ref={videoRef}
          controls
          className="h-full w-full object-contain bg-black"
          playsInline
        />
      ) : (
        <iframe
          key={`${selectedProviderId}-${selectedServerId}-${reloadKey}-${item.id}`}
          src={embedUrl}
          className="h-full w-full border-0 bg-black"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          title={item.title || item.name}
        />
      )}

      {/* 2. Sleek Floating Top Bar (Auto-hides on inactivity so built-in controls remain 100% accessible) */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3 sm:p-5 bg-gradient-to-b from-black/85 via-black/40 to-transparent transition-opacity duration-300 pointer-events-auto ${
          showTopBar ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Left: Back Button & Title Info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all shadow-lg"
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

        {/* Right: Controls & Server Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Provider / Server Selector Button */}
          <div className="relative">
            <button
              onClick={() => setShowServerMenu(!showServerMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-xs font-semibold text-white backdrop-blur-md transition-all active:scale-95 shadow-lg"
              title="Change Streaming Provider / Server"
            >
              <Server className="h-3.5 w-3.5" style={{ color: accentHex }} />
              <span className="hidden sm:inline">
                {selectedProviderId === 'vidfast'
                  ? `VidFast: ${selectedServerId}`
                  : activeProvider?.name || 'Provider'}
              </span>
              <ChevronDown className={`h-3 w-3 text-zinc-400 transition-transform ${showServerMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Provider / Server Dropdown Menu */}
            {showServerMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-11 right-0 w-80 max-h-[440px] overflow-hidden rounded-2xl bg-[#141419]/98 border border-white/15 shadow-2xl backdrop-blur-2xl z-50 flex flex-col"
              >
                {/* Tab Header */}
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

                {/* Tab List */}
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
                              className="font-semibold flex items-center gap-1.5"
                              style={{
                                color: selectedProviderId === 'hls' ? accentHex : undefined,
                              }}
                            >
                              <Tv className="h-3.5 w-3.5" />
                              Direct Stream (HLS)
                            </span>
                            <span className="text-[10px] text-zinc-400">Native Video / Live IPTV</span>
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
                        <span>VidFast Regional Mirrors</span>
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

          {/* Quick Reload Frame Button */}
          <button
            onClick={handleReload}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 hover:bg-white/20 border border-white/15 text-white backdrop-blur-md transition-all active:scale-95 shadow-lg"
            title="Reload Embed"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          {/* Watch Party Button */}
          <button
            onClick={() => setShowParty(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white backdrop-blur-md transition-all active:scale-95 shadow-lg"
            title="Start Watch Party"
          >
            <Users className="h-3.5 w-3.5" style={{ color: accentHex }} />
            <span className="hidden sm:inline">Party</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 hover:bg-white/20 border border-white/15 text-white backdrop-blur-md transition-all active:scale-95 shadow-lg"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
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
