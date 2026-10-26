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
    <div className="fixed inset-0 z-[500] flex justify-center overflow-y-auto bg-black/75 backdrop-blur-sm p-0 sm:p-4 md:p-8 animate-fadeIn">
      {/* Modal Backdrop Click to Close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Modal Card Container */}
      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-none sm:rounded-xl bg-[#181818] text-white shadow-2xl border border-zinc-800 my-auto">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-[#181818]/80 text-white hover:bg-zinc-700 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Video/Image Hero Header */}
        <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-black">
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

          {/* Header Action Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              {item.logo_path ? (
                <img
                  src={item.logo_path}
                  alt={item.title || item.name}
                  className="mb-4 max-h-16 max-w-xs object-contain"
                />
              ) : (
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl drop-shadow-md">
                  {item.title || item.name}
                </h2>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onPlay(item)}
                  className="flex items-center gap-2 rounded bg-white px-6 py-2 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95"
                >
                  <Play className="h-5 w-5 fill-black" /> Play
                </button>

                <button
                  onClick={toggleWatchlist}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-400 bg-zinc-900/60 hover:border-white transition-all hover:scale-105"
                  title="My List"
                >
                  {inWatchlist ? <Check className="h-5 w-5 text-emerald-400" /> : <Plus className="h-5 w-5" />}
                </button>

                <button
                  onClick={toggleLike}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-400 bg-zinc-900/60 hover:border-white transition-all hover:scale-105"
                  title="Like"
                >
                  <ThumbsUp className={`h-5 w-5 ${isLiked ? 'fill-blue-500 text-blue-500' : ''}`} />
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-400 bg-zinc-900/60 hover:border-white"
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
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-300">
                <span className="font-bold text-emerald-400">
                  {Math.round(item.vote_average * 10)}% Match
                </span>
                <span className="flex items-center gap-1 text-gray-300">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {item.release_date.split('-')[0]}
                </span>
                <span className="rounded border border-gray-500 px-1 text-xs">TV-MA</span>
                <span className="rounded border border-gray-500 px-1 text-xs">4K Ultra HD</span>
                <span className="rounded border border-gray-500 px-1 text-xs">Spatial Audio</span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  {item.vote_average.toFixed(1)}
                </span>
              </div>

              <p className="mt-4 text-base leading-relaxed text-gray-200">
                {item.overview}
              </p>
            </div>

            {/* Right 1 Col: Cast & Category Credits */}
            <div className="flex flex-col gap-3 text-sm text-gray-400 border-l border-zinc-800 pl-4">
              <div>
                <span className="text-gray-500">Cast: </span>
                <span className="text-gray-200">
                  {cast.slice(0, 4).map(c => c.name).join(', ') || 'Omar Sy, Ludivine Sagnier, Antoine Gouy'}
                </span>
              </div>

              <div>
                <span className="text-gray-500">Genres: </span>
                <span className="text-gray-200">Crime, Mystery, Thriller, Drama</span>
              </div>

              <div>
                <span className="text-gray-500">Mood: </span>
                <span className="text-gray-200">Clever, Suspenseful, Gritty, Charming</span>
              </div>
            </div>
          </div>

          {/* TV Episodes Section (if TV show or multi-episode) */}
          <div className="mt-10 border-t border-zinc-800 pt-8">
            <div className="flex items-center justify-between pb-4">
              <h3 className="text-xl font-bold">Episodes</h3>
              <select
                value={selectedSeason}
                onChange={e => setSelectedSeason(Number(e.target.value))}
                className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-white focus:outline-none"
              >
                <option value={1}>Season 1</option>
                <option value={2}>Season 2</option>
              </select>
            </div>

            <div className="flex flex-col divide-y divide-zinc-800">
              {episodes.map(ep => (
                <div
                  key={ep.id}
                  onClick={() => onPlay(item, ep)}
                  className="group flex flex-col gap-4 py-4 sm:flex-row sm:items-center cursor-pointer transition-colors hover:bg-zinc-800/50 rounded-lg px-2"
                >
                  <span className="text-xl font-bold text-gray-500 sm:w-6 text-center">
                    {ep.episode_number}
                  </span>

                  <div className="relative h-24 w-44 flex-none overflow-hidden rounded bg-zinc-800">
                    <img
                      src={ep.still_path}
                      alt={ep.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-8 w-8 fill-white text-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white group-hover:text-red-400 transition-colors">
                        {ep.title}
                      </h4>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {ep.runtime}m
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400 line-clamp-2">
                      {ep.overview}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* More Like This Recommendation Grid */}
          {relatedItems.length > 0 && (
            <div className="mt-10 border-t border-zinc-800 pt-8">
              <h3 className="mb-4 text-xl font-bold">More Like This</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {relatedItems.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelated(rel)}
                    className="group cursor-pointer overflow-hidden rounded-md bg-zinc-900 border border-zinc-800 transition-transform hover:scale-105"
                  >
                    <div className="relative h-36 w-full">
                      <img
                        src={rel.backdrop_path || rel.poster_path}
                        alt={rel.title || rel.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h5 className="font-semibold text-sm truncate text-white">
                        {rel.title || rel.name}
                      </h5>
                      <p className="mt-1 text-xs text-gray-400 line-clamp-2">
                        {rel.overview}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About Section Footer */}
          <div className="mt-10 border-t border-zinc-800 pt-6 text-sm text-zinc-400">
            <h4 className="text-base font-bold text-white mb-2">
              About {item.title || item.name}
            </h4>
            <p>
              <span className="text-zinc-500">Maturity Rating: </span>
              Recommended for ages 16 and up. Contains themes of crime, vengeance, and violence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
