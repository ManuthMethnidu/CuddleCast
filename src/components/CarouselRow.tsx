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
    <section className="relative my-6 px-4 md:px-6 lg:px-8 max-w-[1440px] mx-auto">
      {/* Rail Header with Gradient Title & View All */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <h2 className="home-row-title text-lg font-bold sm:text-2xl tracking-wide">
            {rail.title}
          </h2>
          <span className="text-gray-600">|</span>
          <button
            onClick={() => onSelect(rail.items[0])}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            View All
          </button>
        </div>

        {/* Top-Right Slider Control Paddles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            aria-label="Previous slide"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-all shadow-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Next slide"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-all shadow-md"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrolling Card Track */}
      <div
        ref={rowRef}
        className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-2 scroll-smooth"
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
                      WebkitTextStroke: '3px #52525b',
                      color: '#09090b',
                    }}
                  >
                    {index + 1}
                  </span>
                </div>
              )}

              {/* Poster Card Container */}
              <div
                className={`relative overflow-hidden rounded-md bg-zinc-900 border border-white/5 shadow-md ${
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

                {/* Continue Watching Progress Bar */}
                {rail.isContinueWatching && progressPercent !== null && (
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800">
                    <div
                      className="h-full bg-red-600 transition-all duration-300"
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
