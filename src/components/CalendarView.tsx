import React from 'react';
import { MediaItem } from '../types/schema';
import { Calendar as CalendarIcon, Clock, Bell } from 'lucide-react';
import { useAccent } from '../context/AccentContext';

interface CalendarViewProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ items, onSelect }) => {
  const { accentHex } = useAccent();

  const scheduleDays = [
    { day: 'Today', date: 'Oct 26', items: items.slice(0, 3) },
    { day: 'Tomorrow', date: 'Oct 27', items: items.slice(3, 5) },
    { day: 'Wednesday', date: 'Oct 28', items: items.slice(5, 7) },
    { day: 'Thursday', date: 'Oct 29', items: items.slice(7, 9) },
    { day: 'Friday', date: 'Oct 30', items: items.slice(9, 12) },
  ];

  return (
    <div className="mx-auto max-w-[1560px] px-3.5 sm:px-12 pt-16 sm:pt-20 pb-20 select-none animate-fadeIn">
      <div className="flex items-center gap-3 pb-6 border-b border-white/10">
        <CalendarIcon className="h-6 w-6" style={{ color: accentHex }} />
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Release Calendar
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Upcoming episodes and movie premieres for your tracked addons and library
          </p>
        </div>
      </div>

      <div className="space-y-10 pt-8">
        {scheduleDays.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-white tracking-tight">
                {section.day}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-mono text-zinc-300">
                {section.date}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {section.items.map((item, i) => (
                <div
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="group relative flex gap-3 p-3 rounded-xl border border-white/10 bg-[#18181d] hover:bg-white/[0.08] hover:border-white/30 cursor-pointer transition-all"
                >
                  <img
                    src={item.poster_path || item.backdrop_path}
                    alt={item.title || item.name}
                    className="h-20 w-14 rounded-lg object-cover flex-none"
                  />
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <p className="text-xs font-bold text-white truncate">
                        {item.title || item.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        Episode {i + 1} · {item.media_type === 'tv' ? 'New Episode' : 'Streaming Premiere'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        8:00 PM
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          alert(`Tracking set for ${item.title || item.name}!`);
                        }}
                        className="p-1 rounded-full hover:bg-white/15 text-zinc-300 hover:text-white transition-colors"
                        title="Set Reminder"
                      >
                        <Bell className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
