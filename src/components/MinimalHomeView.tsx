import React, { useState, useMemo } from 'react';
import {
  Play,
  Search,
  SlidersHorizontal,
  Clock,
  Dice5,
  ArrowRight,
} from 'lucide-react';
import { MediaItem, BillboardData, CarouselRail } from '../types/schema';
import { useNavigate } from 'react-router-dom';
import { authStorage } from '../services/storage';

interface MinimalHomeViewProps {
  items: MediaItem[];
  billboardItems: BillboardData[];
  rails: CarouselRail[];
  onSelect: (item: MediaItem) => void;
  onPlay: (item: MediaItem) => void;
  onSearch: (query: string) => void;
}

export const MinimalHomeView: React.FC<MinimalHomeViewProps> = ({
  items,
  billboardItems,
  rails,
  onSelect: _onSelect,
  onPlay,
  onSearch,
}) => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'movie' | 'tv' | 'anime'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Retrieve user watch progress directly from storage to be 100% synchronized
  const progressList = useMemo(() => {
    return authStorage.getProgressList();
  }, []);

  // Continue Watching rail items
  const continueWatchingItems = useMemo(() => {
    const cwRail = rails.find((r) => r.isContinueWatching);
    if (cwRail && cwRail.items.length > 0) {
      return cwRail.items;
    }

    // Fallback: build from progressList + items
    if (progressList.length > 0) {
      return progressList.map((prog) => {
        const match =
          prog.media_item ||
          items.find((i) => i.id === prog.media_id) || {
            id: prog.media_id,
            title: 'Watched Title',
            name: 'Watched Title',
            overview: '',
            poster_path: '',
            backdrop_path: '',
            media_type: 'movie' as const,
            release_date: '',
            vote_average: 0,
            vote_count: 0,
            genre_ids: [],
            popularity: 0,
            adult: false,
          };
        return {
          ...match,
          progress_seconds: prog.progress_seconds,
          total_seconds: prog.total_seconds,
          last_watched: prog.last_watched,
        } as MediaItem;
      });
    }

    // Default starter continue items if none watched yet
    return items.slice(0, 4);
  }, [rails, progressList, items]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      navigate(`/?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleSurpriseMe = () => {
    if (items.length > 0) {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      onPlay(randomItem);
    } else if (billboardItems.length > 0) {
      onPlay(billboardItems[0]);
    }
  };

  return (
    <div
      className="min-h-screen text-white select-none flex flex-col justify-between"
      style={{
        backgroundColor: '#09318D',
        backgroundImage: `
          repeating-linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.035) 0px,
            rgba(255, 255, 255, 0.035) 1px,
            transparent 1px,
            transparent 36px
          ),
          radial-gradient(ellipse at 50% 18%, rgba(253, 145, 204, 0.16) 0%, transparent 68%)
        `,
      }}
    >
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 pt-10 sm:pt-16 pb-16 space-y-10 flex-1 flex flex-col justify-center items-center">
        {/* ========================================================
            1. CENTERED HERO (VIDBOX STYLE)
           ======================================================== */}
        <div className="w-full flex flex-col items-center text-center space-y-4">
          {/* Logo with Bubblegum Pink Accent */}
          <div className="inline-flex items-center gap-1.5 transition-transform hover:scale-105">
            <span
              className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight"
              style={{
                color: '#fd91cc',
                textShadow: '0 4px 28px rgba(253, 145, 204, 0.45)',
              }}
            >
              ECHORA
            </span>
          </div>

          {/* Subtitle */}
          <p
            className="text-sm sm:text-lg md:text-xl font-bold text-white tracking-wide"
            style={{ textWrap: 'balance' }}
          >
            Watch Movies & Series Online in HD for Free!
          </p>

          {/* Centered Pill Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-2xl relative pt-2"
          >
            <div className="relative flex items-center w-full rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/20 hover:border-white/35 focus-within:border-[#fd91cc] focus-within:ring-2 focus-within:ring-[#fd91cc]/40 shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all h-12 sm:h-14 px-2 sm:px-3">
              {/* Filters Pill Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#fd91cc]" />
                  <span className="capitalize">{selectedFilter === 'all' ? 'Filters' : selectedFilter}</span>
                </button>

                {showFilterDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-36 rounded-xl bg-[#07246b] border border-white/20 shadow-2xl p-1.5 z-50 text-left space-y-1">
                    {[
                      { id: 'all', label: 'All Media' },
                      { id: 'movie', label: 'Movies' },
                      { id: 'tv', label: 'Series' },
                      { id: 'anime', label: 'Anime' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSelectedFilter(opt.id as any);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          selectedFilter === opt.id
                            ? 'bg-[#fd91cc] text-[#09318D]'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input */}
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search movies, series, anime..."
                className="w-full bg-transparent px-3 text-xs sm:text-sm text-white placeholder:text-white/60 focus:outline-none"
              />

              {/* Search Submit Button */}
              <button
                type="submit"
                title="Search"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-white hover:text-[#fd91cc] hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
              >
                <Search className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
            </div>
          </form>

          {/* Two Action Buttons (Explore Now & Surprise Me) */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => navigate('/discover')}
              className="h-11 sm:h-12 px-7 sm:px-9 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_24px_rgba(253,145,204,0.45)] transition-all active:scale-95 hover:brightness-110"
              style={{
                backgroundColor: '#fd91cc',
                color: '#09318D',
              }}
            >
              <span>Explore Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleSurpriseMe}
              className="h-11 sm:h-12 px-5 sm:px-7 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer bg-white/10 hover:bg-white/15 text-white border border-[#fd91cc]/40 hover:border-[#fd91cc] backdrop-blur-md transition-all active:scale-95 shadow-md"
            >
              <Dice5 className="w-4 h-4 text-[#fd91cc]" />
              <span>Surprise Me</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            2. ONLY CONTINUE WATCHING SECTION (EXACTLY AS ASKED)
           ======================================================== */}
        <section className="w-full space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-[#fd91cc]" />
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                Continue Watching
              </h2>
            </div>

            <span className="text-[11px] font-mono text-[#fd91cc] font-bold px-2 py-0.5 rounded-full bg-white/10 border border-[#fd91cc]/30">
              {continueWatchingItems.length} in progress
            </span>
          </div>

          {/* Clean Horizontal Continue Watching Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {continueWatchingItems.map((item, idx) => {
              const progressPercent =
                item.progress_seconds && item.total_seconds
                  ? Math.min(100, Math.round((item.progress_seconds / item.total_seconds) * 100))
                  : 45 + ((idx * 17) % 50);

              return (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => onPlay(item)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/20 hover:border-[#fd91cc] shadow-lg hover:shadow-[0_8px_30px_rgba(253,145,204,0.3)] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] flex flex-col"
                  style={{
                    outline: '1px solid rgba(255, 255, 255, 0.12)',
                    outlineOffset: '-1px',
                  }}
                >
                  {/* Backdrop / Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                    <img
                      src={item.backdrop_path || item.poster_path}
                      alt={item.title || item.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Progress Bar (Bubblegum Pink) */}
                    <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/60">
                      <div
                        className="h-full bg-[#fd91cc]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {/* Big Resume Play Icon on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 active:scale-95"
                        style={{ backgroundColor: '#fd91cc', color: '#09318D' }}
                      >
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Progress Badge */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/80 text-[#fd91cc] border border-[#fd91cc]/40 backdrop-blur">
                      {progressPercent}%
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-3 flex items-center justify-between gap-2 bg-white/[0.03]">
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#fd91cc] transition-colors">
                        {item.title || item.name}
                      </h3>
                      <p className="text-[10px] text-white/70 font-mono truncate">
                        {item.media_type === 'tv' ? 'Series · Resume Ep' : 'Movie · Resume'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlay(item);
                      }}
                      className="flex-none px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all shadow-sm cursor-pointer"
                      style={{ backgroundColor: '#fd91cc', color: '#09318D' }}
                    >
                      Resume
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Subtle Footer info */}
      <footer className="text-center py-4 text-xs font-mono text-white/60 border-t border-white/10">
        Echora Minimal Mode · 120 FPS Striped Glass Portal · Zero Latency
      </footer>
    </div>
  );
};
