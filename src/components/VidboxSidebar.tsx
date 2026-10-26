import React from 'react';
import {
  Home,
  Clapperboard,
  Tv,
  Sword,
  BookOpen,
  Library,
  Sparkles,
  Theater,
  Tv2,
  Trophy,
  Radio,
  Clock,
  History,
  Bookmark,
  Bitcoin,
  X,
} from 'lucide-react';
import { useAccent } from '../context/AccentContext';

export type NavViewId =
  | 'home'
  | 'movies'
  | 'series'
  | 'anime'
  | 'manga'
  | 'collection'
  | '4k'
  | 'drama'
  | 'live-tv'
  | 'live-sports'
  | 'radio'
  | 'continue-watch'
  | 'history'
  | 'watchlist'
  | 'donate'
  | 'discord';

interface VidboxSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: NavViewId;
  onSelectView: (view: NavViewId) => void;
}

export const VidboxSidebar: React.FC<VidboxSidebarProps> = ({
  isOpen,
  onClose,
  activeView,
  onSelectView,
}) => {
  const { accentHex } = useAccent();

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'movies' as const, label: 'Movies', icon: Clapperboard },
    { id: 'series' as const, label: 'Series', icon: Tv },
    { id: 'anime' as const, label: 'Anime', icon: Sword },
    { id: 'manga' as const, label: 'Manga', icon: BookOpen },
    { id: 'collection' as const, label: 'Collection', icon: Library },
    { id: '4k' as const, label: '4k', icon: Sparkles },
    { id: 'drama' as const, label: 'Drama', icon: Theater },
    { id: 'live-tv' as const, label: 'Live TV', icon: Tv2 },
    { id: 'live-sports' as const, label: 'Live Sports', icon: Trophy },
    { id: 'radio' as const, label: 'Radio', icon: Radio },
    { id: 'continue-watch' as const, label: 'Continue Watch', icon: Clock },
    { id: 'history' as const, label: 'History', icon: History },
    { id: 'watchlist' as const, label: 'Watchlist', icon: Bookmark },
    { id: 'donate' as const, label: 'Donate', icon: Bitcoin },
    { id: 'discord' as const, label: 'Discord', isDiscord: true },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[150] bg-black/75 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-out Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-[160] w-64 sm:w-72 bg-[#0c0c10] border-r border-white/10 text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#09090c]">
          <div className="flex items-center gap-2.5">
            <span
              className="font-black text-2xl uppercase tracking-wider"
              style={{ fontFamily: "'Bebas Neue', sans-serif", color: accentHex }}
            >
              DX.BI
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border border-white/10 px-1.5 py-0.5 rounded">
              v2.15
            </span>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-3 space-y-0.5">
          {navItems.map(item => {
            const isActive = activeView === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  onClose();
                }}
                className={`group flex items-center w-full gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold shadow-inner'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
                style={{
                  borderLeft: isActive ? `3px solid ${accentHex}` : '3px solid transparent',
                }}
              >
                {item.isDiscord ? (
                  <svg
                    className="h-4 w-4 flex-none transition-transform group-hover:scale-110"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ color: '#5865F2' }}
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                ) : Icon ? (
                  <Icon
                    className={`h-4 w-4 flex-none transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'
                    }`}
                    style={{ color: isActive ? accentHex : undefined }}
                  />
                ) : null}

                <span className="truncate">{item.label}</span>

                {item.id === 'live-tv' && (
                  <span className="ml-auto text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                    Live
                  </span>
                )}
                {item.id === 'live-sports' && (
                  <span className="ml-auto text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Scores
                  </span>
                )}
                {item.id === '4k' && (
                  <span className="ml-auto text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    UHD
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-white/10 bg-[#09090c] text-xs text-zinc-400 flex items-center justify-between">
          <span className="text-[11px]">CuddleCast · Vidbox Engine</span>
          <span className="text-[10px] font-mono text-zinc-500">100% Ad-Free</span>
        </div>
      </aside>
    </>
  );
};
