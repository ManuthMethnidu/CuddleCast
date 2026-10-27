import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Plus,
  Check,
  ThumbsUp,
  Users,
  Sparkles,
  Zap,
  Server,
} from 'lucide-react';
import { MediaItem, Episode, CastMember } from '../types/schema';
import { api } from '../services/api';
import { authStorage } from '../services/storage';
import { useAccent } from '../context/AccentContext';
import { useSettingsStore } from '../store/settingsStore';
import { WatchPartyModal } from './WatchPartyModal';
import {
  STREAM_PROVIDERS,
  ProviderCategory,
  getProvidersByCategory,
} from '../services/providers';

interface DetailModalProps {
  item: MediaItem;
  onClose: () => void;
  onPlay: (item: MediaItem, episode?: Episode, providerId?: string) => void;
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
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [isPartyOpen, setIsPartyOpen] = useState(false);
  const { defaultProvider } = useSettingsStore();
  const [selectedCategory, setSelectedCategory] = useState<ProviderCategory>('fastest');
  const [selectedProviderId, setSelectedProviderId] = useState<string>(() => {
    if (defaultProvider && defaultProvider !== 'vidfast' && STREAM_PROVIDERS.some((p) => p.id === defaultProvider)) {
      return defaultProvider;
    }
    return 'vidlink';
  });
  const [mobileTab, setMobileTab] = useState<'overview' | 'servers' | 'episodes'>('overview');

  const isSeries = item.media_type === 'tv';

  useEffect(() => {
    api.getEpisodes(item.id, selectedSeason).then((eps) => {
      setEpisodes(eps);
      if (eps.length > 0 && !selectedEpisode) {
        setSelectedEpisode(eps[0]);
      }
    });
    api.getCast(item.id).then(setCast);
    api.searchMedia(item.title ? item.title.slice(0, 3) : 'a').then((results) => {
      setRelatedItems(results.filter((r) => r.id !== item.id).slice(0, 6));
    });
  }, [item, selectedSeason]);

