import React from 'react';
import { MediaItem } from '../types/schema';
import { Search } from 'lucide-react';

interface SearchGridProps {
  query: string;
  category: string;
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  onSuggestionClick: (suggestion: string) => void;
}

const SUGGESTIONS = [
  'Lupin',
  'Clayface',
  'Spider-Man',
  'Resident Evil',
  'Cyberpunk',
  'Crime',
  'Anime',
  'Mystery',
  'Action',
  'Thriller',
  'Top Rated',
];

export const SearchGrid: React.FC<SearchGridProps> = ({
  query,
  category,
  items,
  onSelect,
  onSuggestionClick,
}) => {

  return (
    <div className="mx-auto max-w-[1560px] px-4 pt-24 pb-20 md:px-8 lg:px-12 select-none">
      {/* Exploration Suggestions */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-400">Explore titles related to:</span>
        {SUGGESTIONS.map(sug => (
          <button
            key={sug}
            onClick={() => onSuggestionClick(sug)}
            className="rounded-full border border-white/10 bg-[#18181d] px-3.5 py-1 text-xs text-zinc-300 transition-all hover:border-white/30 hover:text-white"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Grid Results Header */}
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-white sm:text-2xl">
          {query ? `Search results for "${query}"` : `${category.toUpperCase()} Titles`}
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Showing {items.length} titles
        </p>
      </div>

      {/* Media Poster Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map(item => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="group relative cursor-pointer overflow-hidden rounded-md bg-[#18181d] border border-white/5 transition-transform duration-200 hover:scale-105"
            >
              {/* Floating IMDb badge */}
              <div className="dx-badge">
                <i>IMDb</i>
                <span>{item.vote_average.toFixed(1)}</span>
              </div>

              <div className="relative aspect-[2/3] w-full">
                <img
                  src={item.poster_path || item.backdrop_path}
                  alt={item.title || item.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <span className="text-sm font-bold text-white line-clamp-1">
                    {item.title || item.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-300 mt-0.5">
                    <span className="dx-match text-emerald-400 font-bold">
                      {Math.round(item.vote_average * 10)}%
                    </span>
                    <span>•</span>
                    <span className="capitalize">{item.media_type}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Search className="h-16 w-16 text-zinc-600 mb-4" />
          <h3 className="text-xl font-bold text-zinc-300">No titles found</h3>
          <p className="text-sm text-zinc-500 mt-2 max-w-sm">
            We couldn't find any movies or TV series matching "{query}". Check spelling or try a different keyword.
          </p>
        </div>
      )}
    </div>
  );
};
