import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Radio,
  Sparkles,
  Compass,
  Heart,
  Loader2,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRadioStore } from '../store/radioStore';
import { useAccent } from '../context/AccentContext';
import { authStorage } from '../services/storage';

export const RadioSongPill: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { accentHex } = useAccent();

  const {
    currentStation,
    isPlaying,
    isLoadingStream,
    streamError,
    volume,
    isMuted,
    isPillVisible,
    togglePlay,
    stop,
    setVolume,
    toggleMute,
    setScreensaverOpen,
  } = useRadioStore();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const volumeRef = useRef<HTMLDivElement>(null);

  // Sync favorite state
  useEffect(() => {
    if (!currentStation) return;
    const favs = authStorage.getRadioFavorites();
    setIsFavorited(favs.includes(currentStation.stationuuid));
  }, [currentStation]);

  // Click outside to close volume popup
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(e.target as Node)) {
        setShowVolumeSlider(false);
      }
    };
    if (showVolumeSlider) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showVolumeSlider]);

  if (!isPillVisible || !currentStation) {
    return null;
  }

  const isRadioPage = location.pathname === '/radio';

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentStation) return;
    const nextState = authStorage.toggleRadioFavoriteStation(currentStation);
    setIsFavorited(nextState);
  };

  const handleOpenMap = () => {
    if (!isRadioPage) {
      navigate('/radio');
    }
  };

  return (
    <div
      className={`fixed z-[999] transition-all duration-300 ease-out select-none ${
        isRadioPage
          ? 'bottom-4 right-4 sm:bottom-6 sm:right-6'
          : 'bottom-20 right-3 sm:bottom-6 sm:right-6'
      }`}
    >
      <div
        className="flex items-center gap-2.5 sm:gap-3 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full bg-[#161a23]/90 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.65)] hover:border-white/20 transition-all text-white group"
        style={{
          boxShadow: `0 8px 30px -4px ${accentHex}33, 0 4px 16px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Animated Favicon / Disc */}
        <div
          onClick={handleOpenMap}
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-black/40 flex-shrink-0 cursor-pointer flex items-center justify-center border border-white/10"
        >
          {currentStation.favicon ? (
            <img
              src={currentStation.favicon}
              alt={currentStation.name}
              className={`w-full h-full object-cover transition-transform ${
                isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''
              }`}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : null}

          <div
            className={`absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] ${
              currentStation.favicon ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
            } transition-opacity`}
          >
            <Radio className="w-4 h-4 text-white drop-shadow" />
          </div>

          {/* Equalizer Wave Overlay when playing */}
          {isPlaying && (
            <div className="absolute inset-0 flex items-end justify-center gap-0.5 pb-1 bg-black/20 pointer-events-none">
              <span className="w-0.5 bg-emerald-400 rounded-full animate-[soundbar_0.8s_ease-in-out_infinite]" />
              <span className="w-0.5 bg-emerald-400 rounded-full animate-[soundbar_0.6s_ease-in-out_infinite_0.2s]" />
              <span className="w-0.5 bg-emerald-400 rounded-full animate-[soundbar_0.9s_ease-in-out_infinite_0.4s]" />
            </div>
          )}
        </div>

        {/* Station Metadata */}
        <div
          onClick={handleOpenMap}
          className="flex flex-col max-w-[120px] sm:max-w-[190px] cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-semibold truncate hover:underline text-white">
              {currentStation.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-zinc-400">
            <span className="truncate max-w-[90px] sm:max-w-[130px]">
              {currentStation.country || 'Global Radio'}
            </span>
            {currentStation.bitrate > 0 && (
              <span className="px-1 py-0.2 rounded bg-white/10 text-[9px] font-mono text-zinc-300">
                {currentStation.bitrate}k
              </span>
            )}
            {streamError && (
              <span className="text-amber-400 text-[10px] font-medium">Reconnecting...</span>
            )}
          </div>
        </div>

        {/* Play / Pause Toggle Button */}
        <button
          onClick={togglePlay}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md flex-shrink-0"
          style={{ backgroundColor: accentHex }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoadingStream ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4 text-white fill-white" />
          ) : (
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          )}
        </button>

        {/* Favorite Button */}
        <button
          onClick={handleToggleFav}
          className={`p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0 ${
            isFavorited
              ? 'text-rose-500 hover:text-rose-400'
              : 'text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
          title={isFavorited ? 'In Favorites' : 'Add to Favorites'}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Volume Control Button & Popover */}
        <div className="relative" ref={volumeRef}>
          <button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="p-1.5 sm:p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            title="Volume"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>

          {showVolumeSlider && (
            <div className="absolute bottom-full mb-3 right-0 p-3 rounded-2xl bg-[#1e2330]/95 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col items-center gap-2.5 w-12 animate-in fade-in zoom-in-95">
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 h-1.5 -rotate-90 origin-center my-10 accent-blue-500 cursor-pointer"
                style={{ accentColor: accentHex }}
              />
              <button
                onClick={toggleMute}
                className="text-[10px] text-zinc-400 hover:text-white uppercase font-bold tracking-wider"
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
            </div>
          )}
        </div>

        {/* Screensaver Launch Button */}
        <button
          onClick={() => setScreensaverOpen(true)}
          className="p-1.5 sm:p-2 rounded-full text-zinc-400 hover:text-amber-300 hover:bg-white/10 transition-colors flex-shrink-0"
          title="Open RPG / Low-Poly Screensaver"
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Open Map / Back to Radio Button */}
        {!isRadioPage && (
          <button
            onClick={handleOpenMap}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/10 hover:bg-white/20 text-zinc-200 transition-colors"
            title="Open Radio Browser Map"
          >
            <Compass className="w-3 h-3 text-cyan-400" />
            <span>Map</span>
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={stop}
          className="p-1 sm:p-1.5 rounded-full text-zinc-500 hover:text-zinc-200 hover:bg-white/10 transition-colors flex-shrink-0"
          title="Stop Radio"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
};