  // Keyboard shortcut: ESC to close detail modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPartyOpen) {
          setIsPartyOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPartyOpen, onClose]);

  const toggleWatchlist = () => {
    const state = authStorage.toggleWatchlist(item.id, item);
    setInWatchlist(state);
  };

  const toggleLike = () => {
    const state = authStorage.toggleLike(item.id, item);
    setIsLiked(state);
  };

  useEffect(() => {
    const reload = () => {
      setInWatchlist(authStorage.isInWatchlist(item.id));
      setIsLiked(authStorage.isLiked(item.id));
    };
    const unsubscribe = authStorage.subscribe(reload);
    return unsubscribe;
  }, [item.id]);

  const handleLaunchStream = (provId?: string, ep?: Episode) => {
    const chosenProvider = provId || selectedProviderId;
    onPlay(item, ep || selectedEpisode || undefined, chosenProvider);
  };

  const visibleProviders = getProvidersByCategory(selectedCategory);

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
                {isSeries ? `${selectedSeason} Season` : '2h 14m'}
              </span>

              <span className="dx-pill">{isSeries ? 'Series' : 'Film'}</span>
              <span className="dx-pill">4K UHD</span>
              <span className="dx-pill">Direct Fast Embed</span>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2 w-full">
              <button
                onClick={() => handleLaunchStream()}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 h-11 sm:h-12 px-6 sm:px-8 rounded-full bg-white text-black font-semibold text-sm sm:text-base transition-all hover:bg-white/90 active:scale-95 shadow-[var(--md-sys-elevation-level2)]"
              >
                <Play className="h-4 sm:h-5 w-4 sm:w-5 fill-black" />
                <span>Play Now</span>
              </button>

              {/* Server Indicator & Quick Selector */}
              <button
                onClick={() => setMobileTab('servers')}
                className="flex items-center gap-1.5 h-11 px-3.5 sm:h-12 sm:px-4 rounded-full border border-white/20 bg-black/40 hover:bg-white/10 text-xs font-semibold text-zinc-200 transition-all active:scale-95 shadow-md"
                title="Select Streaming Server"
              >
                <Server className="h-3.5 w-3.5" style={{ color: accentHex }} />
                <span>Server: <strong className="text-white font-bold">{STREAM_PROVIDERS.find(p => p.id === selectedProviderId)?.name || 'VidLink Pro'}</strong></span>
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

            {/* Mobile Tab Bar */}
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
                onClick={() => setMobileTab('servers')}
                className={`py-2 relative transition-colors flex items-center gap-1.5 ${
                  mobileTab === 'servers' ? 'text-white' : 'text-zinc-400'
                }`}
              >
                <Server className="h-3.5 w-3.5" style={{ color: accentHex }} />
                <span>Servers ({STREAM_PROVIDERS.length})</span>
                {mobileTab === 'servers' && (
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

            {/* Overview Section Content */}
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
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/15 border border-white/10 text-white backdrop-blur-md transition-colors"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cast & Crew Carousel */}
              {cast.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                    Featured Cast
                  </span>
                  <div className="flex items-center gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none">
                    {cast.map(c => (
                      <div key={c.id} className="flex-none flex flex-col items-center gap-2 w-20 text-center">
                        <img
                          src={c.profile_path || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={c.name}
                          loading="lazy"
                          decoding="async"
                          className="h-16 w-16 rounded-full object-cover border-2 border-white/20 shadow-md"
                        />
                        <div className="w-full">
                          <p className="text-xs font-bold text-white truncate">{c.name}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{c.character}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Critic Reviews Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: accentHex }} />
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                    Critic Acclaim
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {criticReviews.map((rev, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md space-y-2 flex flex-col justify-between"
                    >
                      <p className="text-xs italic text-zinc-200 line-clamp-3">"{rev.quote}"</p>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 pt-1 border-t border-white/10">
                        <span>{rev.source}</span>
                        <span className="text-emerald-400 font-bold">{rev.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* More Like This (Related Items) */}
              {relatedItems.length > 0 && (
                <div className="space-y-3 pt-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                    More Like This
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
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

          {/* Right Column: Episodes (TV) & Cloud Streaming Servers (47 Providers) */}
          <div
            className={`lg:col-span-5 xl:col-span-4 space-y-4 ${
              mobileTab !== 'overview' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="rounded-2xl border border-white/10 bg-[#131317]/95 p-4 sm:p-5 shadow-2xl backdrop-blur-2xl space-y-4">
              {/* TV Episodes Selector */}
              {isSeries && (mobileTab === 'episodes' || window.innerWidth >= 1024) && (
                <div className="space-y-3 pb-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                      Episodes
                    </span>
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(Number(e.target.value))}
                      className="rounded-lg bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-semibold text-white outline-none focus:border-white transition-colors"
                    >
                      <option value={1} className="bg-[#18181d]">Season 1</option>
                      <option value={2} className="bg-[#18181d]">Season 2</option>
                      <option value={3} className="bg-[#18181d]">Season 3</option>
                    </select>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/20">
                    {episodes.map((ep) => (
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

              {/* Streaming Servers Header */}
              <div className={`space-y-3 ${mobileTab === 'servers' ? 'block' : 'hidden lg:block'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" style={{ color: accentHex }} />
                      <span className="text-sm font-bold text-white tracking-tight">
                        Cloud Stream Engine
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-400">
                      {STREAM_PROVIDERS.length} Active Servers
                    </span>
                  </div>

                  {/* Category Filter Tabs */}
                  <div className="grid grid-cols-4 gap-1 p-1 bg-white/5 rounded-xl border border-white/10 text-[10px] font-bold">
                    <button
                      onClick={() => setSelectedCategory('fastest')}
                      className={`py-1.5 px-1 rounded-lg transition-all text-center truncate ${
                        selectedCategory === 'fastest'
                          ? 'bg-white/20 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                      style={{
                        color: selectedCategory === 'fastest' ? accentHex : undefined,
                      }}
                    >
                      Fastest
                    </button>
                    <button
                      onClick={() => setSelectedCategory('ott')}
                      className={`py-1.5 px-1 rounded-lg transition-all text-center truncate ${
                        selectedCategory === 'ott'
                          ? 'bg-white/20 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                      style={{
                        color: selectedCategory === 'ott' ? accentHex : undefined,
                      }}
                    >
                      OTT
                    </button>
                    <button
                      onClick={() => setSelectedCategory('international')}
                      className={`py-1.5 px-1 rounded-lg transition-all text-center truncate ${
                        selectedCategory === 'international'
                          ? 'bg-white/20 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                      style={{
                        color: selectedCategory === 'international' ? accentHex : undefined,
                      }}
                    >
                      Dubs
                    </button>
                    <button
                      onClick={() => setSelectedCategory('backup')}
                      className={`py-1.5 px-1 rounded-lg transition-all text-center truncate ${
                        selectedCategory === 'backup'
                          ? 'bg-white/20 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                      style={{
                        color: selectedCategory === 'backup' ? accentHex : undefined,
                      }}
                    >
                      Backup
                    </button>
                  </div>

                  {/* Server Cards List */}
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/20">
                    {visibleProviders.map((prov) => {
                      const isSelected = selectedProviderId === prov.id;
                      return (
                        <div
                          key={prov.id}
                          onClick={() => {
                            setSelectedProviderId(prov.id);
                            handleLaunchStream(prov.id);
                          }}
                          className={`group relative flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.98] ${
                            isSelected
                              ? 'bg-white/15 border-white/30 text-white shadow-lg'
                              : 'bg-white/[0.04] border-white/5 hover:bg-white/[0.08] hover:border-white/20 text-zinc-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/40 border border-white/10"
                            >
                              <Server className="h-4 w-4" style={{ color: isSelected ? accentHex : '#94a3b8' }} />
                            </div>

                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold truncate group-hover:text-white transition-colors">
                                  {prov.name}
                                </span>
                                {prov.badge && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-white/10 text-zinc-300 shrink-0">
                                    {prov.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-400 truncate mt-0.5">
                                {prov.description}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProviderId(prov.id);
                              handleLaunchStream(prov.id);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-black bg-white hover:bg-white/90 active:scale-95 shrink-0 shadow-md transition-all"
                            title={`Play on ${prov.name}`}
                          >
                            <Play className="h-3 w-3 fill-black" />
                            <span>Play</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
