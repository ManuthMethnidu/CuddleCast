import React, { useState, useMemo } from 'react';
import { MediaItem } from '../types/schema';
import { ChevronDown, Play, Info } from 'lucide-react';

interface DiscoverViewProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  onPlay: (item: MediaItem) => void;
}

const GENRES = [
  'All Genres',
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
];

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  items,
  onSelect,
  onPlay,
}) => {
  const [selectedType, setSelectedType] = useState<'all' | 'movie' | 'tv' | 'anime'>('all');
  const [selectedCatalog, setSelectedCatalog] = useState<'popular' | 'top_rated' | 'trending'>('popular');
  const [selectedGenre, setSelectedGenre] = useState<string>('All Genres');
  const [focusedItem, setFocusedItem] = useState<MediaItem | null>(() => items[0] || null);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (selectedType === 'movie') {
      result = result.filter(i => i.media_type === 'movie');
    } else if (selectedType === 'tv') {
      result = result.filter(i => i.media_type === 'tv');
    } else if (selectedType === 'anime') {
      result = result.filter(i => ((i.genres as string[]) || []).includes('Animation') || (i.overview || '').toLowerCase().includes('anime'));
    }

    if (selectedGenre !== 'All Genres') {
      result = result.filter(i => ((i.genres as string[]) || []).includes(selectedGenre) || (i.overview || '').toLowerCase().includes(selectedGenre.toLowerCase()));
    }

    if (selectedCatalog === 'top_rated') {
      result.sort((a, b) => b.vote_average - a.vote_average);
    } else if (selectedCatalog === 'trending') {
      result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    return result;
  }, [items, selectedType, selectedCatalog, selectedGenre]);

  const activeFocus = focusedItem || filteredItems[0] || items[0];

  return (
    <div className="mx-auto max-w-[1560px] px-6 sm:px-12 pt-20 pb-20 select-none animate-fadeIn">
      {/* Top Filter Dropdown Selectors Bar matching discover.jpg */}
      <div className="flex flex-wrap items-center gap-3 pb-8 border-b border-white/10">
        {/* Type Selector */}
        <div className="relative">
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value as any)}
            className="appearance-none rounded-xl bg-[#18181d] border border-white/15 px-4 py-2 pr-9 text-sm font-bold text-white outline-none focus:border-white transition-all cursor-pointer shadow-md hover:bg-white/10"
          >
            <option value="all">All Types</option>
            <option value="movie">Movies</option>
            <option value="tv">Series</option>
            <option value="anime">Anime</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-zinc-400" />
        </div>

        {/* Catalog Selector */}
        <div className="relative">
          <select
            value={selectedCatalog}
            onChange={e => setSelectedCatalog(e.target.value as any)}
            className="appearance-none rounded-xl bg-[#18181d] border border-white/15 px-4 py-2 pr-9 text-sm font-bold text-white outline-none focus:border-white transition-all cursor-pointer shadow-md hover:bg-white/10"
          >
            <option value="popular">Popular</option>
            <option value="top_rated">Top Rated</option>
            <option value="trending">Trending Today</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-zinc-400" />
        </div>

        {/* Genre Selector */}
        <div className="relative">
          <select
            value={selectedGenre}
            onChange={e => setSelectedGenre(e.target.value)}
            className="appearance-none rounded-xl bg-[#18181d] border border-white/15 px-4 py-2 pr-9 text-sm font-bold text-white outline-none focus:border-white transition-all cursor-pointer shadow-md hover:bg-white/10"
          >
            {GENRES.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-zinc-400" />
        </div>

        <span className="text-xs text-zinc-400 ml-auto font-mono">
          {filteredItems.length} titles in catalog
        </span>
      </div>

      {/* Split Preview Banner for Focused Title */}
      {activeFocus && (
        <div className="relative my-8 overflow-hidden rounded-2xl border border-white/10 bg-[#131317] p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center shadow-2xl">
          <div className="absolute inset-0 -z-10 opacity-25">
            <img
              src={activeFocus.backdrop_path || activeFocus.poster_path}
              alt=""
              className="h-full w-full object-cover filter blur-md"
            />
          </div>

          <img
            src={activeFocus.poster_path || activeFocus.backdrop_path}
            alt={activeFocus.title || activeFocus.name}
            className="w-40 sm:w-48 rounded-xl object-cover shadow-2xl flex-none border border-white/20"
          />

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <span className="dx-imdb">
                <i>IMDb</i>
                <span>{activeFocus.vote_average.toFixed(1)}</span>
              </span>
              <span className="text-sm font-bold text-zinc-300">
                {activeFocus.release_date?.split('-')[0] || '2024'}
              </span>
              <span className="dx-pill capitalize">
                {activeFocus.media_type === 'tv' ? 'Series' : 'Film'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {activeFocus.title || activeFocus.name}
            </h2>

            <p className="line-clamp-3 text-sm text-zinc-300 leading-relaxed max-w-2xl">
              {activeFocus.overview}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => onPlay(activeFocus)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white text-black font-bold text-sm hover:bg-white/85 transition-all shadow-md active:scale-95"
              >
                <Play className="h-4 w-4 fill-black" />
                <span>Play</span>
              </button>

              <button
                onClick={() => onSelect(activeFocus)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 transition-all active:scale-95"
              >
                <Info className="h-4 w-4" />
                <span>Details & Streams</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid of 7 Columns Matching dxbi Tokens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3.5 sm:gap-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            onMouseEnter={() => setFocusedItem(item)}
            onClick={() => onSelect(item)}
            className="group relative cursor-pointer overflow-hidden rounded-md bg-[#18181d] border border-white/5 transition-transform duration-200 hover:scale-105"
          >
            {/* Pinned IMDb Badge */}
            <div className="dx-badge">
              <i>IMDb</i>
              <span>{item.vote_average.toFixed(1)}</span>
            </div>

            <div className="relative aspect-[2/3] w-full">
              <img
                src={item.poster_path || item.backdrop_path}
                alt={item.title || item.name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end">
                <span className="text-xs font-bold text-white line-clamp-1">
                  {item.title || item.name}
                </span>
                <span className="text-[10px] text-zinc-300 font-mono mt-0.5">
                  {item.release_date?.split('-')[0]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
