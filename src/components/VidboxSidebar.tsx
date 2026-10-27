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
  X,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useAccent } from '../context/AccentContext';
import { useUser, useClerk } from '@clerk/react';

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
  | 'login';

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
  const { isSignedIn, user } = useUser();
  const { signOut, openUserProfile } = useClerk();

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

      {/* M3 Navigation Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-[160] w-64 sm:w-72 rounded-r-[28px] bg-[#303841] border-r border-[#3A4750] text-[#F3F3F3] flex flex-col shadow-[var(--md-sys-elevation-level4)] transition-transform duration-300 ease-in-out select-none overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#3A4750]">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Echora" className="h-6 w-6 object-contain" />
            <span
              className="font-black text-2xl uppercase tracking-wider"
              style={{ fontFamily: "'Bebas Neue', sans-serif", color: accentHex }}
            >
              ECHORA
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 border border-white/10 px-1.5 py-0.5 rounded-full">
              v2.15
            </span>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Items List (M3 Navigation Drawer items) */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-3 px-3 space-y-1">
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
                className={`group flex items-center w-full gap-3 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white font-semibold shadow-sm'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
                style={{
                  backgroundColor: isActive ? `${accentHex}24` : undefined,
                  color: isActive ? '#FFFFFF' : undefined,
                }}
              >
                {Icon && (
                  <Icon
                    className={`h-4 w-4 flex-none transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'
                    }`}
                    style={{ color: isActive ? accentHex : undefined }}
                  />
                )}

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

        {/* Account / Authentication Status Area */}
        <div className="p-3 border-t border-white/10 bg-[#303841]">
          {isSignedIn && user ? (
            <div className="space-y-2">
              <div
                onClick={() => {
                  if (openUserProfile) openUserProfile();
                }}
                className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
                title="Manage Account"
              >
                <img
                  src={user.imageUrl}
                  alt={user.fullName || 'User'}
                  className="h-9 w-9 rounded-full object-cover border border-white/20 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white truncate">
                      {user.fullName || user.username || 'Echora Member'}
                    </p>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="Active Session" />
                  </div>
                  <p className="text-[10px] text-zinc-400 truncate">
                    {user.primaryEmailAddress?.emailAddress || 'Signed In'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  signOut();
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors border border-rose-500/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onSelectView('login');
                onClose();
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all active:scale-98 shadow-sm"
            >
              <LogIn className="h-4 w-4" style={{ color: accentHex }} />
              <span>Sign In / Create Account</span>
            </button>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-white/10 bg-[#3A4750] text-xs text-zinc-300 flex items-center justify-between">
          <span className="text-[11px]">Echora · Streaming Engine</span>
          <span className="text-[10px] font-mono text-zinc-500">100% Ad-Free</span>
        </div>
      </aside>
    </>
  );
};
