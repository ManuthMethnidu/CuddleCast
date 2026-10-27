import React, { useState, useEffect } from 'react';
import { History, Play, Trash2 } from 'lucide-react';
import { MediaItem } from '../types/schema';
import { authStorage } from '../services/storage';
import { useAccent } from '../context/AccentContext';

interface HistoryViewProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  onPlay: (item: MediaItem) => void;
  onNavigateHome: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  items,
  onSelect,
  onPlay,
  onNavigateHome,
}) => {
  const { accentHex } = useAccent();

  const loadHistoryItems = (): MediaItem[] => {
    const progressList = authStorage.getProgressList();
    return progressList
      .map((prog) => {
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
          last_watched: prog.last_watched || 'Today',
        };
      })
      .filter((i) => (i.progress_seconds || 0) > 0);
  };

  const [historyItems, setHistoryItems] = useState<MediaItem[]>(loadHistoryItems);

  // Subscribe to authStorage user switches or progress updates
  useEffect(() => {
    const reload = () => {
      setHistoryItems(loadHistoryItems());
    };
    const unsubscribe = authStorage.subscribe(reload);
    return unsubscribe;
  }, [items]);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your entire watch history?')) {
      authStorage.clearProgress();
      setHistoryItems([]);
    }
  };

  const handleRemoveSingle = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    authStorage.removeProgress(id);
    setHistoryItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="mx-auto max-w-[1560px] px-3.5 sm:px-12 pt-16 sm:pt-20 pb-20 select-none animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `${accentHex}20`, color: accentHex }}
          >
            <History className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Watch History
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Playback timeline, resume timestamps, and completed episodes
            </p>
          </div>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History Items List */}
      {historyItems.length > 0 ? (
        <div className="space-y-3 pt-8">
          {historyItems.map((item) => {
            const percent =
              item.progress_seconds && item.total_seconds
                ? Math.min(100, Math.round((item.progress_seconds / item.total_seconds) * 100))
                : 45;

            return (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#131317] border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
              >
                {/* Poster Thumbnail */}
                <div className="relative h-20 w-32 rounded-xl overflow-hidden flex-none bg-black">
                  <img
                    src={item.backdrop_path || item.poster_path}
                    alt={item.title || item.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlay(item);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow"
                    >
                      <Play className="h-4 w-4 fill-black ml-0.5" />
                    </button>
                  </div>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-black/60">
                    <div
                      className="h-full"
                      style={{ width: `${percent}%`, background: accentHex }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">
                    {item.media_type === 'tv' ? 'Series' : 'Movie'} · Watched Recently
                  </span>
                  <h3 className="font-bold text-white text-sm sm:text-base truncate group-hover:text-amber-400 transition-colors">
                    {item.title || item.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1 font-mono">
                    <span className="text-zinc-300 font-semibold">{percent}% completed</span>
                    <span>•</span>
                    <span>IMDb {item.vote_average.toFixed(1)}</span>
                  </div>
                </div>

                {/* Remove single action */}
                <button
                  onClick={(e) => handleRemoveSingle(e, item.id)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                  title="Remove from history"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <History className="h-12 w-12 text-zinc-600 mb-3" />
          <p className="text-base font-bold text-white">No watch history yet</p>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm">
            Titles you watch will automatically be recorded here with down-to-the-second progress timestamps.
          </p>
          <button
            onClick={onNavigateHome}
            className="mt-6 px-6 py-2.5 rounded-lg text-xs font-bold text-black bg-white hover:bg-zinc-200 transition-all"
          >
            Browse Trending Titles
          </button>
        </div>
      )}
    </div>
  );
};
