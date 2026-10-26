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
  Users,
  Quote,
} from 'lucide-react';
import Hls from 'hls.js';
import { MediaItem, Episode, CastMember } from '../types/schema';
import { api, DEFAULT_STREAM } from '../services/api';
import { authStorage } from '../services/supabase';
import { useAccent } from '../context/AccentContext';
import { WatchPartyModal } from './WatchPartyModal';

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
  const { accentHex } = useAccent();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [relatedItems, setRelatedItems] = useState<MediaItem[]>([]);
  const [inWatchlist, setInWatchlist] = useState(() => authStorage.isInWatchlist(item.id));
  const [isLiked, setIsLiked] = useState(() => authStorage.isLiked(item.id));
  const [isMuted, setIsMuted] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isPartyOpen, setIsPartyOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
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

  const criticReviews = [
    {
      source: 'Variety',
      author: 'Peter Debruge',
      quote: 'A gorgeously crafted cinematic triumph with irresistible charisma and edge-of-your-seat precision.',
      score: '96%',
    },
    {
      source: 'The Hollywood Reporter',
      author: 'David Rooney',
      quote: 'Brilliantly staged set pieces and stunning visuals make this an absolute standout.',
      score: '92%',
    },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[500] flex justify-center overflow-y-auto bg-black/85 backdrop-blur-md p-0 sm:p-6 md:p-10 animate-fadeIn">
        {/* Backdrop click to close */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Modal Container */}
        <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-none sm:rounded-2xl bg-[#18181d] text-white shadow-2xl border border-white/10 my-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 hover:bg-white/20 text-white backdrop-blur-md transition-all"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Video Header with Gradients */}
          <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-[#0b0b0d]">
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#18181d] via-[#18181d]/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />

            {/* Header Content Overlay */}
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div className="space-y-3">
                {item.logo_path ? (
                  <img
                    src={item.logo_path}
                    alt={item.title || item.name}
                    className="max-h-16 max-w-xs object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
                  />
                ) : (
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                    {item.title || item.name}
                  </h2>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onPlay(item)}
                    className="flex items-center gap-2 rounded-lg bg-white px-7 py-2.5 text-sm font-bold text-black transition-all hover:bg-white/85 active:scale-95 shadow-lg"
                  >
                    <Play className="h-5 w-5 fill-black" /> Play
                  </button>

                  <button
                    onClick={toggleWatchlist}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/50 hover:border-white transition-all hover:scale-110"
                    title="My Library"
                  >
                    {inWatchlist ? <Check className="h-4 w-4" style={{ color: accentHex }} /> : <Plus className="h-4 w-4" />}
                  </button>

                  <button
                    onClick={toggleLike}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/50 hover:border-white transition-all hover:scale-110"
                    title="Like"
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
                    onClick={() => setIsPartyOpen(true)}
                    className="flex items-center gap-1.5 h-9 px-3 rounded-full border border-white/40 bg-black/50 hover:border-white text-xs font-semibold transition-all hover:scale-105"
                    title="Watch Party"
                  >
                    <Users className="h-4 w-4" style={{ color: accentHex }} />
                    <span>Watch Party</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/50 hover:border-white text-white transition-all"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="px-6 py-6 sm:px-8 space-y-8">
            {/* Metadata Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-sm font-semibold">
                  <span className="dx-match font-bold text-emerald-400">
                    {Math.round(item.vote_average * 10)}% Match
                  </span>
                  <span className="dx-imdb">
                    <i>IMDb</i>
                    <span>{item.vote_average.toFixed(1)}</span>
                  </span>
                  <span className="dx-tomato">
                    <span>🍅</span>
                    <span>94%</span>
                  </span>
                  <span className="dx-meta-score">
                    <span>Metacritic</span>
                    <span>84</span>
                  </span>
                  <span className="dx-pill">4K UHD</span>
                  <span className="dx-pill">HDR</span>
                  <span className="dx-pill">Dolby Atmos</span>
                  <span className="text-zinc-400 font-normal">
                    {item.release_date.split('-')[0]}
                  </span>
                </div>

                <p className="text-base text-zinc-200 leading-relaxed">
                  {item.overview}
                </p>
              </div>

              {/* Cast & Info */}
              <div className="space-y-3 text-sm text-zinc-400 border-l border-white/10 pl-5">
                <div>
                  <span className="text-zinc-500 font-medium">Cast: </span>
                  <span className="text-zinc-200">
                    {cast.slice(0, 4).map(c => c.name).join(', ') || 'Omar Sy, Ludivine Sagnier, Antoine Gouy'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 font-medium">Genres: </span>
                  <span className="text-zinc-200">Crime, Mystery, Thriller, Drama</span>
                </div>
                <div>
                  <span className="text-zinc-500 font-medium">Audio: </span>
                  <span className="text-zinc-200">English [Original], 5.1 Surround, Audio Description</span>
                </div>
              </div>
            </div>

            {/* Critic Reviews Section */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Quote className="h-4 w-4" style={{ color: accentHex }} />
                <span>Critic Reviews</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {criticReviews.map((rev, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-[#212128] border border-white/5 p-4 flex flex-col justify-between"
                  >
                    <p className="text-xs text-zinc-300 italic leading-relaxed">
                      "{rev.quote}"
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-white/5">
                      <span className="font-bold text-white">{rev.author} · <span className="text-zinc-400 font-normal">{rev.source}</span></span>
                      <span className="font-bold text-emerald-400">{rev.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Episodes List (for Series) */}
            <div className="border-t border-white/10 pt-6">
              <div className="flex items-center justify-between pb-4">
                <h3 className="font-bold text-xl">Episodes</h3>
                <select
                  value={selectedSeason}
                  onChange={e => setSelectedSeason(Number(e.target.value))}
                  className="rounded-lg border border-white/10 bg-[#212128] px-3.5 py-1.5 text-sm text-white focus:outline-none"
                >
                  <option value={1}>Season 1</option>
                  <option value={2}>Season 2</option>
                </select>
              </div>

              <div className="divide-y divide-white/5">
                {episodes.map(ep => (
                  <div
                    key={ep.id}
                    onClick={() => onPlay(item, ep)}
                    className="group flex flex-col gap-4 py-4 sm:flex-row sm:items-center cursor-pointer hover:bg-white/5 rounded-xl px-3 transition-colors"
                  >
                    <span className="text-xl font-bold text-zinc-500 sm:w-6 text-center group-hover:text-white">
                      {ep.episode_number}
                    </span>

                    <div className="relative h-24 w-44 flex-none overflow-hidden rounded-lg bg-[#212128]">
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
                        <h4 className="font-semibold text-white group-hover:text-zinc-300 transition-colors">
                          {ep.title}
                        </h4>
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {ep.runtime}m
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                        {ep.overview}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* More Like This */}
            {relatedItems.length > 0 && (
              <div className="border-t border-white/10 pt-6">
                <h3 className="font-bold text-xl mb-4">More Like This</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {relatedItems.map(rel => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectRelated(rel)}
                      className="group cursor-pointer overflow-hidden rounded-xl bg-[#212128] border border-white/5 hover:border-white/20 transition-all flex flex-col"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-black">
                        <img
                          src={rel.backdrop_path || rel.poster_path}
                          alt={rel.title || rel.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                          1h 48m
                        </div>
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h5 className="font-bold text-sm text-white truncate">
                            {rel.title || rel.name}
                          </h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="dx-match text-xs font-bold text-emerald-400">
                              {Math.round(rel.vote_average * 10)}% Match
                            </span>
                            <span className="dx-pill text-[10px]">16+</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <WatchPartyModal
        isOpen={isPartyOpen}
        onClose={() => setIsPartyOpen(false)}
      />
    </>
  );
};
