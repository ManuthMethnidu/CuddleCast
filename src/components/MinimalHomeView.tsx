import React, { useState, useMemo } from 'react';
import { Play, Info, Sparkles, Flame, Film, Tv, Star, Compass } from 'lucide-react';
import { MediaItem, BillboardData, CarouselRail } from '../types/schema';
import { useNavigate } from 'react-router-dom';

interface MinimalHomeViewProps {
  items: MediaItem[];
  billboardItems: BillboardData[];
  rails: CarouselRail[];
  onSelect: (item: MediaItem) => void;
  onPlay: (item: MediaItem) => void;
}

export const MinimalHomeView: React.FC<MinimalHomeViewProps> = ({
  items,
  billboardItems,
  rails,
  onSelect,
  onPlay,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'movies' | 'series' | 'anime' | 'continue'>('all');

  // Spotlight Hero Item (First billboard item or top rated item)
  const heroItem = useMemo(() => {
    return billboardItems[0] || items[0] || null;
  }, [billboardItems, items]);

  // Continue Watching rail
  const continueWatchingRail = useMemo(() => {
    return rails.find((r) => r.isContinueWatching);
  }, [rails]);

  // Filtered Items for Minimal Grid
  const displayItems: MediaItem[] = useMemo(() => {
    if (activeTab === 'continue' && continueWatchingRail) {
      return continueWatchingRail.items;
    }
    if (activeTab === 'movies') {
      return items.filter((i) => i.media_type === 'movie').slice(0, 36);
    }
    if (activeTab === 'series') {
      return items.filter((i) => i.media_type === 'tv').slice(0, 36);
    }
    if (activeTab === 'anime') {
      return items.filter((i) => {
        const title = (i.title || i.name || '').toLowerCase();
        return (
          title.includes('anime') ||
          title.includes('jujutsu') ||
          title.includes('naruto') ||
          title.includes('titan') ||
          title.includes('slayer') ||
          title.includes('piece')
        );
      }).slice(0, 36);
    }
    // 'all'
    return items.slice(0, 48);
  }, [activeTab, items, continueWatchingRail]);

  return (
    <div
      className="min-h-screen text-white select-none pb-24"
      style={{
        backgroundColor: '#09318D',
        backgroundImage: `
          repeating-linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.035) 0px,
            rgba(255, 255, 255, 0.035) 1px,
            transparent 1px,
            transparent 32px
          ),
          radial-gradient(circle at 50% -10%, rgba(253, 145, 204, 0.18) 0%, transparent 65%)
        `,
      }}
    >
      <div className="mx-auto max-w-[1560px] px-3.5 sm:px-6 md:px-10 lg:px-12 pt-4 sm:pt-6 space-y-8">
        {/* Minimal Mode Indicator Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-[#fd91cc]/40 text-xs font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-[#fd91cc] animate-pulse" />
            <span className="text-[#fd91cc] font-bold">Low Performance Mode</span>
            <span className="text-white/70">· Striped Glass Deep Blue & Pink</span>
          </div>

          <button
            onClick={() => navigate('/settings')}
            className="text-xs font-semibold text-white/80 hover:text-white underline underline-offset-4 decoration-[#fd91cc]/50 hover:decoration-[#fd91cc] transition-colors"
          >
            Adjust in Settings →
          </button>
        </div>

        {/* Minimal Spotlight Glass Hero Banner */}
        {heroItem && (
          <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/[0.07] backdrop-blur-xl shadow-2xl p-5 sm:p-8 md:p-10 transition-all">
            {/* Subtle background ambient backdrop */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
              <img
                src={heroItem.backdrop_path || heroItem.poster_path}
                alt=""
                className="w-full h-full object-cover filter blur-2xl opacity-25 scale-110"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(9, 49, 141, 0.95) 0%, rgba(9, 49, 141, 0.75) 50%, rgba(253, 145, 204, 0.15) 100%)',
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left Details */}
              <div className="md:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#fd91cc] text-[#09318D] text-[11px] font-black uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 fill-[#09318D]" />
                  <span>Featured Premiere</span>
                </div>

                <h1
                  className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight"
                  style={{ textWrap: 'balance' }}
                >
                  {heroItem.title || heroItem.name}
                </h1>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-white font-mono">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-[#fd91cc] font-bold">
                    <Star className="w-3.5 h-3.5 fill-[#fd91cc]" />
                    {heroItem.vote_average.toFixed(1)} IMDb
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-white">
                    {(heroItem.release_date || '').slice(0, 4) || '2026'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#fd91cc]/20 border border-[#fd91cc]/40 text-[#fd91cc] uppercase font-bold">
                    {heroItem.media_type === 'tv' ? 'Series' : 'Film'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-white">4K UHD</span>
                </div>

                {/* Synopsis */}
                <p
                  className="text-sm sm:text-base text-white/90 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-2xl font-normal"
                  style={{ textWrap: 'pretty' }}
                >
                  {heroItem.overview}
                </p>

                {/* Buttons (Bubblegum Pink & Striped Glass) */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onPlay(heroItem)}
                    className="h-11 sm:h-12 px-6 sm:px-8 rounded-full font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_24px_rgba(253,145,204,0.4)] transition-all active:scale-95 hover:brightness-110"
                    style={{
                      backgroundColor: '#fd91cc',
                      color: '#09318D',
                    }}
                  >
                    <Play className="h-4 sm:h-5 w-4 sm:w-5 fill-current" />
                    <span>Watch Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelect(heroItem)}
                    className="h-11 sm:h-12 px-5 sm:px-6 rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer bg-white/10 hover:bg-white/20 text-white border border-[#fd91cc]/50 hover:border-[#fd91cc] backdrop-blur-md transition-all active:scale-95 shadow-md"
                  >
                    <Info className="h-4 sm:h-5 w-4 sm:w-5 text-[#fd91cc]" />
                    <span>Details</span>
                  </button>
                </div>
              </div>

              {/* Right Hero Poster Preview */}
              <div className="hidden md:flex md:col-span-4 justify-end">
                <div
                  onClick={() => onSelect(heroItem)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-white/20 hover:border-[#fd91cc] shadow-2xl transition-all duration-300 hover:scale-105"
                  style={{
                    outline: '1px solid rgba(255, 255, 255, 0.15)',
                    outlineOffset: '-1px',
                  }}
                >
                  <img
                    src={heroItem.poster_path || heroItem.backdrop_path}
                    alt={heroItem.title || heroItem.name}
                    className="w-48 lg:w-56 aspect-[2/3] object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-[#fd91cc] text-[#09318D] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Category Navigation Pills */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#fd91cc]" />
              <span>Catalog & Quick Streams</span>
            </h2>

            <span className="text-xs font-mono font-bold text-[#fd91cc] px-2 py-0.5 rounded-full bg-white/10 border border-[#fd91cc]/30">
              {displayItems.length} Titles
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'all', label: 'All Titles', icon: Compass },
              { id: 'movies', label: 'Movies', icon: Film },
              { id: 'series', label: 'Series', icon: Tv },
              { id: 'anime', label: 'Anime', icon: Flame },
              ...(continueWatchingRail && continueWatchingRail.items.length > 0
                ? [{ id: 'continue' as const, label: 'Continue Watching', icon: Play }]
                : []),
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`h-9 px-4 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap border ${
                    isSelected
                      ? 'bg-[#fd91cc] text-[#09318D] border-[#fd91cc] shadow-[0_2px_14px_rgba(253,145,204,0.45)]'
                      : 'bg-white/10 text-white border-white/15 hover:bg-white/15 hover:border-white/30'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Minimal Striped Glass Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {displayItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              data-minimal-card="true"
              onClick={() => onSelect(item)}
              className="group relative cursor-pointer flex flex-col rounded-xl overflow-hidden bg-white/[0.08] backdrop-blur-md border border-white/20 hover:border-[#fd91cc] shadow-md hover:shadow-[0_12px_32px_rgba(253,145,204,0.25)] transition-all duration-200 hover:-translate-y-1 active:scale-[0.98]"
              style={{
                outline: '1px solid rgba(255, 255, 255, 0.12)',
                outlineOffset: '-1px',
              }}
            >
              {/* Poster Container */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/40">
                <img
                  src={item.poster_path || item.backdrop_path}
                  alt={item.title || item.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Bubblegum Pink Top Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#fd91cc] text-[#09318D] shadow-sm">
                    {item.media_type === 'tv' ? 'TV' : 'MOVIE'}
                  </span>
                </div>

                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-black/80 text-white border border-white/20 backdrop-blur z-10 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#fd91cc] text-[#fd91cc]" />
                  <span>{item.vote_average.toFixed(1)}</span>
                </div>

                {/* Instant Play Button on Hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlay(item);
                    }}
                    title="Play Immediately"
                    className="h-11 w-11 rounded-full bg-[#fd91cc] text-[#09318D] flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform"
                  >
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </button>
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="p-3 space-y-1 bg-white/[0.04]">
                <h3 className="font-bold text-white text-xs sm:text-sm truncate group-hover:text-[#fd91cc] transition-colors">
                  {item.title || item.name}
                </h3>
                <div className="flex items-center justify-between text-[11px] font-mono text-white/75">
                  <span>{(item.release_date || item.first_air_date || '').slice(0, 4) || '2026'}</span>
                  <span className="text-[#fd91cc] font-semibold text-[10px] uppercase">Direct Stream</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
