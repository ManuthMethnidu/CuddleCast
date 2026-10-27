import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Users,
  X,
  LogIn,
  LogOut,
  Settings as SettingsIcon,
  Home,
  Compass,
  Film,
  Menu,
  BookOpen,
  Tv,
  Tv2,
  Radio,
  ChevronDown,
  UserCog,
  ArrowLeftRight,
  UserCheck,
} from 'lucide-react';
import { useAccent } from '../context/AccentContext';
import { useUser, useClerk, useSessionList } from '@clerk/react';
import { WatchPartyModal } from './WatchPartyModal';
import { EchoraLogo } from './EchoraLogo';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  onToggleSidebar,
}) => {
  const { accentHex } = useAccent();
  const { isSignedIn, user } = useUser();
  const { openUserProfile, openSignIn, signOut, setActive } = useClerk();
  const { sessions } = useSessionList();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isWatchPartyOpen, setIsWatchPartyOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    if (isAccountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAccountMenuOpen]);

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
                onClick={() => onCategoryChange('settings')}
                className={`relative py-1 font-medium transition-colors hover:text-white ${
                  activeCategory === 'settings' ? 'text-white font-bold' : 'text-[var(--dx-text-2)]'
                }`}
              >
                <span>Settings</span>
                {activeCategory === 'settings' && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full"
                    style={{ background: accentHex }}
                  />
                )}
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
              onClick={() => onCategoryChange('settings')}
              className={`hidden sm:flex h-9 w-9 items-center justify-center rounded-full border transition-all active:scale-95 ${
                activeCategory === 'settings'
                  ? 'bg-white/20 border-white text-white'
                  : 'bg-white/[0.08] hover:bg-white/[0.14] border-white/10 text-zinc-200 hover:text-white'
              }`}
              title="System Settings & Performance"
            >
              <SettingsIcon
                className="h-4 w-4"
                style={{ color: activeCategory === 'settings' ? accentHex : undefined }}
              />
            </button>

            {/* Clerk Authentication & Switch Account Controls */}
            {isSignedIn && user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="group flex items-center gap-2 rounded-xl p-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:border-white/20 active:scale-95"
                  title={`Signed in as ${user.fullName || user.username || 'User'}`}
                >
                  <div className="relative">
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || 'User'}
                      className="h-8 w-8 rounded-lg object-cover border border-white/20 shadow"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#303841]" />
                  </div>
                  <span className="hidden md:inline text-xs font-semibold text-zinc-200 max-w-[100px] truncate">
                    {user.fullName || user.username || 'Account'}
                  </span>
                  <ChevronDown
                    className="h-3.5 w-3.5 text-zinc-400 group-hover:text-white transition-transform duration-200"
                    style={{ transform: isAccountMenuOpen ? 'rotate(180deg)' : 'none' }}
                  />
                </button>

                {/* Clerk Account Dropdown Menu */}
                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-white/10 bg-[#303841] p-3 text-sm text-white shadow-2xl backdrop-blur-2xl animate-fadeIn z-50 space-y-3">
                    {/* Active Account Header */}
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <img
                        src={user.imageUrl}
                        alt={user.fullName || 'User'}
                        className="h-10 w-10 rounded-xl object-cover border border-white/20"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-white text-xs truncate">
                            {user.fullName || user.username || 'Clerk User'}
                          </p>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        </div>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {user.primaryEmailAddress?.emailAddress || 'Signed In'}
                        </p>
                      </div>
                    </div>

                    {/* Multi-Account Sessions (if multiple accounts are active) */}
                    {sessions && sessions.length > 1 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2">
                          Switch Active Account
                        </p>
                        <div className="space-y-1">
                          {sessions.map((s) => {
                            const isCurrent = s.id === user.id || s.user?.id === user.id;
                            const sessionUser = s.user;
                            return (
                              <button
                                key={s.id}
                                onClick={() => {
                                  setActive({ session: s.id });
                                  setIsAccountMenuOpen(false);
                                }}
                                className={`flex items-center justify-between w-full p-2 rounded-xl text-xs transition-colors ${
                                  isCurrent
                                    ? 'bg-white/15 text-white font-bold'
                                    : 'hover:bg-white/5 text-zinc-300 hover:text-white'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img
                                    src={sessionUser?.imageUrl || user.imageUrl}
                                    alt="Account"
                                    className="h-6 w-6 rounded-md object-cover border border-white/20 flex-shrink-0"
                                  />
                                  <div className="min-w-0 text-left">
                                    <p className="truncate text-xs">
                                      {sessionUser?.fullName || sessionUser?.primaryEmailAddress?.emailAddress || 'User'}
                                    </p>
                                  </div>
                                </div>
                                {isCurrent ? (
                                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                                    <UserCheck className="h-3 w-3" /> Active
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-zinc-400">Switch</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Switch / Add Another Account Action */}
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          if (openSignIn) {
                            openSignIn();
                          } else {
                            onCategoryChange('login');
                          }
                        }}
                        className="flex items-center gap-2 w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors border border-white/5"
                      >
                        <ArrowLeftRight className="h-4 w-4" style={{ color: accentHex }} />
                        <div className="text-left">
                          <p className="font-bold">Switch Account</p>
                          <p className="text-[10px] text-zinc-400">Sign in to another Clerk account</p>
                        </div>
                      </button>
                    </div>

                    {/* Manage Account & Sign Out Controls */}
                    <div className="pt-2 border-t border-white/10 space-y-1 text-xs">
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          if (openUserProfile) openUserProfile();
                        }}
                        className="flex w-full items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/5 text-zinc-300 hover:text-white transition-colors"
                      >
                        <UserCog className="h-3.5 w-3.5" />
                        <span>Manage Account & Security</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onCategoryChange('settings');
                        }}
                        className="flex w-full items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/5 text-zinc-300 hover:text-white transition-colors"
                      >
                        <SettingsIcon className="h-3.5 w-3.5" />
                        <span>System Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          signOut();
                        }}
                        className="flex w-full items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  if (openSignIn) {
                    openSignIn();
                  } else {
                    onCategoryChange('login');
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:brightness-110 active:scale-95 shadow-md"
                style={{ background: accentHex }}
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </button>
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
          onClick={() => onCategoryChange('settings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 group ${
            activeCategory === 'settings' ? 'text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <div
            className={`h-8 w-14 rounded-full flex items-center justify-center transition-all ${
              activeCategory === 'settings' ? 'bg-white/15' : ''
            }`}
          >
            <SettingsIcon
              className="h-5 w-5"
              style={{ color: activeCategory === 'settings' ? accentHex : undefined }}
            />
          </div>
          <span
            className="text-[10px] mt-0.5 tracking-tight font-medium"
            style={{ color: activeCategory === 'settings' ? '#FFFFFF' : 'var(--dx-text-3)' }}
          >
            Settings
          </span>
        </button>
      </nav>

      {/* Watch Party Modal */}
      <WatchPartyModal
        isOpen={isWatchPartyOpen}
        onClose={() => setIsWatchPartyOpen(false)}
      />
    </>
  );
};
