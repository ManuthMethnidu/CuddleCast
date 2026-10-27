import React, { useRef, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { CarouselRail, MediaItem } from '../types/schema';
import { useAccent } from '../context/AccentContext';

interface CarouselRowProps {
  rail: CarouselRail;
  onSelect: (item: MediaItem) => void;
  onPlay: (item: MediaItem) => void;
}

const CarouselRowComponent: React.FC<CarouselRowProps> = ({
  rail,
  onSelect,
  onPlay,
}) => {
  const { accentHex } = useAccent();
  const navigate = useNavigate();
  const rowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Throttled scroll boundary calculation using rAF
  const checkScrollLimits = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (rowRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
        const leftLimit = scrollLeft > 10;
        const rightLimit = scrollLeft + clientWidth < scrollWidth - 10;
        setCanScrollLeft(prev => (prev !== leftLimit ? leftLimit : prev));
        setCanScrollRight(prev => (prev !== rightLimit ? rightLimit : prev));
      }
    });
  };

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.8;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScrollLimits, 350);
    }
  };

  const handleSeeAll = () => {
    if (rail.id === 'continue-watching') {
      navigate('/continue-watch');
    } else if (rail.id.includes('movie')) {
      navigate('/movies');
    } else if (rail.id.includes('series') || rail.id.includes('tv')) {
      navigate('/series');
    } else {
      navigate('/discover');
    }
  };

  if (!rail.items || rail.items.length === 0) return null;

  return (
    <section className="group/row relative my-4 sm:my-6 px-3.5 sm:px-[var(--dx-gutter,3rem)] max-w-[1560px] mx-auto select-none dx-row-section">
      {/* Row Header with Title and Page Indicator */}
      <div className="flex items-center justify-between pb-2.5">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>{rail.title}</span>
          <button
            onClick={handleSeeAll}
            className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors ml-2"
          >
            See All &gt;
          </button>
        </h2>

        {/* Row Page Indicators */}
        <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
          <span className="w-3.5 h-[2px] rounded-full" style={{ background: accentHex }} />
          <span className="w-3.5 h-[2px] rounded-full bg-white/20" />
          <span className="w-3.5 h-[2px] rounded-full bg-white/20" />
        </div>
      </div>

      {/* Side Arrow Paddles */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          aria-label="Previous page"
          className="absolute z-20 top-12 bottom-3 left-0 w-12 flex items-center justify-center bg-gradient-to-r from-[#303841] via-[#303841]/80 to-transparent text-white opacity-0 group-hover/row:opacity-100 transition-all hover:scale-110"
        >
          <ChevronLeft className="h-8 w-8 transition-transform hover:scale-125" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          aria-label="Next page"
          className="absolute z-20 top-12 bottom-3 right-0 w-12 flex items-center justify-center bg-gradient-to-l from-[#303841] via-[#303841]/80 to-transparent text-white opacity-0 group-hover/row:opacity-100 transition-all hover:scale-110"
        >
          <ChevronRight className="h-8 w-8 transition-transform hover:scale-125" />
        </button>
      )}

      {/* Horizontal Track */}
      <div
        ref={rowRef}
        onScroll={checkScrollLimits}
        className="flex items-center gap-3 overflow-x-auto scrollbar-none py-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {rail.items.map((item, index) => {
          const progressPercent =
            item.progress_seconds && item.total_seconds
              ? Math.min(100, Math.round((item.progress_seconds / item.total_seconds) * 100))
              : null;

          return (
            <div
              key={`${item.id}-${index}`}
              data-media-card="true"
              onClick={() => onSelect(item)}
              className="group/card relative flex-none cursor-pointer transition-transform duration-200 ease-out hover:scale-[1.04] active:scale-[0.98]"
            >
              {/* Poster Card Container */}
              <div
                className={`relative overflow-hidden rounded-md bg-[#18181d] border border-white/5 transition-all duration-200 group-hover/card:border-white/25 group-hover/card:shadow-xl group-hover/card:shadow-black/60 ${
                  rail.isContinueWatching
                    ? 'h-28 w-48 sm:h-40 sm:w-72'
                    : 'h-44 w-28 sm:h-64 sm:w-44 md:h-72 md:w-48'
                }`}
              >
                {/* Floating Hardware-Optimized IMDb Badge */}
                <div className="dx-badge z-10">
                  <i>IMDb</i>
                  <span>{item.vote_average.toFixed(1)}</span>
                </div>

                <img
                  src={
                    rail.isContinueWatching
                      ? item.backdrop_path || item.poster_path
                      : item.poster_path || item.backdrop_path
                  }
                  alt={item.title || item.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                />

                {/* Instant Play Button Overlay on Hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlay(item);
                    }}
                    className="pointer-events-auto h-11 w-11 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-xl transition-transform hover:scale-115 active:scale-95"
                    style={{ borderColor: accentHex }}
                    title="Quick Play"
                  >
                    <Play className="h-4 w-4 fill-white ml-0.5" style={{ color: accentHex }} />
                  </div>
                </div>

                {/* Continue Watching Wide Card Overlay */}
                {rail.isContinueWatching && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 pointer-events-none">
                    <span className="text-sm font-bold text-white truncate drop-shadow">
                      {item.title || item.name}
                    </span>
                    {progressPercent !== null && (
                      <div className="mt-2 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{ width: `${progressPercent}%`, background: accentHex }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Title & Metadata Caption below regular portrait card */}
              {!rail.isContinueWatching && (
                <div className="mt-1.5 px-0.5 max-w-[112px] sm:max-w-[176px] md:max-w-[192px]">
                  <p className="text-xs font-semibold text-zinc-200 truncate group-hover/card:text-white transition-colors">
                    {item.title || item.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                    <span>{(item.release_date || item.first_air_date || '').slice(0, 4) || '2026'}</span>
                    <span>·</span>
                    <span className="uppercase text-[9px] font-bold px-1 py-0.5 rounded bg-white/10 text-zinc-300">
                      {item.media_type === 'tv' ? 'Series' : 'Movie'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export const CarouselRow = memo(CarouselRowComponent);
