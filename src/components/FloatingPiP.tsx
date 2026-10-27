import React from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, Volume2, VolumeX, Maximize2, X } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useAccent } from '../context/AccentContext';

interface FloatingPiPProps {
  onExpand: () => void;
  videoElement?: HTMLVideoElement | null;
}

export const FloatingPiP: React.FC<FloatingPiPProps> = ({
  onExpand,
}) => {
  const { accentHex } = useAccent();
  const {
    currentMedia,
    activeChannel,
    isPlaying,
    isPiP,
    isMuted,
    setPiP,
    setPlaying,
    toggleMute,
    closePlayer,
  } = usePlayerStore();

  if (!isPiP || (!currentMedia && !activeChannel)) {
    return null;
  }

  const title =
    currentMedia?.title || currentMedia?.name || activeChannel?.name || 'Now Playing';
  const backdrop =
    currentMedia?.backdrop_path ||
    currentMedia?.poster_path ||
    activeChannel?.logo ||
    '';

  return createPortal(
    <div
      role="region"
      aria-label="Picture in Picture Floating Player"
      className="fixed bottom-6 right-6 z-[9999] w-80 sm:w-96 rounded-xl overflow-hidden shadow-2xl border border-white/20 bg-[#0b0b0d]/95 backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      {/* Video Container / Thumbnail */}
      <div className="relative aspect-video w-full bg-black overflow-hidden group">
        {backdrop && (
          <img
            src={backdrop}
            alt={title}
            className="w-full h-full object-cover opacity-80"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

        {/* Live indicator or title */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-white/10 backdrop-blur-sm">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: accentHex }}
          />
          <span className="text-[11px] font-semibold text-white tracking-wider uppercase truncate max-w-[140px]">
            {title}
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setPiP(false);
            closePlayer();
          }}
          className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          title="Close player"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Floating Controls Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Mute Toggle */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-black/60 hover:bg-white/20 text-white transition-transform hover:scale-110"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label="Toggle mute"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={() => setPlaying(!isPlaying)}
            className="p-3 rounded-full text-black transition-transform hover:scale-110"
            style={{ backgroundColor: accentHex }}
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label="Toggle play"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current text-white" />
            ) : (
              <Play className="w-5 h-5 fill-current text-white ml-0.5" />
            )}
          </button>

          {/* Expand to Main Player */}
          <button
            onClick={() => {
              setPiP(false);
              onExpand();
            }}
            className="p-2 rounded-full bg-black/60 hover:bg-white/20 text-white transition-transform hover:scale-110"
            title="Expand to Fullscreen"
            aria-label="Expand"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
