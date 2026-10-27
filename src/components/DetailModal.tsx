import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Plus,
  Check,
  ThumbsUp,
  Users,
  Film,
  Sparkles,
  Zap,
} from 'lucide-react';
import { MediaItem, Episode, CastMember } from '../types/schema';
import { api } from '../services/api';
import { authStorage } from '../services/supabase';
import { useAccent } from '../context/AccentContext';
import { WatchPartyModal } from './WatchPartyModal';

interface DetailModalProps {
  item: MediaItem;
  onClose: () => void;
  onPlay: (item: MediaItem, episode?: Episode) => void;
  onSelectRelated: (item: MediaItem) => void;
}

interface StremioStream {
  id: string;
  name: string;
  addon: string;
  quality: '4K HDR' | '1080p' | '720p' | 'SD';
  resolution: string;
  audio: string;
  size: string;
  seeds: number;
  isDebrid: boolean;
  streamUrl: string;
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
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [isPartyOpen, setIsPartyOpen] = useState(false);
  const [streamSort, setStreamSort] = useState<'addon' | 'quality' | 'seeds' | 'size'>('addon');
  const [providerFilter, setProviderFilter] = useState<'all' | 'debrid' | 'p2p'>('all');
  const [mobileTab, setMobileTab] = useState<'overview' | 'streams' | 'episodes'>('overview');

  const isSeries = item.media_type === 'tv';

  useEffect(() => {
    api.getEpisodes(item.id, selectedSeason).then(eps => {
      setEpisodes(eps);
      if (eps.length > 0 && !selectedEpisode) {
        setSelectedEpisode(eps[0]);
      }
    });
    api.getCast(item.id).then(setCast);
    api.searchMedia(item.title ? item.title.slice(0, 3) : 'a').then(results => {
      setRelatedItems(results.filter(r => r.id !== item.id).slice(0, 6));
    });
  }, [item, selectedSeason]);

  const toggleWatchlist = () => {
    const state = authStorage.toggleWatchlist(item.id);
    setInWatchlist(state);
  };

  const toggleLike = () => {
    const state = authStorage.toggleLike(item.id);
    setIsLiked(state);
  };

