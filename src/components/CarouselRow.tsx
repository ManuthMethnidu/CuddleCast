import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CarouselRail, MediaItem } from '../types/schema';
import { HoverCardPortal } from './HoverCardPortal';
import { useAccent } from '../context/AccentContext';

interface CarouselRowProps {
  rail: CarouselRail;
  onSelect: (item: MediaItem) => void;
  onPlay: (item: MediaItem) => void;
}

export const CarouselRow: React.FC<CarouselRowProps> = ({
  rail,
  onSelect,
  onPlay,
}) => {
  const { accentHex } = useAccent();
  const rowRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<{ item: MediaItem; rect: DOMRect } | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollLimits = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.8;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScrollLimits, 300);
    }
  };

  const handleMouseEnter = (item: MediaItem, e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    hoverTimeoutRef.current = window.setTimeout(() => {
      const rect = target.getBoundingClientRect();
      setHoveredItem({ item, rect });
    }, 400);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  if (!rail.items || rail.items.length === 0) return null;

  return (
    <section className="group/row relative my-6 px-[var(--dx-gutter,3rem)] max-w-[1560px] mx-auto select-none">
      {/* Row Header with Title and Page Indicator */}
      <div className="flex items-center justify-between pb-2.5">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>{rail.title}</span>
          <button
            onClick={() => onSelect(rail.items[0])}
            className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors ml-2"
          >
            Explore All &gt;
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
          className="absolute z-10 top-12 bottom-3 left-0 w-12 flex items-center justify-center bg-gradient-to-r from-[#0b0b0d] to-transparent text-white opacity-0 group-hover/row:opacity-100 transition-all hover:scale-110"
        >
          <ChevronLeft className="h-8 w-8 transition-transform hover:scale-125" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          aria-label="Next page"
          className="absolute z-10 top-12 bottom-3 right-0 w-12 flex items-center justify-center bg-gradient-to-l from-[#0b0b0d] to-transparent text-white opacity-0 group-hover/row:opacity-100 transition-all hover:scale-110"
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
          const progressPercent = item.progress_seconds && item.total_seconds
            ? Math.min(100, Math.round((item.progress_seconds / item.total_seconds) * 100))
            : null;

          return (
            <div
              key={`${item.id}-${index}`}
              onMouseEnter={e => handleMouseEnter(item, e)}
              onMouseLeave={handleMouseLeave}
              onClick={() => onSelect(item)}
              className="relative flex-none cursor-pointer transition-transform duration-200 hover:scale-[1.03]"
            >
              {/* Top 10 Today Numbers */}
              {rail.isTop10 && (
                <div className="relative flex items-end">
                  <span
                    className="select-none text-7xl sm:text-8xl lg:text-9xl font-black leading-none tracking-tighter"
                    style={{
                      WebkitTextStroke: `3px ${accentHex}`,
                      color: '#0b0b0d',
                      textShadow: `0 0 20px ${accentHex}40`,
                    }}
                  >
                    {index + 1}
                  </span>
                </div>
              )}

              {/* Poster Card Container */}
              <div
                className={`relative overflow-hidden rounded-md bg-[#18181d] border border-white/5 shadow-md ${
                  rail.isContinueWatching
                    ? 'h-36 w-60 sm:h-40 sm:w-72'
                    : 'h-52 w-36 sm:h-64 sm:w-44 md:h-72 md:w-48'
                }`}
              >
                {/* Floating IMDb Badge */}
                <div className="dx-badge">
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
                  className="h-full w-full object-cover transition-opacity duration-300"
                />

                {/* Continue Watching Wide Card Overlay */}
                {rail.isContinueWatching && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
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
            </div>
          );
        })}
      </div>

      {/* Floating Hover Portal */}
      {hoveredItem && (
        <HoverCardPortal
          item={hoveredItem.item}
          rect={hoveredItem.rect}
          onClose={() => setHoveredItem(null)}
          onPlay={item => {
            setHoveredItem(null);
            onPlay(item);
          }}
          onMoreInfo={item => {
            setHoveredItem(null);
            onSelect(item);
          }}
        />
      )}
    </section>
  );
};
