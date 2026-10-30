import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Play,
  Search,
  SlidersHorizontal,
  Clock,
  Dice5,
  ArrowRight,
  Star,
  Film,
  Home,
  X,
  Settings as SettingsIcon,
  Menu,
  ChevronRight,
} from 'lucide-react';
import { useUser, useClerk } from '@clerk/react';
import { MediaItem, BillboardData, CarouselRail } from '../types/schema';
import { useNavigate } from 'react-router-dom';
import { authStorage } from '../services/storage';
import { api } from '../services/api';
import { useAccent } from '../context/AccentContext';

interface MinimalHomeViewProps {
  items: MediaItem[];
  billboardItems: BillboardData[];
  rails: CarouselRail[];
  onSelect: (item: MediaItem) => void;
  onPlay: (item: MediaItem) => void;
  onSearch: (query: string) => void;
  onGoToMainHome: () => void;
  onToggleSidebar?: () => void;
}

export const MinimalHomeView: React.FC<MinimalHomeViewProps> = ({
  items,
  billboardItems,
  rails,
  onSelect,
  onPlay,
  onSearch,
  onGoToMainHome,
  onToggleSidebar,
}) => {
  const navigate = useNavigate();
  const { accentHex, accentGlow } = useAccent();
  const { isSignedIn, user } = useUser();
  const { openUserProfile, openSignIn } = useClerk();

  const [searchInput, setSearchInput] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'movie' | 'tv' | 'anime'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Live autocomplete search dropdown state (Vidbox style)
  const [liveResults, setLiveResults] = useState<MediaItem[]>([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Retrieve user watch progress directly from storage to be 100% synchronized
  const progressList = useMemo(() => {
    return authStorage.getProgressList();
  }, []);

  // Continue Watching rail items (ONLY Continue Watching is displayed)
  const continueWatchingItems = useMemo(() => {
    const cwRail = rails.find((r) => r.isContinueWatching);
    if (cwRail && cwRail.items.length > 0) {
      return cwRail.items;
    }

    // Fallback: build from progressList + items
    if (progressList.length > 0) {
      return progressList.map((prog) => {
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
          last_watched: prog.last_watched,
        } as MediaItem;
      });
    }

    // Default starter continue items if none watched yet
    return items.slice(0, 4);
  }, [rails, progressList, items]);

  // Live autocomplete search matching Vidbox behavior
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (!trimmed) {
      setLiveResults([]);
      setIsDropdownOpen(false);
      return;
    }

    setIsDropdownOpen(true);

    // 1. Instant local search from already loaded items
    const q = trimmed.toLowerCase();
    const localMatches = items.filter((item) => {
      const title = (item.title || item.name || '').toLowerCase();
      const overview = (item.overview || '').toLowerCase();
      const matchesText = title.includes(q) || overview.includes(q);
      if (!matchesText) return false;

      if (selectedFilter === 'movie') return item.media_type === 'movie';
      if (selectedFilter === 'tv') return item.media_type === 'tv';
      if (selectedFilter === 'anime') {
        return (
          item.genre_ids?.includes(16) ||
          item.genres?.some((g) => g.toLowerCase().includes('animation'))
        );
      }
      return true;
    });

    setLiveResults(localMatches.slice(0, 6));

    // 2. Debounced API search for full catalog coverage
    const timeout = setTimeout(async () => {
      try {
        setIsSearchingLive(true);
        const remoteResults = await api.searchMedia(trimmed);

        let filteredRemote = remoteResults;
        if (selectedFilter === 'movie') {
          filteredRemote = remoteResults.filter((i) => i.media_type === 'movie');
        } else if (selectedFilter === 'tv') {
          filteredRemote = remoteResults.filter((i) => i.media_type === 'tv');
        } else if (selectedFilter === 'anime') {
          filteredRemote = remoteResults.filter(
            (i) =>
              i.genre_ids?.includes(16) ||
              i.genres?.some((g) => g.toLowerCase().includes('animation'))
          );
        }

        // Deduplicate local + remote results
        const resultMap = new Map<number, MediaItem>();
        localMatches.forEach((i) => resultMap.set(i.id, i));
        filteredRemote.forEach((i) => resultMap.set(i.id, i));

        setLiveResults(Array.from(resultMap.values()).slice(0, 6));
      } catch (err) {
        console.warn('Live search autocomplete notice:', err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [searchInput, selectedFilter, items]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle selecting an item from the autocomplete dropdown:
  // Directs to title detail page (e.g. /title/:id) instead of instant playback
  const handleSelectTitle = (item: MediaItem) => {
    setIsDropdownOpen(false);
    onSelect(item);
    navigate(`/title/${item.id}`);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchInput.trim()) {
      setIsDropdownOpen(false);
      onSearch(searchInput.trim());
      navigate(`/?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleSurpriseMe = () => {
    if (items.length > 0) {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      handleSelectTitle(randomItem);
    } else if (billboardItems.length > 0) {
      handleSelectTitle(billboardItems[0]);
    }
  };

  return (
    <div
      className="h-screen max-h-screen w-full overflow-hidden text-white select-none flex flex-col justify-between p-3 sm:p-5 relative bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundColor: '#050a14',
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.68), rgba(0, 0, 0, 0.82)),
          url('/portal-bg.jpg')
        `,
      }}
    >
      {/* ========================================================
          TOP-RIGHT ACTION ICONS (VIDBOX STYLE: SETTINGS, MENU, USER)
         ======================================================== */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-6 flex items-center gap-2 z-40">
        {/* Settings button */}
        <button
          type="button"
          onClick={() => navigate('/settings')}
          title="Settings"
          className="w-9 h-9 rounded-full bg-black/40 hover:bg-white/15 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer backdrop-blur-md"
        >
          <SettingsIcon className="w-4 h-4 text-white" />
        </button>

        {/* Vidbox Sidebar Menu Drawer button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          title="Open Menu"
          className="w-9 h-9 rounded-full bg-black/40 hover:bg-white/15 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer backdrop-blur-md"
        >
          <Menu className="w-4 h-4 text-white" />
        </button>

        {/* User Profile / Sign In button */}
        {isSignedIn ? (
          <button
            type="button"
            onClick={() => openUserProfile()}
            title={user?.fullName || 'User Profile'}
            className="w-9 h-9 rounded-full overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer flex items-center justify-center bg-black/40 backdrop-blur-md"
            style={{ borderColor: accentHex }}
          >
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-white">
                {(user?.firstName || 'U')[0]}
              </span>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => openSignIn()}
            className="px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:brightness-110 active:scale-95 shadow-md cursor-pointer"
            style={{
              backgroundColor: accentHex,
              color: '#ffffff',
              boxShadow: `0 2px 12px ${accentGlow}`,
            }}
          >
            Sign In
          </button>
        )}
      </div>

      {/* ========================================================
          SINGLE-SCREEN VIEWPORT CONTAINER (ZERO SCROLLING)
         ======================================================== */}
      <div className="mx-auto w-full max-w-4xl h-full flex flex-col justify-between z-10">
        {/* 1. CENTERED HERO (VIDBOX STYLE WITH TYPOGRAPHICA FONT) */}
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2.5 sm:space-y-3 my-auto max-w-2xl mx-auto w-full">
          {/* Logo with Typographica Font & Global Accent */}
          <div className="inline-flex items-center gap-1.5 transition-transform hover:scale-105">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl tracking-wider select-none uppercase font-normal drop-shadow-2xl leading-none"
              style={{
                fontFamily: "'Typographica', sans-serif",
                color: accentHex,
                textShadow: `0 4px 28px ${accentGlow}`,
              }}
            >
              ECHORA
            </h1>
          </div>

          {/* Subtitle */}
          <p
            className="text-xs sm:text-sm font-semibold text-white/85 tracking-wide drop-shadow-md"
            style={{ textWrap: 'balance' }}
          >
            Watch Movies & Series Online in HD for Free!
          </p>

          {/* Centered Pill Search Bar with Live Vidbox Autocomplete Dropdown */}
          <div
            ref={searchContainerRef}
            className="w-full relative z-30 pt-1"
          >
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <div
                className="relative flex items-center w-full rounded-full bg-black/40 backdrop-blur-xl border border-white/20 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all h-10 sm:h-11 px-2 focus-within:ring-2"
                style={{
                  outlineColor: accentHex,
                }}
              >
                {/* Filters Pill Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs font-bold transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal
                      className="w-3 h-3"
                      style={{ color: accentHex }}
                    />
                    <span className="capitalize">
                      {selectedFilter === 'all' ? 'Filters' : selectedFilter}
                    </span>
                  </button>

                  {showFilterDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-32 rounded-xl bg-[#0a1222]/95 backdrop-blur-xl border border-white/20 shadow-2xl p-1 z-50 text-left space-y-0.5">
                      {[
                        { id: 'all', label: 'All Media' },
                        { id: 'movie', label: 'Movies' },
                        { id: 'tv', label: 'Series' },
                        { id: 'anime', label: 'Anime' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSelectedFilter(opt.id as any);
                            setShowFilterDropdown(false);
                          }}
                          className="w-full text-left px-2 py-1 rounded-lg text-xs font-semibold transition-colors"
                          style={
                            selectedFilter === opt.id
                              ? {
                                  backgroundColor: accentHex,
                                  color: '#ffffff',
                                }
                              : {
                                  color: '#ffffff',
                                }
                          }
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input */}
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => {
                    if (searchInput.trim()) setIsDropdownOpen(true);
                  }}
                  placeholder="Search movies, series, anime..."
                  className="w-full bg-transparent px-2.5 text-xs sm:text-sm text-white placeholder:text-white/60 focus:outline-none"
                />

                {/* Clear button if text present */}
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setLiveResults([]);
                      setIsDropdownOpen(false);
                    }}
                    className="p-1 text-white/50 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Search Submit Button */}
                <button
                  type="submit"
                  title="Search"
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
                >
                  <Search className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </button>
              </div>
            </form>

            {/* ========================================================
                ATTACHED LIVE SEARCH AUTOCOMPLETE DROPDOWN (VIDBOX STYLE)
                Directs to title details page (e.g. /title/2734)
               ======================================================== */}
            {isDropdownOpen && searchInput.trim().length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl bg-[#091122]/95 backdrop-blur-2xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.75)] overflow-hidden divide-y divide-white/10"
                style={{
                  outline: `1px solid ${accentHex}40`,
                }}
              >
                {/* Result Items */}
                <div className="max-h-[240px] sm:max-h-[280px] overflow-y-auto divide-y divide-white/5">
                  {liveResults.length > 0 ? (
                    liveResults.map((item) => {
                      const year = (
                        item.release_date ||
                        item.first_air_date ||
                        ''
                      ).slice(0, 4);
                      const rating = item.vote_average
                        ? item.vote_average.toFixed(1)
                        : 'N/A';
                      const isTv = item.media_type === 'tv';

                      return (
                        <div
                          key={`autocomplete-${item.id}`}
                          onClick={() => handleSelectTitle(item)}
                          className="flex items-center gap-3 p-2.5 sm:p-3 hover:bg-white/10 cursor-pointer transition-colors group text-left"
                        >
                          {/* Poster Thumbnail */}
                          <div className="relative w-9 sm:w-10 h-13 sm:h-14 flex-shrink-0 rounded-lg overflow-hidden bg-black/50 border border-white/10 shadow-sm">
                            {item.poster_path ? (
                              <img
                                src={item.poster_path}
                                alt={item.title || item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/40">
                                <Film className="w-4 h-4" />
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h4
                              className="text-xs sm:text-sm font-bold text-white transition-colors truncate"
                            >
                              {item.title || item.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-white/75 font-mono">
                              <span className="capitalize font-semibold text-white/90">
                                {isTv ? 'Tv' : 'Movie'}
                              </span>
                              <span className="text-white/30">•</span>
                              <span
                                className="flex items-center gap-1 font-bold"
                                style={{ color: accentHex }}
                              >
                                <Star
                                  className="w-3 h-3 fill-current"
                                  style={{ color: accentHex }}
                                />
                                {rating}
                              </span>
                              {year && (
                                <>
                                  <span className="text-white/30">•</span>
                                  <span className="text-white/70">{year}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Details Arrow on Hover */}
                          <div
                            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md group-hover:scale-105"
                            style={{
                              backgroundColor: accentHex,
                              color: '#ffffff',
                            }}
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-white/70 text-xs">
                      {isSearchingLive ? (
                        <div className="flex items-center justify-center gap-2 text-white">
                          <div
                            className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
                            style={{ borderColor: accentHex, borderTopColor: 'transparent' }}
                          />
                          <span>Searching library...</span>
                        </div>
                      ) : (
                        <span>No matching titles found for "{searchInput}"</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer: "See more results" button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onSearch(searchInput.trim());
                    navigate(`/?q=${encodeURIComponent(searchInput.trim())}`);
                  }}
                  className="w-full p-2.5 flex items-center justify-between bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-white group transition-colors border-t border-white/10 cursor-pointer"
                >
                  <span className="text-white/80 group-hover:text-white truncate">
                    See all results for "{searchInput}"
                  </span>
                  <ArrowRight
                    className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2"
                    style={{ color: accentHex }}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons: "Main Home" & "Surprise Me" + Quick Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={onGoToMainHome}
              className="h-8 sm:h-9 px-4 sm:px-5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 hover:brightness-110 shadow-md"
              style={{
                backgroundColor: accentHex,
                color: '#ffffff',
                boxShadow: `0 3px 16px ${accentGlow}`,
              }}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Main Home</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleSurpriseMe}
              className="h-8 sm:h-9 px-3.5 sm:px-4 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer bg-black/40 hover:bg-white/15 text-white border backdrop-blur-md transition-all active:scale-95 shadow-sm"
              style={{
                borderColor: `${accentHex}66`,
              }}
            >
              <Dice5 className="w-3.5 h-3.5" style={{ color: accentHex }} />
              <span>Surprise Me</span>
            </button>

            {/* Quick Category Chips */}
            <div className="flex items-center gap-1.5">
              {[
                { label: 'Movies', path: '/movies' },
                { label: 'TV Shows', path: '/series' },
                { label: 'Trending', path: '/discover' },
                { label: 'Anime', path: '/anime' },
              ].map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => navigate(cat.path)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/40 hover:bg-white/15 border border-white/15 text-white transition-colors cursor-pointer backdrop-blur-md"
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. ONLY CONTINUE WATCHING SECTION (DOCKED COMPACTLY AT BOTTOM) */}
        <section className="w-full flex-none pt-2 pb-1">
          <div className="flex items-center justify-between border-b border-white/15 pb-1 mb-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" style={{ color: accentHex }} />
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-wider uppercase">
                Continue Watching
              </h2>
            </div>

            <span
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/40 border backdrop-blur"
              style={{
                borderColor: `${accentHex}40`,
                color: accentHex,
              }}
            >
              {continueWatchingItems.length} in progress
            </span>
          </div>

          {/* Clean Compact Continue Watching Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {continueWatchingItems.slice(0, 4).map((item, idx) => {
              const progressPercent =
                item.progress_seconds && item.total_seconds
                  ? Math.min(
                      100,
                      Math.round(
                        (item.progress_seconds / item.total_seconds) * 100
                      )
                    )
                  : 45 + ((idx * 17) % 50);

              return (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => handleSelectTitle(item)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl bg-black/40 backdrop-blur-md border border-white/15 hover:border-white/40 shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] flex flex-col"
                >
                  {/* Backdrop / Thumbnail */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/50 max-h-20 sm:max-h-24">
                    <img
                      src={item.backdrop_path || item.poster_path}
                      alt={item.title || item.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />

                    {/* Progress Bar (Global Accent) */}
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-black/70">
                      <div
                        className="h-full transition-all"
                        style={{
                          backgroundColor: accentHex,
                          width: `${progressPercent}%`,
                        }}
                      />
                    </div>

                    {/* Quick Resume Play Icon on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlay(item);
                        }}
                        title="Resume Playback"
                        className="h-7 w-7 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110 active:scale-95 cursor-pointer"
                        style={{
                          backgroundColor: accentHex,
                          color: '#ffffff',
                        }}
                      >
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </button>
                    </div>

                    {/* Progress Badge */}
                    <div
                      className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/80 border backdrop-blur"
                      style={{
                        borderColor: `${accentHex}50`,
                        color: accentHex,
                      }}
                    >
                      {progressPercent}%
                    </div>
                  </div>

                  {/* Compact Card Content Row */}
                  <div className="px-2 py-1.5 flex items-center justify-between gap-1.5 bg-white/[0.02]">
                    <h3 className="font-semibold text-xs text-white truncate group-hover:text-white transition-colors">
                      {item.title || item.name}
                    </h3>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlay(item);
                      }}
                      className="flex-none px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all shadow-sm cursor-pointer"
                      style={{
                        backgroundColor: accentHex,
                        color: '#ffffff',
                      }}
                    >
                      Resume
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* No footer in minimal low mode */}
    </div>
  );
};
