import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Settings as SettingsIcon,
  Home,
  Menu,
  BookOpen,
  Tv,
  Tv2,
  Trophy,
  UserCog,
  Sliders,
} from 'lucide-react';
import { useAccent } from '../context/AccentContext';
import { useUser, useClerk, useSessionList } from '@clerk/react';
import { EchoraLogo } from './EchoraLogo';
import { ProfileDropdown, Account, ProfileMenuItem } from './ProfileDropdown';
import { NavbarCustomizerModal, ALL_NAV_ITEMS } from './NavbarCustomizerModal';
import { useSettingsStore, DEFAULT_NAV_ITEMS } from '../store/settingsStore';

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

  const { enabledNavItems = DEFAULT_NAV_ITEMS } = useSettingsStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isNavbarCustomizerOpen, setIsNavbarCustomizerOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY > 20;
          setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
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

  // Visible navigation categories dynamically driven by user selection
  const visibleNavCategories = ALL_NAV_ITEMS.filter((item) =>
    enabledNavItems.includes(item.id)
  );

  // Prepare accounts for KokonutUI ProfileDropdown
  const dropdownAccounts: Account[] =
    sessions && sessions.length > 0
      ? sessions.map((s) => ({
          id: s.id,
          name: s.user?.fullName || s.user?.username || 'Clerk User',
          email: s.user?.primaryEmailAddress?.emailAddress || '',
          imageUrl: s.user?.imageUrl,
          plan: 'Pro',
        }))
      : user
      ? [
          {
            id: user.id,
            name: user.fullName || user.username || 'User',
            email: user.primaryEmailAddress?.emailAddress || '',
            imageUrl: user.imageUrl,
            plan: 'Pro',
          },
        ]
      : [
          {
            id: 'guest',
            name: 'Guest User',
            email: 'guest@echora.stream',
            plan: 'Free',
          },
        ];

  // Menu items inside KokonutUI ProfileDropdown
  const profileMenuItems: ProfileMenuItem[] = [
    {
      label: 'Customize Navbar',
      icon: <Sliders className="size-4" />,
      value: 'Select',
      onSelect: () => setIsNavbarCustomizerOpen(true),
    },
    {
      label: 'Profile',
      icon: <UserCog className="size-4" />,
      onSelect: () => {
        if (isSignedIn && openUserProfile) {
          openUserProfile();
        } else if (openSignIn) {
          openSignIn();
        } else {
          onCategoryChange('login');
        }
      },
    },
    {
      label: 'System Settings',
      icon: <SettingsIcon className="size-4" />,
      value: '⌘,',
      onSelect: () => onCategoryChange('settings'),
    },
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
        <div className="mx-auto flex items-center justify-between max-w-[1560px] px-3.5 sm:px-6 lg:px-8">
          {/* Left: Menu Trigger + Echora Logo + Desktop Nav Tabs */}
          <div className="flex items-center gap-2 sm:gap-5 lg:gap-7 min-w-0">
            {onToggleSidebar && (
              <md-icon-button
                onClick={onToggleSidebar}
                title="Echora Menu (All Channels, Anime, Manga, 4K, Sports, Radio)"
                aria-label="Open Navigation Menu"
              >
                <Menu className="h-5 w-5 text-white" />
              </md-icon-button>
            )}

            {/* Echora Logo & Wordmark */}
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                onCategoryChange('all');
              }}
              className="flex items-center mr-1 sm:mr-3 transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <EchoraLogo size="md" />
            </a>

            {/* Desktop Nav Tabs (Old classic nav links, dynamically driven by user selection) */}
            <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-sm font-medium overflow-x-auto no-scrollbar py-0.5">
              {visibleNavCategories.map((cat) => {
                const isSelected =
                  activeCategory === cat.id ||
                  (cat.id === 'all' && activeCategory === 'home');
                return (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryChange(cat.id)}
                    className="relative py-1 font-medium transition-colors hover:text-white flex items-center gap-1.5 shrink-0"
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
                className="relative py-1 font-medium transition-colors hover:text-white shrink-0"
                style={{
                  color: activeCategory === 'settings' ? '#ffffff' : 'var(--dx-text-2)',
                  fontWeight: activeCategory === 'settings' ? 700 : 500,
                }}
              >
                <span>Settings</span>
                {activeCategory === 'settings' && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full transition-transform duration-300"
                    style={{ background: accentHex }}
                  />
                )}
              </button>

              {/* Quick Customize Navigation button */}
              <button
                onClick={() => setIsNavbarCustomizerOpen(true)}
                title="Customize Navigation Categories"
                aria-label="Customize Navigation Categories"
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              >
                <Sliders className="h-3.5 w-3.5" />
              </button>
            </nav>
          </div>

          {/* Right: Search & Profile Pic Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Search Bar */}
            <div ref={searchContainerRef} className="relative flex items-center">
              <div
                className={`relative flex items-center rounded-full border transition-all duration-300 ${
                  isSearchActive || searchQuery
                    ? 'w-36 sm:w-56 md:w-64 bg-[#353f49] border-[#2185D5] shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
                    : 'w-28 sm:w-44 md:w-52 bg-white/[0.08] border-white/10 hover:bg-white/[0.12]'
                }`}
              >
                <div className="pl-3 pr-1 text-zinc-400">
                  <Search className="h-4 w-4" />
                </div>

                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
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

            {/* Profile Dropdown with Profile Pic Only Trigger Button */}
            <ProfileDropdown
              accounts={dropdownAccounts}
              defaultAccountId={dropdownAccounts[0]?.id}
              items={profileMenuItems}
              onAccountChange={(acc) => {
                if (acc.id !== 'guest' && setActive) {
                  setActive({ session: acc.id });
                }
              }}
              onAddAccount={() => {
                if (openSignIn) openSignIn();
                else onCategoryChange('login');
              }}
              onSignOut={() => {
                if (signOut) signOut();
              }}
              holdDuration={1200}
            />
          </div>
        </div>
      </header>

      {/* M3 Web Bottom Navigation Bar for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-[#303841]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around shadow-[var(--md-sys-elevation-level3)] select-none">
        {[
          { id: 'all', label: 'Home', icon: Home },
          { id: 'sports', label: 'Sports', icon: Trophy },
          { id: 'manga', label: 'Manga', icon: BookOpen },
          { id: 'anime', label: 'Anime', icon: Tv },
          { id: 'live-tv', label: 'Live TV', icon: Tv2 },
        ].map((cat) => {
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

      {/* Navbar Customizer Modal for user category selection */}
      <NavbarCustomizerModal
        isOpen={isNavbarCustomizerOpen}
        onClose={() => setIsNavbarCustomizerOpen(false)}
      />
    </>
  );
};
