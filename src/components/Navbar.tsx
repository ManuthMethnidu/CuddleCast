import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Download,
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
  Sliders,
} from 'lucide-react';
import { UserProfile } from '../types/schema';

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
  const [isDark, setIsDark] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
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
          ? 'bg-black/95 backdrop-blur-md shadow-xl border-b border-white/5 py-3'
          : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent pt-4 pb-3'
      }`}
    >
      <div className="mx-auto flex items-center justify-between max-w-[1440px] px-4 md:px-6 lg:px-8">
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-8">
          <a
            href="#home"
            onClick={e => {
              e.preventDefault();
              onCategoryChange('all');
            }}
            className="flex items-center transition-transform hover:scale-105"
          >
            <img src="/logo.png" alt="Vidbox" className="h-8 w-auto object-contain sm:h-9" />
          </a>

          {/* Primary Category Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`transition-colors hover:text-white ${
                  activeCategory === cat.id
                    ? 'font-bold text-white border-b-2 border-red-500 pb-0.5'
                    : 'text-gray-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Center Search Input (Responsive Expandable) */}
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
                placeholder="Search movies, TV..."
                className="h-9 w-full rounded-3xl border border-white/10 bg-black/60 pl-20 pr-9 text-sm text-white placeholder:text-gray-400 focus:border-white/30 focus:bg-black/90 focus:outline-none focus:ring-0 shadow-inner"
              />

              {/* Filter badge */}
              <button
                type="button"
                onClick={() => {
                  if (activeCategory === 'movie') onCategoryChange('tv');
                  else if (activeCategory === 'tv') onCategoryChange('all');
                  else onCategoryChange('movie');
                }}
                className="absolute left-1.5 top-[5px] flex items-center gap-1.5 rounded-2xl bg-zinc-800 px-2.5 py-1 text-xs text-gray-300 hover:bg-zinc-700 hover:text-white transition-colors"
                title="Filter content type"
              >
                <Filter className="h-3 w-3 text-red-500" />
                <span className="capitalize">{activeCategory === 'all' ? 'Filter' : activeCategory}</span>
              </button>

              {/* Search or Clear Icon */}
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => searchInputRef.current?.focus()}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-white"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Navigation & Utility Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-md text-white transition-colors hover:bg-white/10"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-white" />}
          </button>

          {/* Download App Shortcut */}
          <button
            onClick={() => alert('Vidbox PWA is ready for offline streaming!')}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-md text-white transition-colors hover:bg-white/10"
            title="Download App"
          >
            <Download className="h-5 w-5" />
          </button>

          {/* Profile Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 rounded-full p-1 transition-transform hover:scale-105"
              aria-label="User Profile"
            >
              <img
                src={activeProfile.avatar_url}
                alt={activeProfile.name}
                className="h-8 w-8 rounded-md border border-white/20 object-cover"
              />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md border border-zinc-800 bg-zinc-950/95 py-2 text-sm text-white shadow-2xl backdrop-blur-md animate-fadeIn">
                <div className="border-b border-zinc-800 px-4 py-2">
                  <p className="font-semibold text-white">{activeProfile.name}</p>
                  <p className="text-xs text-zinc-400">Personalized Streaming</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSwitchProfile();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                  >
                    <User className="h-4 w-4" /> Switch Profile
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onCategoryChange('watchlist');
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                  >
                    <Sliders className="h-4 w-4" /> My Watchlist
                  </button>
                </div>

                <div className="border-t border-zinc-800 pt-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSwitchProfile();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-red-400 hover:bg-zinc-800 hover:text-red-300"
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
            className="flex h-9 w-9 items-center justify-center rounded-md text-white hover:bg-white/10 lg:hidden"
            aria-label="Mobile Navigation"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="border-b border-zinc-800 bg-black/95 px-6 py-4 lg:hidden animate-fadeIn">
          <nav className="flex flex-col gap-3">
            {navCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  onCategoryChange(cat.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left text-base font-medium py-1 ${
                  activeCategory === cat.id ? 'font-bold text-red-500' : 'text-gray-300'
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
