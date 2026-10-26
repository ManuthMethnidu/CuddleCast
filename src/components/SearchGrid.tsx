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
  'Cuddle Classics',
];

export const SearchGrid: React.FC<SearchGridProps> = ({
  query,
  category,
  items,
  onSelect,
  onSuggestionClick,
}) => {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-24 pb-20 md:px-6 lg:px-8">
      {/* Exploration Suggestions */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400">Explore cinema related to:</span>
        {SUGGESTIONS.map(sug => (
          <button
            key={sug}
            onClick={() => onSuggestionClick(sug)}
            className="rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1 text-xs text-slate-300 transition-all hover:border-sky-400 hover:text-sky-300 hover:shadow-[0_0_10px_rgba(56,189,248,0.25)]"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Grid Results Header */}
      <div className="mb-6">
        <h2 className="text-xl font-black text-white sm:text-2xl bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent">
          {query ? `Search results for "${query}"` : `${category.toUpperCase()} Titles`}
        </h2>
        <p className="text-xs text-sky-400/80 mt-1 font-medium">
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
              className="group relative cursor-pointer overflow-hidden rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-400/50 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.8),0_0_15px_rgba(56,189,248,0.25)] transition-all duration-200 hover:scale-105"
            >
              <div className="relative aspect-[2/3] w-full">
                <img
                  src={item.poster_path || item.backdrop_path}
                  alt={item.title || item.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <span className="text-sm font-bold text-white line-clamp-1">
                    {item.title || item.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-0.5">
                    <span className="text-sky-400 font-extrabold">
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
          <Search className="h-16 w-16 text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-200">No titles found</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-sm">
            We couldn't find any movies or TV shows matching "{query}". Try checking your spelling or searching for a different keyword.
          </p>
        </div>
      )}
    </div>
  );
};
