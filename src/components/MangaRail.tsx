import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft, ChevronRight, Star, BookOpenText } from 'lucide-react';
import { useAccent } from '../context/AccentContext';
import { TOP_FEATURED_MANGA, MangaTitle } from '../services/mangadex';

interface MangaRailProps {
  onSelectManga?: (manga: MangaTitle) => void;
}

export const MangaRail: React.FC<MangaRailProps> = ({ onSelectManga }) => {
  const { accentHex } = useAccent();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollLimits = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScrollLimits, 300);
    }
  };

  const handleCardClick = (manga: MangaTitle) => {
    if (onSelectManga) {
      onSelectManga(manga);
    } else {
      navigate(`/manga?id=${manga.id}`);
    }
  };

  return (
    <section className="group/rail relative my-6 sm:my-8 px-3.5 sm:px-[var(--dx-gutter,3rem)] max-w-[1560px] mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: accentHex }}
          >
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Trending Manga & Webtoons
              </h2>
              <span
                className="text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-full uppercase text-white shadow-sm"
                style={{ backgroundColor: accentHex }}
              >
                HOT
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Official colored editions, top manhwa, and latest scanlations
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/manga')}
          className="group flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <span>Explore All Manga</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Side Arrow Left */}
      {canScrollLeft && (
        <button
          onClick={() => handleScroll('left')}
          aria-label="Scroll left"
          className="absolute z-20 top-14 bottom-4 left-0 w-12 flex items-center justify-center bg-gradient-to-r from-[#0b0b0d] via-[#0b0b0d]/80 to-transparent text-white opacity-0 group-hover/rail:opacity-100 transition-all hover:scale-110"
        >
          <div className="w-9 h-9 rounded-full bg-zinc-900/90 border border-white/20 flex items-center justify-center shadow-lg">
            <ChevronLeft className="w-5 h-5" />
          </div>
        </button>
      )}

      {/* Side Arrow Right */}
      {canScrollRight && (
        <button
          onClick={() => handleScroll('right')}
          aria-label="Scroll right"
          className="absolute z-20 top-14 bottom-4 right-0 w-12 flex items-center justify-center bg-gradient-to-l from-[#0b0b0d] via-[#0b0b0d]/80 to-transparent text-white opacity-0 group-hover/rail:opacity-100 transition-all hover:scale-110"
        >
          <div className="w-9 h-9 rounded-full bg-zinc-900/90 border border-white/20 flex items-center justify-center shadow-lg">
            <ChevronRight className="w-5 h-5" />
          </div>
        </button>
      )}

      {/* Cards Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={checkScrollLimits}
        className="flex gap-4 overflow-x-auto scrollbar-none py-2 px-1 focus-visible:outline-none scroll-smooth"
        tabIndex={0}
      >
        {TOP_FEATURED_MANGA.map((manga) => (
          <div
            key={manga.id}
            onClick={() => handleCardClick(manga)}
            className="group/card relative flex-shrink-0 w-40 sm:w-48 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-2xl hover:shadow-black/60 cursor-pointer hover:-translate-y-1.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(manga);
              }
            }}
          >
            {/* Poster Image */}
            <div className="relative aspect-[2/3] overflow-hidden bg-zinc-950">
              <img
                src={manga.coverUrl}
                alt={manga.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover/card:opacity-60 transition-opacity" />

              {/* Badges */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                <span
                  className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm text-white"
                  style={{ backgroundColor: accentHex }}
                >
                  {manga.tags?.includes('Full Color') ? 'COLORED' : 'MANGA'}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-amber-300 border border-amber-300/20">
                  <Star className="w-2.5 h-2.5 fill-amber-300" />
                  {manga.rating || 9.0}
                </span>
              </div>

              {/* Status and Chapters Count */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-zinc-300 pointer-events-none">
                <span className="font-semibold text-emerald-400">
                  {manga.status}
                </span>
                {manga.chaptersCount && (
                  <span className="text-zinc-400 text-[10px]">
                    {manga.chaptersCount} Ch.
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Card Info */}
            <div className="p-3 bg-zinc-900/90 border-t border-white/5 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm text-white line-clamp-1 group-hover/card:text-zinc-100 transition-colors">
                  {manga.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                  {manga.author}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-2">
                {(manga.tags || []).slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Read Now CTA */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(manga);
                }}
                className="mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                style={{ backgroundColor: accentHex }}
              >
                <BookOpenText className="w-3.5 h-3.5" />
                <span>Read Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
