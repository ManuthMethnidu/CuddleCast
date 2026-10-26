import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Play, Plus, Check, ThumbsUp, ChevronDown } from 'lucide-react';
import Hls from 'hls.js';
import { MediaItem } from '../types/schema';
import { authStorage } from '../services/supabase';
import { DEFAULT_STREAM } from '../services/api';
import { useAccent } from '../context/AccentContext';

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
  const { accentHex } = useAccent();
  const [inWatchlist, setInWatchlist] = useState(() => authStorage.isInWatchlist(item.id));
  const [isLiked, setIsLiked] = useState(() => authStorage.isLiked(item.id));
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Position calculations with screen boundary clamping
  const cardWidth = 340;
  const padding = 16;

  let left = rect.left + rect.width / 2 - cardWidth / 2;
  let top = rect.top + window.scrollY - 30;

  if (left < padding) left = padding;
  if (left + cardWidth > window.innerWidth - padding) {
    left = window.innerWidth - cardWidth - padding;
  }

  // Mini preview playback (deferred by 700ms to avoid freezing on rapid hover)
  useEffect(() => {
    const video = videoRef.current;
    const streamUrl = item.trailerUrl || item.streamUrl || DEFAULT_STREAM;
    let timer: number | null = null;

    if (!video) return;

    timer = window.setTimeout(() => {
      if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
        const hls = new Hls({ maxMaxBufferLength: 4, enableWorker: true });
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
    }, 700);

    return () => {
      if (timer) clearTimeout(timer);
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
      className="z-[900] group/preview animate-fadeIn select-none"
    >
      {/* DX.BI Artwork Aura Glow */}
      <div
        className="dx-preview-aura"
        style={{
          backgroundImage: `url(${item.backdrop_path || item.poster_path})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Main Inner Card Container */}
      <div className="relative overflow-hidden rounded-lg bg-[#181818] shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/10">
        {/* Media / Video Header */}
        <div
          onClick={() => onPlay(item)}
          className="relative aspect-video w-full overflow-hidden bg-[#222226] cursor-pointer"
        >
          <img
            src={item.backdrop_path || item.poster_path}
            alt={item.title || item.name}
            decoding="async"
            className={`h-full w-full object-cover transition-opacity duration-500 ${
              isVideoLoaded ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ animation: 'dx-preview-zoom 6s ease-out both' }}
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

          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent pointer-events-none" />

          {/* Title on Media bottom */}
          <div className="absolute bottom-2.5 left-3 right-3 z-10">
            <h4 className="font-extrabold text-base text-white truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {item.title || item.name}
            </h4>
          </div>
        </div>

        {/* Action Controls & Details Body */}
        <div className="p-3.5 space-y-3">
          {/* Action Buttons Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPlay(item)}
              className="dx-round is-primary"
              title="Play"
            >
              <Play className="h-4 w-4 fill-black text-black ml-0.5" />
            </button>

            <button
              onClick={toggleWatchlist}
              className="dx-round"
              title={inWatchlist ? 'Remove from Library' : 'Add to Library'}
            >
              {inWatchlist ? (
                <Check className="h-4 w-4" style={{ color: accentHex }} />
              ) : (
                <Plus className="h-4 w-4 text-white" />
              )}
            </button>

            <button
              onClick={toggleLike}
              className="dx-round"
              title={isLiked ? 'Liked' : 'Like'}
            >
              <ThumbsUp
                className="h-4 w-4"
                style={{
                  color: isLiked ? accentHex : '#fff',
                  fill: isLiked ? accentHex : 'none',
                }}
              />
            </button>

            <button
              onClick={() => onMoreInfo(item)}
              className="dx-round ml-auto"
              title="Details & Episodes"
            >
              <ChevronDown className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Metadata Row */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="dx-match font-bold text-emerald-400">
              {Math.round(item.vote_average * 10)}% Match
            </span>
            <span className="dx-imdb">
              <i>IMDb</i>
              <span>{item.vote_average.toFixed(1)}</span>
            </span>
            <span className="dx-pill">TV-MA</span>
            <span className="dx-pill">HD</span>
            <span className="text-zinc-400 font-normal">
              {item.media_type === 'tv' ? 'Series' : '2h 14m'}
            </span>
          </div>

          {/* Genre Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <span>Action</span>
            <span className="dx-sep" />
            <span>Thriller</span>
            <span className="dx-sep" />
            <span>Mystery</span>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('portal-root') || document.body
  );
};
