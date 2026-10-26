import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Users,
  X,
  User,
  LogOut,
  Sliders,
  Settings as SettingsIcon,
} from 'lucide-react';
import { UserProfile } from '../types/schema';
import { useAccent } from '../context/AccentContext';
import { WatchPartyModal } from './WatchPartyModal';
import { SettingsModal } from './SettingsModal';

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
    { id: 'all', label: 'Home' },
    { id: 'discover', label: 'Discover' },
    { id: 'library', label: 'Library' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'addons', label: 'Addons' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 z-[100] w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0b0b0d]/95 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] py-3'
            : 'bg-gradient-to-b from-black/80 via-black/30 to-transparent pt-4 pb-3'
        }`}
      >
        <div className="mx-auto flex items-center justify-between max-w-[1560px] px-4 md:px-8 lg:px-12">
          {/* Left: DX.BI Wordmark + Desktop Nav Tabs */}
          <div className="flex items-center gap-7 lg:gap-10">
            {/* DX.BI Wordmark in Bebas Neue */}
            <a
              href="#home"
              onClick={e => {
                e.preventDefault();
                onCategoryChange('all');
              }}
              className="flex items-center transition-transform hover:scale-105 active:scale-95"
            >
              <span
                className="font-black text-3xl sm:text-4xl tracking-tight leading-none uppercase select-none"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  color: accentHex,
                  textShadow: `0 2px 14px ${accentHex}50`,
                }}
              >
                DX.BI
              </span>
            </a>

            {/* Nav Tabs */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navCategories.map(cat => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryChange(cat.id)}
                    className="relative py-1 font-medium transition-colors hover:text-white"
                    style={{
                      color: isSelected ? '#ffffff' : 'var(--dx-text-2)',
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  >
                    <span>{cat.label}</span>
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
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Bar ("Search or paste link") */}
            <div ref={searchContainerRef} className="relative flex items-center">
              <div
                className={`relative flex items-center rounded-lg border transition-all duration-300 ${
                  isSearchActive || searchQuery
                    ? 'w-48 sm:w-64 md:w-80 bg-black/90 border-white/50 shadow-lg'
                    : 'w-36 sm:w-56 bg-white/[0.06] border-white/10 hover:bg-white/[0.09]'
                }`}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => onSearchChange(e.target.value)}
                  onFocus={() => setIsSearchActive(true)}
                  placeholder="Search or paste link"
                  className="h-9 w-full bg-transparent pl-3.5 pr-8 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                />

                {searchQuery ? (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-2 text-zinc-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => searchInputRef.current?.focus()}
                    className="absolute right-2 text-zinc-400 hover:text-white"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Watch Party Button */}
            <button
              onClick={() => setIsWatchPartyOpen(true)}
              className="flex h-9 items-center gap-1.5 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-zinc-200 hover:text-white transition-all active:scale-95"
              title="Watch Party"
            >
              <Users className="h-3.5 w-3.5" style={{ color: accentHex }} />
              <span className="hidden sm:inline">Party</span>
            </button>

            {/* Quick Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-200 hover:text-white transition-all active:scale-95"
              title="dx.bi Settings & Accents"
            >
              <SettingsIcon className="h-4 w-4" />
            </button>

            {/* Profile Avatar & Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center rounded-md overflow-hidden border-2 transition-transform hover:scale-105"
                style={{ borderColor: accentHex }}
                aria-label="User Profile"
              >
                <img
                  src={activeProfile.avatar_url}
                  alt={activeProfile.name}
                  className="h-8 w-8 object-cover"
                />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-[#18181d] py-2 text-sm text-white shadow-2xl backdrop-blur-xl animate-fadeIn z-50">
                  <div className="border-b border-white/10 px-4 py-2">
                    <p className="font-bold text-white truncate">{activeProfile.name}</p>
                    <p className="text-[11px] text-zinc-400">dx.bi Viewer Profile</p>
                  </div>

                  <div className="py-1 text-xs">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onSwitchProfile();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 hover:bg-white/5 text-zinc-300 hover:text-white"
                    >
                      <User className="h-3.5 w-3.5" /> Switch Profile
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
          </div>
        </div>
      </header>

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
