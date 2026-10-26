import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Users,
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../types/schema';
import { CuddleCastLogo } from './CuddleCastLogo';

interface NavbarProps {
  activeProfile: UserProfile;
  onSwitchProfile: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeProfile,
  onSwitchProfile,
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showPartyBanner, setShowPartyBanner] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to collapse search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        !searchQuery
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);

  const toggleTheme = () => {
    const doc = document.documentElement;
    if (isDark) {
      doc.classList.remove('dark');
      doc.style.colorScheme = 'light';
      setIsDark(false);
    } else {
      doc.classList.add('dark');
      doc.style.colorScheme = 'dark';
      setIsDark(true);
    }
  };

  const navCategories = [
    { id: 'all', label: 'Home' },
    { id: 'tv', label: 'TV Shows' },
    { id: 'movie', label: 'Movies' },
    { id: 'trending', label: 'New & Popular' },
    { id: 'watchlist', label: 'My List' },
  ];

  return (
    <header
      className={`fixed top-0 z-[100] w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#070b14]/92 backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(7,11,20,0.9)] border-b border-blue-900/30 py-3'
          : 'bg-gradient-to-b from-[#070b14]/95 via-[#070b14]/60 to-transparent pt-4 pb-3'
      }`}
    >
      <div className="mx-auto flex items-center justify-between max-w-[1440px] px-4 md:px-6 lg:px-8">
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-7 lg:gap-10">
          <a
            href="#home"
            onClick={e => {
              e.preventDefault();
              onCategoryChange('all');
            }}
            className="flex items-center transition-transform hover:scale-105 active:scale-95"
            aria-label="CuddleCast Home"
          >
            <CuddleCastLogo size="md" />
          </a>

          {/* Primary Category Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`transition-all duration-200 hover:text-sky-300 ${
                  activeCategory === cat.id
                    ? 'font-bold text-white border-b-2 border-sky-400 pb-0.5 shadow-[0_4px_12px_rgba(56,189,248,0.5)]'
                    : 'text-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Center Search Input (Responsive Expandable with Blue Glow) */}
        <div ref={searchContainerRef} className="relative flex items-center">
          <div
            className={`flex items-center transition-all duration-300 ${
              isSearchOpen || searchQuery
                ? 'w-48 sm:w-64 md:w-80 lg:w-[420px]'
                : 'w-36 sm:w-48 md:w-60'
            }`}
          >
            <div className="relative w-full">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search movies, TV shows, genres..."
                className="h-9 w-full rounded-3xl border border-blue-900/40 bg-slate-900/80 pl-20 pr-9 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30 shadow-inner transition-all"
              />

              {/* Filter badge */}
              <button
                type="button"
                onClick={() => {
                  if (activeCategory === 'movie') onCategoryChange('tv');
                  else if (activeCategory === 'tv') onCategoryChange('all');
                  else onCategoryChange('movie');
                }}
                className="absolute left-1.5 top-[5px] flex items-center gap-1.5 rounded-2xl bg-slate-800/90 border border-slate-700/60 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                title="Filter content type"
              >
                <Filter className="h-3 w-3 text-sky-400" />
                <span className="capitalize">{activeCategory === 'all' ? 'Filter' : activeCategory}</span>
              </button>

              {/* Search or Clear Icon */}
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-sky-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => searchInputRef.current?.focus()}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-sky-300 transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Navigation & Utility Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Watch Party Feature Pill */}
          <button
            onClick={() => setShowPartyBanner(!showPartyBanner)}
            className="hidden md:flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-950/40 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-900/50 hover:border-sky-400 transition-all shadow-[0_0_10px_rgba(56,189,248,0.2)]"
            title="Watch Party & Cuddle Lounge"
          >
            <Users className="h-3.5 w-3.5 text-sky-400" />
            <span>Watch Party</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-sky-300" />}
          </button>

          {/* Profile Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 rounded-full p-0.5 border border-sky-400/40 hover:border-sky-400 transition-all hover:scale-105 shadow-[0_0_10px_rgba(56,189,248,0.3)]"
              aria-label="User Profile"
            >
              <img
                src={activeProfile.avatar_url}
                alt={activeProfile.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-[#0c1322]/95 py-2 text-sm text-white shadow-2xl backdrop-blur-xl animate-fadeIn">
                <div className="border-b border-slate-800 px-4 py-2.5">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    {activeProfile.name}
                    <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                  </p>
                  <p className="text-xs text-sky-400/80">Cozy Cinema Member</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSwitchProfile();
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 hover:bg-blue-900/30 text-slate-300 hover:text-sky-300 transition-colors"
                  >
                    <User className="h-4 w-4" /> Switch Profile
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onCategoryChange('watchlist');
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 hover:bg-blue-900/30 text-slate-300 hover:text-sky-300 transition-colors"
                  >
                    <Sliders className="h-4 w-4" /> My Watchlist
                  </button>
                </div>

                <div className="border-t border-slate-800 pt-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSwitchProfile();
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out of Profiles
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/10 lg:hidden"
            aria-label="Mobile Navigation"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Watch Party Alert Popover */}
      {showPartyBanner && (
        <div className="border-b border-sky-500/20 bg-gradient-to-r from-blue-950/90 via-slate-900/90 to-sky-950/90 px-4 py-2.5 text-center text-xs text-sky-200 backdrop-blur-md animate-fadeIn">
          <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-sky-400" />
            <span className="font-semibold text-white">CuddleCast Watch Party:</span>
            <span>Sync playback and chat live with friends from anywhere in the world!</span>
            <button
              onClick={() => setShowPartyBanner(false)}
              className="ml-3 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="border-b border-slate-800 bg-[#070b14]/98 px-6 py-4 lg:hidden animate-fadeIn">
          <nav className="flex flex-col gap-3">
            {navCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  onCategoryChange(cat.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left text-base font-medium py-1 transition-colors ${
                  activeCategory === cat.id ? 'font-bold text-sky-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
