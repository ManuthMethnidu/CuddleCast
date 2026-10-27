import React, { useState, useMemo, useEffect } from 'react';
import { MediaItem } from '../types/schema';
import { Play, Trash2, ArrowUpDown } from 'lucide-react';
import { authStorage } from '../services/storage';
import { useAccent } from '../context/AccentContext';

interface LibraryViewProps {
  items: MediaItem[];
  initialFilter?: 'all' | 'movie' | 'tv' | 'continue' | 'favorites';
  onSelect: (item: MediaItem) => void;
  onPlay: (item: MediaItem) => void;
  onNavigateDiscover: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  items,
  initialFilter = 'all',
  onSelect,
  onPlay,
  onNavigateDiscover,
}) => {
  const { accentHex } = useAccent();
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv' | 'continue' | 'favorites'>(
    initialFilter
  );
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'year' | 'title'>('recent');
  const [localItems, setLocalItems] = useState<MediaItem[]>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  useEffect(() => {
    if (initialFilter) {
      setFilter(initialFilter);
    }
  }, [initialFilter]);

  const [progressList, setProgressList] = useState(() => authStorage.getProgressList());
  const [likedIds, setLikedIds] = useState(() => authStorage.getLikes());

  // Subscribe to authStorage user switches or item updates
  useEffect(() => {
    const reload = () => {
      setProgressList(authStorage.getProgressList());
      setLikedIds(authStorage.getLikes());
    };
    const unsubscribe = authStorage.subscribe(reload);
    return unsubscribe;
  }, []);

  // Combine watchlist items, continue-watching items with metadata, and liked items
  const combinedItems = useMemo(() => {
    const map = new Map<number, MediaItem>();

    // 1. Add watchlist items
    for (const it of localItems) {
      map.set(it.id, it);
    }

    // 2. Add continue-watching items
    for (const prog of progressList) {
      if (prog.media_item && !map.has(prog.media_id)) {
        map.set(prog.media_id, prog.media_item);
      }
    }

    // 3. Add liked items
    const storedLikes = authStorage.getStoredLikesMedia();
    for (const liked of storedLikes) {
      if (!map.has(liked.id)) {
        map.set(liked.id, liked);
      }
    }

    return Array.from(map.values());
  }, [localItems, progressList]);

  const enrichedItems = useMemo(() => {
    return combinedItems.map((item) => {
      const prog = progressList.find((p) => p.media_id === item.id);
      return {
        ...item,
        progress_seconds: prog?.progress_seconds || item.progress_seconds || 0,
        total_seconds: prog?.total_seconds || item.total_seconds || 0,
      };
    });
  }, [combinedItems, progressList]);

  const filteredItems = useMemo(() => {
    let list = [...enrichedItems];

    if (filter === 'movie') {
      list = list.filter((i) => i.media_type === 'movie');
    } else if (filter === 'tv') {
      list = list.filter((i) => i.media_type === 'tv');
    } else if (filter === 'continue') {
      list = list.filter((i) => (i.progress_seconds || 0) > 0);
    } else if (filter === 'favorites') {
      list = list.filter((i) => likedIds.includes(i.id));
    }

    if (sortBy === 'rating') {
      list.sort((a, b) => b.vote_average - a.vote_average);
    } else if (sortBy === 'year') {
      list.sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));
    } else if (sortBy === 'title') {
      list.sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
    }

    return list;
  }, [enrichedItems, filter, sortBy, likedIds]);

  const handleRemove = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    authStorage.toggleWatchlist(id);
    authStorage.removeProgress(id);
    setLocalItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="mx-auto max-w-[1560px] px-3.5 sm:px-12 pt-16 sm:pt-20 pb-20 select-none animate-fadeIn">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Library
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {filteredItems.length} titles in your synchronized collection
          </p>
        </div>

        <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-2 overflow-x-auto no-scrollbar">
          {/* Filter Tabs */}
          <div className="flex items-center rounded-xl bg-[#18181d] border border-white/10 p-1 flex-shrink-0">
            {(['all', 'movie', 'tv', 'continue', 'favorites'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                  filter === tab
                    ? 'bg-white/15 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab === 'all'
                  ? 'All'
                  : tab === 'movie'
                  ? 'Movies'
                  : tab === 'tv'
                  ? 'Series'
                  : tab === 'continue'
                  ? 'In Progress'
                  : 'Favorites'}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 rounded-xl bg-[#18181d] border border-white/10 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs text-zinc-300 flex-shrink-0">
            <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-semibold text-white outline-none cursor-pointer text-xs"
            >
              <option value="recent" className="bg-[#18181d]">
                Recently Added
              </option>
              <option value="rating" className="bg-[#18181d]">
                IMDb Rating
              </option>
              <option value="year" className="bg-[#18181d]">
                Release Year
              </option>
              <option value="title" className="bg-[#18181d]">
                Title (A-Z)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Posters or Empty State */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4 pt-6 sm:pt-8">
          {filteredItems.map((item) => {
            const percent =
              item.progress_seconds && item.total_seconds
                ? Math.min(100, Math.round((item.progress_seconds / item.total_seconds) * 100))
                : null;

            return (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className="group relative cursor-pointer overflow-hidden rounded-md bg-[#18181d] border border-white/5 transition-transform duration-200 hover:scale-105"
              >
                {/* Floating IMDb Badge */}
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

                  {/* Watch Progress Bar */}
                  {percent !== null && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
                      <div
                        className="h-full transition-all"
                        style={{ width: `${percent}%`, background: accentHex }}
                      />
                    </div>
                  )}

                  {/* Mobile title banner always subtle at bottom */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 sm:hidden">
                    <span className="text-[11px] font-semibold text-white line-clamp-1">
                      {item.title || item.name}
                    </span>
                  </div>

                  {/* Hover Overlay for desktop */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 hidden sm:flex flex-col justify-end">
                    <span className="text-xs font-bold text-white line-clamp-1">
                      {item.title || item.name}
                    </span>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlay(item);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black hover:bg-white/80 transition-all shadow"
                        title="Play"
                      >
                        <Play className="h-3.5 w-3.5 fill-black" />
                      </button>

                      <button
                        onClick={(e) => handleRemove(e, item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 hover:bg-red-500/80 text-white transition-all ml-auto"
                        title="Remove from Library"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg font-bold text-white">Your library is empty</p>
          <p className="text-sm text-zinc-400 mt-1 max-w-sm">
            Save movies, series, or watch titles to build your personalized synchronized collection.
          </p>
          <button
            onClick={onNavigateDiscover}
            className="mt-6 px-6 py-2.5 rounded-lg text-sm font-bold text-black transition-all hover:scale-105"
            style={{ background: '#fff' }}
          >
            Explore Discover Catalog
          </button>
        </div>
      )}
    </div>
  );
};