  // Mock Stremio Streams based on item metadata
  const streams: StremioStream[] = [
    {
      id: 'torrentio-4k',
      name: `${item.title || item.name} 2160p UHD BluRay x265 HDR TrueHD 7.1 Atmos`,
      addon: 'Torrentio [RD+]',
      quality: '4K HDR',
      resolution: '3840x2160',
      audio: 'Dolby Atmos 7.1',
      size: '18.4 GB',
      seeds: 342,
      isDebrid: true,
      streamUrl: item.streamUrl || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    {
      id: 'torrentio-1080p',
      name: `${item.title || item.name} 1080p WEB-DL DDP5.1 Atmos H.264`,
      addon: 'Torrentio [RD+]',
      quality: '1080p',
      resolution: '1920x1080',
      audio: 'DDP 5.1 Atmos',
      size: '4.8 GB',
      seeds: 512,
      isDebrid: true,
      streamUrl: item.streamUrl || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    {
      id: 'cyberflix-1080p',
      name: `${item.title || item.name} 1080p Multi-Audio BluRay REMUX AVC DTS-HD MA 5.1`,
      addon: 'CyberFlix Multi-Audio',
      quality: '1080p',
      resolution: '1920x1080',
      audio: 'DTS-HD MA 5.1',
      size: '6.2 GB',
      seeds: 184,
      isDebrid: false,
      streamUrl: item.streamUrl || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    {
      id: 'torrentgalaxy-720p',
      name: `${item.title || item.name} 720p HDTV x264 AAC 2.0`,
      addon: 'Torrent Galaxy [P2P]',
      quality: '720p',
      resolution: '1280x720',
      audio: 'AAC 2.0',
      size: '1.4 GB',
      seeds: 98,
      isDebrid: false,
      streamUrl: item.streamUrl || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
  ];

  const filteredStreams = streams.filter(s => {
    if (providerFilter === 'debrid') return s.isDebrid;
    if (providerFilter === 'p2p') return !s.isDebrid;
    return true;
  });

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
      quote: 'Astonishing in scope, relentless in momentum, and anchored by extraordinary performances.',
      score: '92%',
    },
    {
      source: 'Rolling Stone',
      author: 'David Fear',
      quote: 'The kind of electrifying cinema that reminds you why big screen spectacles exist in the first place.',
      score: '90%',
    },
  ];

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto bg-[#303841] text-[#F3F3F3] animate-fadeIn select-none -webkit-overflow-scrolling-touch">
      {/* Background Backdrop Layer with Cinematic Vignette */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <img
          src={item.backdrop_path || item.poster_path}
          alt={item.title || item.name}
          decoding="async"
          className="h-full w-full object-cover object-center filter brightness-[0.75] contrast-[1.05]"
        />
        {/* Authentic Multi-direction Echora Gradients */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(90deg, rgba(48, 56, 65, 0.96) 0%, rgba(48, 56, 65, 0.85) 38%, rgba(48, 56, 65, 0.3) 65%, rgba(48, 56, 65, 0.5) 100%),
              linear-gradient(0deg, rgba(48, 56, 65, 1) 0%, rgba(48, 56, 65, 0.8) 25%, transparent 60%),
              linear-gradient(180deg, rgba(33, 40, 48, 0.7) 0%, transparent 20%)
            `,
          }}
        />
      </div>

      {/* Top Navigation Bar with Back Button */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-12 h-14 sm:h-16 pt-[env(safe-area-inset-top,0px)] bg-gradient-to-b from-black/90 to-transparent backdrop-blur-md">
        <button
          onClick={onClose}
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/60 border border-white/20 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
          title="Back to Browse (Esc)"
        >
          <ArrowLeft className="h-4 sm:h-5 w-4 sm:w-5" />
        </button>

        <div className="flex items-center gap-3">
          <span
            className="text-2xl sm:text-3xl font-black uppercase tracking-tight"
            style={{ fontFamily: "'Bebas Neue', sans-serif", color: accentHex }}
          >
            ECHORA
          </span>
        </div>
      </header>

      {/* Main Detail Content Layout */}
      <main className="mx-auto max-w-[1560px] px-4 sm:px-8 lg:px-12 py-3 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          {/* Left Column: Metadata, Info, Action Buttons, Cast, Reviews */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5 sm:space-y-6">
            {/* Title / Logo Header */}
            <div>
              {item.logo_path ? (
                <img
                  src={item.logo_path}
                  alt={item.title || item.name}
                  decoding="async"
                  className="max-h-16 sm:max-h-32 w-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]"
                />
              ) : (
                <h1 className="text-3xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] leading-[1.05]">
                  {item.title || item.name}
                </h1>
              )}
            </div>

            {/* Sub-header Metadata Pills */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold">
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

              <span className="text-zinc-300 font-mono">
                {item.release_date?.split('-')[0] || '2024'}
              </span>

              <span className="text-zinc-400">·</span>

              <span className="text-zinc-300 font-mono">
                {isSeries ? '2 Seasons' : '2h 14m'}
              </span>

              <span className="dx-pill">{isSeries ? 'Series' : 'Film'}</span>
              <span className="dx-pill">4K UHD</span>
              <span className="dx-pill">HDR10</span>
              <span className="dx-pill">Dolby Atmos</span>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2 w-full">
              <button
                onClick={() => onPlay(item, selectedEpisode || undefined)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 h-11 sm:h-12 px-6 sm:px-8 rounded-full bg-white text-black font-semibold text-sm sm:text-base transition-all hover:bg-white/90 active:scale-95 shadow-[var(--md-sys-elevation-level2)]"
              >
                <Play className="h-4 sm:h-5 w-4 sm:w-5 fill-black" />
                <span>Play</span>
              </button>

              <button
                onClick={toggleWatchlist}
                className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/30 bg-black/40 hover:border-white text-white backdrop-blur-md transition-all hover:scale-105 active:scale-95 flex-none"
                title="Add to Library"
              >
                {inWatchlist ? <Check className="h-5 w-5" style={{ color: accentHex }} /> : <Plus className="h-5 w-5" />}
              </button>

              <button
                onClick={toggleLike}
                className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/30 bg-black/40 hover:border-white text-white backdrop-blur-md transition-all hover:scale-105 active:scale-95 flex-none"
                title="Like"
              >
                <ThumbsUp
                  className="h-5 w-5"
                  style={{
                    color: isLiked ? accentHex : '#fff',
                    fill: isLiked ? accentHex : 'none',
                  }}
                />
              </button>

              <button
                onClick={() => setIsPartyOpen(true)}
                className="flex items-center gap-1.5 h-11 px-4 sm:h-12 sm:px-5 rounded-full border border-white/30 bg-black/40 hover:border-white text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition-all hover:scale-105 active:scale-95 flex-none"
                title="Watch Party"
              >
                <Users className="h-4 w-4" style={{ color: accentHex }} />
                <span className="hidden sm:inline">Watch Party</span>
              </button>
            </div>

            {/* Mobile Tab Bar (For fast mobile navigation between Overview, Streams, Episodes) */}
            <div className="flex lg:hidden items-center border-b border-white/10 pt-2 pb-1 gap-5 text-xs font-bold uppercase tracking-wider">
              <button
                onClick={() => setMobileTab('overview')}
                className={`py-2 relative transition-colors ${
                  mobileTab === 'overview' ? 'text-white' : 'text-zinc-400'
                }`}
              >
                <span>Overview</span>
                {mobileTab === 'overview' && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                    style={{ background: accentHex }}
                  />
                )}
              </button>

              <button
                onClick={() => setMobileTab('streams')}
                className={`py-2 relative transition-colors flex items-center gap-1.5 ${
                  mobileTab === 'streams' ? 'text-white' : 'text-zinc-400'
                }`}
              >
                <Zap className="h-3.5 w-3.5" style={{ color: accentHex }} />
                <span>Streams ({filteredStreams.length})</span>
                {mobileTab === 'streams' && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                    style={{ background: accentHex }}
                  />
                )}
              </button>

              {isSeries && (
                <button
                  onClick={() => setMobileTab('episodes')}
                  className={`py-2 relative transition-colors ${
                    mobileTab === 'episodes' ? 'text-white' : 'text-zinc-400'
                  }`}
                >
                  <span>Episodes ({episodes.length})</span>
                  {mobileTab === 'episodes' && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                      style={{ background: accentHex }}
                    />
                  )}
                </button>
              )}
            </div>

            {/* Overview Section Content (Always shown on desktop; shown on mobile if mobileTab === 'overview') */}
            <div className={`space-y-6 ${mobileTab === 'overview' ? 'block' : 'hidden lg:block'}`}>
              {/* Synopsis Description */}
              <p className="text-sm sm:text-lg text-zinc-200 leading-relaxed max-w-3xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                {item.overview}
              </p>

              {/* Genres Pill Bar */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Genres
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {((item.genres as string[]) || ['Action', 'Sci-Fi', 'Adventure', 'Drama']).map((genre: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-white/[0.08] border border-white/10 text-xs font-medium text-zinc-200 hover:bg-white/[0.15] transition-colors"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cast & Directors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                    Starring Cast
                  </span>
                  <p className="text-zinc-200 font-medium text-xs sm:text-sm">
                    {cast.length > 0
                      ? cast.slice(0, 5).map(c => c.name).join(', ')
                      : 'Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem, Josh Brolin'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                    Director & Creators
                  </span>
                  <p className="text-zinc-200 font-medium text-xs sm:text-sm">
                    Denis Villeneuve, Frank Herbert, Jon Spaihts
                  </p>
                </div>
              </div>

              {/* Critic Reviews Section */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: accentHex }} />
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">
                    Critic Reviews & Consensus
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {criticReviews.map((rev, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/10 bg-[#18181d]/80 p-3.5 sm:p-4 backdrop-blur-md flex flex-col justify-between space-y-2.5 sm:space-y-3"
                    >
                      <p className="text-xs text-zinc-300 italic leading-relaxed">
                        "{rev.quote}"
                      </p>
                      <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[11px] font-semibold text-zinc-400">
                        <span>{rev.source} · {rev.author}</span>
                        <span className="font-bold text-emerald-400">{rev.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Media Grid */}
              {relatedItems.length > 0 && (
                <div className="space-y-3 pt-6 border-t border-white/10">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    More Like This
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
                    {relatedItems.map(rel => (
                      <div
                        key={rel.id}
                        onClick={() => onSelectRelated(rel)}
                        className="group cursor-pointer rounded-lg overflow-hidden border border-white/10 bg-[#18181d] transition-transform hover:scale-105 active:scale-95"
                      >
                        <div className="relative aspect-[2/3]">
                          <img
                            src={rel.poster_path || rel.backdrop_path}
                            alt={rel.title || rel.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                          <div className="dx-badge">
                            <i>IMDb</i>
                            <span>{rel.vote_average.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="p-1.5 sm:p-2">
                          <p className="text-[11px] sm:text-xs font-semibold text-white truncate">
                            {rel.title || rel.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Stremio Streams & Episodes Panel */}
          <div
            className={`lg:col-span-5 xl:col-span-4 space-y-4 ${
              mobileTab !== 'overview' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="rounded-2xl border border-white/10 bg-[#131317]/90 p-4 sm:p-5 shadow-2xl backdrop-blur-2xl space-y-4 sm:space-y-5">
              {/* If TV Series: Seasons and Episodes Selector */}
              {isSeries && (mobileTab === 'episodes' || window.innerWidth >= 1024) && (
                <div className="space-y-3 pb-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                      Episodes
                    </span>
                    <select
                      value={selectedSeason}
                      onChange={e => setSelectedSeason(Number(e.target.value))}
                      className="rounded-lg bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-semibold text-white outline-none focus:border-white transition-colors"
                    >
                      <option value={1} className="bg-[#18181d]">Season 1</option>
                      <option value={2} className="bg-[#18181d]">Season 2</option>
                      <option value={3} className="bg-[#18181d]">Season 3</option>
                    </select>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-none">
                    {episodes.map(ep => (
                      <div
                        key={ep.id}
                        onClick={() => setSelectedEpisode(ep)}
                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer border transition-all ${
                          selectedEpisode?.id === ep.id
                            ? 'bg-white/15 border-white/30 text-white'
                            : 'bg-white/[0.04] border-white/5 hover:bg-white/[0.08] text-zinc-300'
                        }`}
                      >
                        <img
                          src={ep.still_path || item.backdrop_path}
                          alt={ep.title}
                          loading="lazy"
                          decoding="async"
                          className="h-12 w-20 rounded-lg object-cover flex-none"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">
                            {ep.episode_number}. {ep.title}
                          </p>
                          <p className="text-[11px] text-zinc-400 font-mono">
                            {ep.runtime ? `${ep.runtime}m` : '48m'}
                          </p>
                        </div>
                        {selectedEpisode?.id === ep.id && (
                          <Play className="h-4 w-4 fill-white flex-none" style={{ color: accentHex }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Streams Header with Filter & Sort */}
              {(mobileTab === 'streams' || window.innerWidth >= 1024) && (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" style={{ color: accentHex }} />
                        <span className="text-sm font-bold text-white tracking-tight">
                          Streams & Addons
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-zinc-400">
                        {filteredStreams.length} available
                      </span>
                    </div>

                    {/* Filter / Sort Row */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <select
                        value={streamSort}
                        onChange={e => setStreamSort(e.target.value as any)}
                        className="rounded-lg bg-white/10 border border-white/15 px-2.5 py-1 text-xs font-medium text-white outline-none"
                      >
                        <option value="addon" className="bg-[#18181d]">Addon order</option>
                        <option value="quality" className="bg-[#18181d]">Best quality</option>
                        <option value="seeds" className="bg-[#18181d]">Most seeds</option>
                        <option value="size" className="bg-[#18181d]">Largest first</option>
                      </select>

                      <select
                        value={providerFilter}
                        onChange={e => setProviderFilter(e.target.value as any)}
                        className="rounded-lg bg-white/10 border border-white/15 px-2.5 py-1 text-xs font-medium text-white outline-none"
                      >
                        <option value="all" className="bg-[#18181d]">All Providers</option>
                        <option value="debrid" className="bg-[#18181d]">Debrid (RD+)</option>
                        <option value="p2p" className="bg-[#18181d]">P2P / Torrent</option>
                      </select>
                    </div>
                  </div>

                  {/* Interactive Streams List */}
                  <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                    {filteredStreams.map(stream => (
                      <div
                        key={stream.id}
                        onClick={() => onPlay(item, selectedEpisode || undefined)}
                        className="group relative flex flex-col gap-1.5 p-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.09] hover:border-white/30 cursor-pointer transition-all active:scale-[0.98]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase text-black"
                              style={{
                                background:
                                  stream.quality === '4K HDR'
                                    ? '#e50914'
                                    : stream.quality === '1080p'
                                    ? '#2f80ff'
                                    : '#1db954',
                                color: '#fff',
                              }}
                            >
                              {stream.quality}
                            </span>
                            <span className="text-xs font-bold text-white">
                              {stream.addon}
                            </span>
                          </div>

                          {stream.isDebrid && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                              ⚡ Instant Debrid
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-zinc-300 font-mono line-clamp-1 group-hover:text-white transition-colors">
                          {stream.name}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1">
                          <span>{stream.audio} · {stream.size}</span>
                          <span className="flex items-center gap-1 text-emerald-400 font-bold">
                            <Film className="h-3 w-3" />
                            {stream.seeds} seeds
                          </span>
                        </div>

                        {/* Hover Play Glow Pill */}
                        <div
                          className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-black shadow-lg"
                          style={{ background: '#fff' }}
                        >
                          <Play className="h-3 w-3 fill-black" />
                          <span>Stream</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Watch Party Modal */}
      <WatchPartyModal
        isOpen={isPartyOpen}
        onClose={() => setIsPartyOpen(false)}
      />
    </div>
  );
};
