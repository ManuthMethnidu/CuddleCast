import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Users,
  X,
  User,
  LogOut,
  LogIn,
  Sliders,
  Settings as SettingsIcon,
  Home,
  Compass,
  Film,
  Menu,
  BookOpen,
  Tv,
  Tv2,
  Radio,
} from 'lucide-react';
import { UserProfile } from '../types/schema';
import { useAccent } from '../context/AccentContext';
import { Show, UserButton } from '@clerk/react';
import { WatchPartyModal } from './WatchPartyModal';
import { SettingsModal } from './SettingsModal';
import { EchoraLogo } from './EchoraLogo';

interface NavbarProps {
  activeProfile: UserProfile;
  onSwitchProfile: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeProfile,
  onSwitchProfile,
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  onToggleSidebar,
}) => {
  const { accentHex } = useAccent();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isWatchPartyOpen, setIsWatchPartyOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY > 20;
          setIsScrolled(prev => (prev !== scrolled ? scrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Collapse search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        !searchQuery
      ) {
        setIsSearchActive(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);

  const navCategories = [
    { id: 'all', label: 'Home', icon: Home },
    { id: 'manga', label: 'Manga', icon: BookOpen, badge: 'HOT' },
    { id: 'anime', label: 'Anime', icon: Tv },
    { id: 'live-tv', label: 'Live TV', icon: Tv2 },
    { id: 'radio', label: 'Radio', icon: Radio },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'library', label: 'Library', icon: Film },
  ];

  return (
    <>
      {/* Top Header Navbar */}
      <header
        className={`fixed top-0 z-[100] w-full transition-all duration-300 pt-[env(safe-area-inset-top,0px)] ${
          isScrolled
            ? 'bg-[#303841]/95 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] py-2.5 sm:py-3'
            : 'bg-gradient-to-b from-[#303841]/90 via-[#303841]/40 to-transparent pt-3 pb-2.5 sm:pt-4 sm:pb-3'
        }`}
      >
        <div className="mx-auto flex items-center justify-between max-w-[1560px] px-3.5 sm:px-8 lg:px-12">
          {/* Left: Menu Trigger + Echora Logo + Desktop Nav Tabs */}
          <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 text-white transition-all active:scale-95"
                title="Echora Menu (All Channels, Anime, Manga, 4K, Sports, Radio)"
                aria-label="Open Navigation Menu"
              >
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}

            {/* Echora Logo & Wordmark */}
            <a
              href="#home"
              onClick={e => {
                e.preventDefault();
                onCategoryChange('home');
              }}
              className="flex items-center mr-2 sm:mr-4 transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <EchoraLogo size="md" />
            </a>

            {/* Desktop Nav Tabs (Hidden on mobile) */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navCategories.map(cat => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryChange(cat.id)}
                    className="relative py-1 font-medium transition-colors hover:text-white flex items-center gap-1.5"
                    style={{
                      color: isSelected ? '#ffffff' : 'var(--dx-text-2)',
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  >
                    <span>{cat.label}</span>
                    {cat.badge && (
                      <span
                        className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full leading-none"
                        style={{
                          backgroundColor: `${accentHex}30`,
                          color: accentHex,
                          border: `1px solid ${accentHex}60`,
                        }}
                      >
                        {cat.badge}
                      </span>
                    )}
                    {/* Underline */}
                    {isSelected && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-transform duration-300"
                        style={{ background: accentHex }}
                      />
                    )}
                  </button>
                );
              })}

              {/* Settings Tab */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="relative py-1 font-medium transition-colors hover:text-white text-[var(--dx-text-2)]"
              >
                Settings
              </button>
            </nav>
          </div>

          {/* Right: Search, Watch Party, Settings Icon & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* M3 Search Bar ("Search movies, shows, anime, manga...") */}
            <div ref={searchContainerRef} className="relative flex items-center">
              <div
                className={`relative flex items-center rounded-full border transition-all duration-300 ${
                  isSearchActive || searchQuery
                    ? 'w-40 sm:w-64 md:w-80 bg-[#353f49] border-[#2185D5] shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
                    : 'w-32 sm:w-56 bg-white/[0.08] border-white/10 hover:bg-white/[0.12]'
                }`}
              >
                <div className="pl-3 pr-1 text-zinc-400">
                  <Search className="h-4 w-4" />
                </div>

                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => onSearchChange(e.target.value)}
                  onFocus={() => setIsSearchActive(true)}
                  placeholder="Search Echora..."
                  className="h-9 w-full bg-transparent pr-7 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
                />

                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-2.5 p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* M3 Tonal Button: Watch Party */}
            <button
              onClick={() => setIsWatchPartyOpen(true)}
              className="hidden sm:flex h-9 items-center gap-2 px-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-xs font-medium text-zinc-100 hover:text-white transition-all active:scale-95 shadow-sm"
              title="Watch Party"
            >
              <Users className="h-4 w-4" style={{ color: accentHex }} />
              <span>Party</span>
            </button>

            {/* M3 Icon Button: Quick Settings */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-zinc-200 hover:text-white transition-all active:scale-95"
              title="Echora Settings & Themes"
            >
              <SettingsIcon className="h-4 w-4" />
            </button>

            {/* Clerk User Button or Local Profile Menu */}
            {Boolean(
              import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
              import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
            ) ? (
              <div className="flex items-center">
                <Show when="signed-in">
                  <UserButton />
                </Show>
                <Show when="signed-out">
                  <button
                    onClick={() => onCategoryChange('login')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110 active:scale-95 shadow-md"
                    style={{ background: accentHex }}
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                </Show>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="group flex items-center gap-1 rounded-lg p-0.5 transition-transform hover:scale-105 active:scale-95"
                  title={activeProfile.name}
                >
                  <img
                    src={activeProfile.avatar_url}
                    alt={activeProfile.name}
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-md object-cover border border-white/20 shadow"
                  />
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-[#3A4750] py-2 text-sm text-white shadow-2xl backdrop-blur-xl animate-fadeIn z-50">
                    <div className="border-b border-white/10 px-4 py-2">
                      <p className="font-bold text-white truncate">{activeProfile.name}</p>
                      <p className="text-[11px] text-zinc-300">Echora Viewer Profile</p>
                    </div>

                    <div className="py-1 text-xs">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onCategoryChange('login');
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 hover:bg-white/5 text-zinc-300 hover:text-white"
                      >
                        <LogIn className="h-3.5 w-3.5 text-[#2185D5]" /> Sign In / Account
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onSwitchProfile();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 hover:bg-white/5 text-zinc-300 hover:text-white"
                      >
                        <User className="h-3.5 w-3.5" /> Manage Profiles
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onCategoryChange('library');
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 hover:bg-white/5 text-zinc-300 hover:text-white"
                      >
                        <Sliders className="h-3.5 w-3.5" /> Library
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsWatchPartyOpen(true);
                        }}
                        className="flex sm:hidden w-full items-center gap-2 px-4 py-2 hover:bg-white/5 text-zinc-300 hover:text-white"
                      >
                        <Users className="h-3.5 w-3.5" /> Watch Party
                      </button>
                    </div>

                    <div className="border-t border-white/10 pt-1 text-xs">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onSwitchProfile();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-rose-400 hover:bg-rose-950/30"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* M3 Web Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-[#303841]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around shadow-[var(--md-sys-elevation-level3)] select-none">
        {[
          { id: 'all', label: 'Home', icon: Home },
          { id: 'manga', label: 'Manga', icon: BookOpen },
          { id: 'anime', label: 'Anime', icon: Tv },
          { id: 'live-tv', label: 'Live TV', icon: Tv2 },
          { id: 'radio', label: 'Radio', icon: Radio },
        ].map(cat => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 group"
            >
              <div
                className="h-8 w-14 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  backgroundColor: isSelected ? `${accentHex}28` : 'transparent',
                  color: isSelected ? accentHex : 'var(--dx-text-3)',
                }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className="text-[10px] mt-0.5 tracking-tight font-medium"
                style={{ color: isSelected ? '#FFFFFF' : 'var(--dx-text-3)' }}
              >
                {cat.label}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 group text-zinc-400 hover:text-white"
        >
          <div className="h-8 w-14 rounded-full flex items-center justify-center transition-all">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium text-zinc-400">Settings</span>
        </button>
      </nav>

      {/* Watch Party Modal */}
      <WatchPartyModal
        isOpen={isWatchPartyOpen}
        onClose={() => setIsWatchPartyOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};
