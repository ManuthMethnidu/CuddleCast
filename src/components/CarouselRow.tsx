import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CarouselRail, MediaItem } from '../types/schema';
import { HoverCardPortal } from './HoverCardPortal';

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
  const rowRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<{ item: MediaItem; rect: DOMRect } | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleMouseEnter = (item: MediaItem, e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    hoverTimeoutRef.current = window.setTimeout(() => {
      const rect = target.getBoundingClientRect();
      setHoveredItem({ item, rect });
    }, 450);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  if (!rail.items || rail.items.length === 0) return null;

  return (
    <section className="relative my-7 px-4 md:px-6 lg:px-8 max-w-[1440px] mx-auto">
      {/* Rail Header with Gradient Title & View All */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <h2 className="home-row-title text-lg font-black sm:text-2xl tracking-wide">
            {rail.title}
          </h2>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => onSelect(rail.items[0])}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
          >
            Explore All
          </button>
        </div>

        {/* Top-Right Slider Control Paddles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            aria-label="Previous slide"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/80 hover:bg-blue-900/40 border border-slate-700/60 hover:border-sky-400/50 text-white transition-all shadow-md active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Next slide"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/80 hover:bg-blue-900/40 border border-slate-700/60 hover:border-sky-400/50 text-white transition-all shadow-md active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrolling Card Track */}
      <div
        ref={rowRef}
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
              className="group relative flex-none cursor-pointer transition-transform duration-200 hover:scale-105"
            >
              {/* Top 10 Big Numerical Typography Badge */}
              {rail.isTop10 && (
                <div className="relative flex items-end">
                  <span
                    className="select-none text-7xl sm:text-8xl lg:text-9xl font-black leading-none tracking-tighter"
                    style={{
                      WebkitTextStroke: '3px #0284c7',
                      color: '#070b14',
                      filter: 'drop-shadow(0 0 10px rgba(56,189,248,0.3))',
                    }}
                  >
                    {index + 1}
                  </span>
                </div>
              )}

              {/* Poster Card Container */}
              <div
                className={`relative overflow-hidden rounded-lg bg-slate-900 border border-slate-800/80 shadow-md group-hover:border-sky-400/50 group-hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.8),0_0_15px_rgba(56,189,248,0.25)] transition-all ${
                  rail.isContinueWatching
                    ? 'h-36 w-60 sm:h-40 sm:w-72'
                    : 'h-52 w-32 sm:h-52 sm:w-32 md:h-48 md:w-32 lg:h-[185px] lg:w-[122px] xl:h-[285px] xl:w-[189px]'
                }`}
              >
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

                {/* Continue Watching Glowing Progress Bar */}
                {rail.isContinueWatching && progressPercent !== null && (
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.8)] transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Hover Portal when user dwells on card */}
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
