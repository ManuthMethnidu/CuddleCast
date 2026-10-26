import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Plus,
  Check,
  ThumbsUp,
  Volume2,
  VolumeX,
  Clock,
  Calendar,
  Star,
  Sparkles,
} from 'lucide-react';
import Hls from 'hls.js';
import { MediaItem, Episode, CastMember } from '../types/schema';
import { api, DEFAULT_STREAM } from '../services/api';
import { authStorage } from '../services/supabase';

interface DetailModalProps {
  item: MediaItem;
  onClose: () => void;
  onPlay: (item: MediaItem, episode?: Episode) => void;
  onSelectRelated: (item: MediaItem) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  item,
  onClose,
  onPlay,
  onSelectRelated,
}) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [relatedItems, setRelatedItems] = useState<MediaItem[]>([]);
  const [inWatchlist, setInWatchlist] = useState(() => authStorage.isInWatchlist(item.id));
  const [isLiked, setIsLiked] = useState(() => authStorage.isLiked(item.id));
  const [isMuted, setIsMuted] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    // Load episodes, cast, and related items
    api.getEpisodes(item.id, selectedSeason).then(setEpisodes);
    api.getCast(item.id).then(setCast);
    api.searchMedia(item.title ? item.title.slice(0, 3) : 'a').then(results => {
      setRelatedItems(results.filter(r => r.id !== item.id).slice(0, 6));
    });
  }, [item, selectedSeason]);

  // Video trailer in modal header
  useEffect(() => {
    const video = videoRef.current;
    const streamUrl = item.trailerUrl || item.streamUrl || DEFAULT_STREAM;

    if (!video) return;

    if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
      const hls = new Hls({ maxMaxBufferLength: 20, enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [item]);

  const toggleWatchlist = () => {
    const state = authStorage.toggleWatchlist(item.id);
    setInWatchlist(state);
  };

  const toggleLike = () => {
    const state = authStorage.toggleLike(item.id);
    setIsLiked(state);
  };

  return (
    <div className="fixed inset-0 z-[500] flex justify-center overflow-y-auto bg-black/80 backdrop-blur-md p-0 sm:p-4 md:p-8 animate-fadeIn">
      {/* Modal Backdrop Click to Close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Modal Card Container */}
      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-none sm:rounded-2xl bg-[#0c1322] text-white shadow-[0_25px_60px_rgba(0,0,0,0.95)] border border-sky-500/20 my-auto">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-[#0c1322]/80 text-white hover:bg-slate-700 hover:text-sky-300 border border-slate-700/60 transition-all shadow-lg"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Video/Image Hero Header */}
        <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-slate-950">
          <video
            ref={videoRef}
            muted={isMuted}
            playsInline
            loop
            className="absolute inset-0 h-full w-full object-cover"
          />
          <img
            src={item.backdrop_path || item.poster_path}
            alt={item.title || item.name}
            className="absolute inset-0 h-full w-full object-cover -z-10"
          />

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-slate-950/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c1322]/80 via-transparent to-transparent" />

          {/* Header Action Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              {item.logo_path ? (
                <img
                  src={item.logo_path}
                  alt={item.title || item.name}
                  className="mb-4 max-h-16 max-w-xs object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]"
                />
              ) : (
                <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
                  {item.title || item.name}
                </h2>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onPlay(item)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 px-7 py-2.5 text-sm font-extrabold text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all hover:brightness-110 active:scale-95"
                >
                  <Play className="h-5 w-5 fill-white" /> Play
                </button>

                <button
                  onClick={toggleWatchlist}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-900/70 hover:border-sky-400 hover:text-sky-300 transition-all hover:scale-105 shadow"
                  title="My List"
                >
                  {inWatchlist ? <Check className="h-5 w-5 text-sky-400" /> : <Plus className="h-5 w-5" />}
                </button>

                <button
                  onClick={toggleLike}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-900/70 hover:border-sky-400 hover:text-sky-300 transition-all hover:scale-105 shadow"
                  title="Like"
                >
                  <ThumbsUp className={`h-5 w-5 ${isLiked ? 'fill-sky-400 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]' : ''}`} />
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-900/70 hover:border-sky-400 hover:text-sky-300 transition-all shadow"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="px-6 py-6 sm:px-8">
          {/* Metadata Split Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Left 2 Cols: Badges, Details & Synopsis */}
            <div className="md:col-span-2">
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-sm font-semibold text-slate-300">
                <span className="font-extrabold text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
                  {Math.round(item.vote_average * 10)}% Match
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Calendar className="h-4 w-4 text-sky-400" />
                  {item.release_date.split('-')[0]}
                </span>
                <span className="rounded border border-slate-700 bg-slate-900/60 px-1.5 text-xs text-slate-200">
                  TV-MA
                </span>
                <span className="rounded border border-sky-500/40 bg-sky-950/40 px-1.5 text-xs text-sky-300 font-bold">
                  4K Ultra HD
                </span>
                <span className="rounded border border-sky-500/40 bg-sky-950/40 px-1.5 text-xs text-sky-300 font-bold">
                  Dolby Atmos
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  {item.vote_average.toFixed(1)}
                </span>
              </div>

              <p className="mt-4 text-base leading-relaxed text-slate-200">
                {item.overview}
              </p>
            </div>

            {/* Right 1 Col: Cast & Category Credits */}
            <div className="flex flex-col gap-3 text-sm text-slate-400 border-l border-slate-800/80 pl-5">
              <div>
                <span className="text-slate-500 font-medium">Cast: </span>
                <span className="text-slate-200">
                  {cast.slice(0, 4).map(c => c.name).join(', ') || 'Omar Sy, Ludivine Sagnier, Antoine Gouy'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-medium">Genres: </span>
                <span className="text-slate-200">Cinema, Mystery, Sci-Fi, Thriller, Drama</span>
              </div>

              <div>
                <span className="text-slate-500 font-medium">Mood: </span>
                <span className="text-slate-200">Clever, Cozy, Suspenseful, Atmospheric</span>
              </div>
            </div>
          </div>

          {/* TV Episodes Section (if TV show or multi-episode) */}
          <div className="mt-10 border-t border-slate-800/80 pt-8">
            <div className="flex items-center justify-between pb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span>Episodes</span>
                <Sparkles className="h-4 w-4 text-sky-400" />
              </h3>
              <select
                value={selectedSeason}
                onChange={e => setSelectedSeason(Number(e.target.value))}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-sm text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500 transition-all"
              >
                <option value={1}>Season 1</option>
                <option value={2}>Season 2</option>
              </select>
            </div>

            <div className="flex flex-col divide-y divide-slate-800/80">
              {episodes.map(ep => (
                <div
                  key={ep.id}
                  onClick={() => onPlay(item, ep)}
                  className="group flex flex-col gap-4 py-4 sm:flex-row sm:items-center cursor-pointer transition-colors hover:bg-blue-950/30 rounded-xl px-3"
                >
                  <span className="text-xl font-bold text-slate-500 sm:w-6 text-center group-hover:text-sky-400 transition-colors">
                    {ep.episode_number}
                  </span>

                  <div className="relative h-24 w-44 flex-none overflow-hidden rounded-lg bg-slate-900 border border-slate-800">
                    <img
                      src={ep.still_path}
                      alt={ep.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-8 w-8 fill-white text-white drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white group-hover:text-sky-300 transition-colors">
                        {ep.title}
                      </h4>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-sky-400" /> {ep.runtime}m
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                      {ep.overview}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* More Like This Recommendation Grid (Inspired by jason-liu22/netflix-clone-react-typescript SimilarVideoCard) */}
          {relatedItems.length > 0 && (
            <div className="mt-10 border-t border-slate-800/80 pt-8">
              <h3 className="mb-4 text-xl font-bold flex items-center gap-2">
                <span>More Like This</span>
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {relatedItems.map(rel => {
                  const isInRelWatchlist = authStorage.isInWatchlist(rel.id);
                  return (
                    <div
                      key={rel.id}
                      onClick={() => onSelectRelated(rel)}
                      className="group cursor-pointer overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8),0_0_15px_rgba(56,189,248,0.2)] transition-all flex flex-col justify-between"
                    >
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                        <img
                          src={rel.backdrop_path || rel.poster_path}
                          alt={rel.title || rel.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Duration chip in top-right */}
                        <div className="absolute top-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold text-slate-200 backdrop-blur-sm">
                          1h 48m
                        </div>
                        {/* Title overlay at bottom of image */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 to-transparent p-3 pt-6">
                          <h5 className="font-bold text-sm text-white truncate drop-shadow">
                            {rel.title || rel.name}
                          </h5>
                        </div>
                      </div>

                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Match and age badges */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sky-400 font-extrabold text-xs">
                                {Math.round(rel.vote_average * 10)}% Match
                              </span>
                              <span className="rounded border border-slate-700 bg-slate-800/60 px-1 text-[10px] text-slate-300">
                                16+
                              </span>
                              <span className="text-xs text-slate-400">
                                {rel.release_date.split('-')[0]}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                authStorage.toggleWatchlist(rel.id);
                                // Force re-render of this item
                                setRelatedItems([...relatedItems]);
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-white hover:border-sky-400 hover:text-sky-300 transition-all hover:scale-110"
                              title="Add to Watchlist"
                            >
                              {isInRelWatchlist ? (
                                <Check className="h-3.5 w-3.5 text-sky-400" />
                              ) : (
                                <Plus className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                            {rel.overview}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* About Section Footer */}
          <div className="mt-10 border-t border-slate-800/80 pt-6 text-sm text-slate-400">
            <h4 className="text-base font-bold text-white mb-2">
              About {item.title || item.name}
            </h4>
            <p>
              <span className="text-slate-500 font-medium">Maturity Rating: </span>
              Recommended for ages 16 and up. Streamed in 4K Ultra HD on CuddleCast.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
