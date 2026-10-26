import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Play, Plus, Check, ThumbsUp, ChevronDown } from 'lucide-react';
import Hls from 'hls.js';
import { MediaItem } from '../types/schema';
import { authStorage } from '../services/supabase';
import { DEFAULT_STREAM } from '../services/api';

interface HoverCardPortalProps {
  item: MediaItem;
  rect: DOMRect;
  onClose: () => void;
  onPlay: (item: MediaItem) => void;
  onMoreInfo: (item: MediaItem) => void;
}

export const HoverCardPortal: React.FC<HoverCardPortalProps> = ({
  item,
  rect,
  onClose,
  onPlay,
  onMoreInfo,
}) => {
  const [inWatchlist, setInWatchlist] = useState(() => authStorage.isInWatchlist(item.id));
  const [isLiked, setIsLiked] = useState(() => authStorage.isLiked(item.id));
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Position calculations with screen boundary clamping
  const cardWidth = 330;
  const padding = 16;

  let left = rect.left + rect.width / 2 - cardWidth / 2;
  let top = rect.top + window.scrollY - 30;

  if (left < padding) left = padding;
  if (left + cardWidth > window.innerWidth - padding) {
    left = window.innerWidth - cardWidth - padding;
  }

  // Auto-play mini trailer preview in hover portal
  useEffect(() => {
    const video = videoRef.current;
    const streamUrl = item.trailerUrl || item.streamUrl || DEFAULT_STREAM;

    if (!video) return;

    if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
      const hls = new Hls({ maxMaxBufferLength: 10, enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().then(() => setIsVideoLoaded(true)).catch(() => {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().then(() => setIsVideoLoaded(true)).catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [item]);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = authStorage.toggleWatchlist(item.id);
    setInWatchlist(updated);
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = authStorage.toggleLike(item.id);
    setIsLiked(updated);
  };

  return ReactDOM.createPortal(
    <div
      onMouseLeave={onClose}
      style={{
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        width: `${cardWidth}px`,
      }}
      className="z-[900] overflow-hidden rounded-xl bg-[#0c1322] shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(37,99,235,0.25)] border border-sky-500/30 transition-all duration-300 transform scale-100 animate-fadeIn"
    >
      {/* Video or Image Preview Header */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-950">
        <img
          src={item.backdrop_path || item.poster_path}
          alt={item.title || item.name}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            isVideoLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <video
          ref={videoRef}
          muted
          playsInline
          loop
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            isVideoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-transparent to-transparent" />
      </div>

      {/* Floating Card Controls & Metadata Body */}
      <div className="p-4">
        {/* Action Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPlay(item)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-950 shadow-[0_2px_10px_rgba(255,255,255,0.3)] transition-transform hover:scale-110 hover:bg-sky-100 active:scale-95"
              title="Play"
            >
              <Play className="h-4 w-4 fill-slate-950" />
            </button>

            <button
              onClick={toggleWatchlist}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-900/80 text-white transition-all hover:border-sky-400 hover:text-sky-300 hover:scale-110 shadow"
              title={inWatchlist ? 'Remove from My List' : 'Add to My List'}
            >
              {inWatchlist ? <Check className="h-4 w-4 text-sky-400" /> : <Plus className="h-4 w-4" />}
            </button>

            <button
              onClick={toggleLike}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-900/80 text-white transition-all hover:border-sky-400 hover:text-sky-300 hover:scale-110 shadow"
              title={isLiked ? 'Liked' : 'Like'}
            >
              <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-sky-400 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]' : ''}`} />
            </button>
          </div>

          <button
            onClick={() => onMoreInfo(item)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-900/80 text-white transition-all hover:border-sky-400 hover:text-sky-300 hover:scale-110 shadow"
            title="Episode & Info"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>

        {/* Title */}
        <h4 className="mt-3 font-bold text-white text-base truncate">
          {item.title || item.name}
        </h4>

        {/* Match Percentage & Badges */}
        <div className="mt-2 flex items-center gap-2 text-xs font-semibold">
          <span className="text-sky-400 font-bold drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]">
            {Math.round(item.vote_average * 10)}% Match
          </span>
          <span className="rounded border border-slate-700 bg-slate-900/60 px-1.5 text-[10px] text-slate-300">
            TV-MA
          </span>
          <span className="text-slate-400">
            {item.media_type === 'tv' ? 'Series' : '2h 14m'}
          </span>
          <span className="rounded border border-sky-500/40 bg-sky-950/40 px-1 text-[10px] font-bold text-sky-300">
            HD
          </span>
        </div>

        {/* Genres Pill List */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
          <span>Action</span>
          <span className="text-slate-600">•</span>
          <span>Sci-Fi</span>
          <span className="text-slate-600">•</span>
          <span>Drama</span>
        </div>
      </div>
    </div>,
    document.getElementById('portal-root') || document.body
  );
};
