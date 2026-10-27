import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { VidboxSidebar, NavViewId } from './components/VidboxSidebar';
import { HeroBillboard } from './components/HeroBillboard';
import { CarouselRow } from './components/CarouselRow';
import { MangaRail } from './components/MangaRail';
import { DetailModal } from './components/DetailModal';
import { VideoPlayer } from './components/VideoPlayer';
import { SearchGrid } from './components/SearchGrid';
import { DiscoverView } from './components/DiscoverView';
import { LibraryView } from './components/LibraryView';
import { CalendarView } from './components/CalendarView';
import { AddonsView } from './components/AddonsView';
import { AnimeView } from './components/AnimeView';
import { MangaView } from './components/MangaView';
import { CollectionView } from './components/CollectionView';
import { FourKView } from './components/FourKView';
import { DramaView } from './components/DramaView';
import { LiveTvView } from './components/LiveTvView';
import { LiveSportsView } from './components/LiveSportsView';
import { HistoryView } from './components/HistoryView';
import { RadioPlayer } from './components/RadioPlayer';
import { RadioAtlasView } from './components/RadioAtlasView';
import { AIAssistantBot } from './components/AIAssistantBot';
import { ProfileGate } from './components/ProfileGate';
import { FloatingPiP } from './components/FloatingPiP';
import { Footer } from './components/Footer';
import { Episode, MediaItem, UserProfile } from './types/schema';
import { api } from './services/api';
import { authStorage } from './services/supabase';
import { AccentProvider, useAccent } from './context/AccentContext';
import { usePlayerStore } from './store/playerStore';
import {
  useBillboardQuery,
  useRailsQuery,
  useAllMediaQuery,
  useSearchMediaQuery,
} from './hooks/useCatalogQuery';
import { useGridKeyboardNav } from './hooks/useGridKeyboardNav';

const MainApp: React.FC = () => {
  const { accentHex } = useAccent();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Profile management
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(() => {
    return authStorage.getActiveProfile();
  });
  const [showProfileGate, setShowProfileGate] = useState(false);

  // Zustand Player State
  const {
    currentMedia,
    playMedia,
    closePlayer,
    setPiP,
    isPiP,
  } = usePlayerStore();

  // Active Category / Navigation synced with Route Path
  const currentPath = location.pathname.replace(/^\//, '') || 'all';
  const activeCategory = useMemo(() => {
    if (currentPath === '' || currentPath === 'all') return 'all';
    if (currentPath.startsWith('title/') || currentPath.startsWith('watch/')) {
      return (location.state as { backgroundCategory?: string })?.backgroundCategory || 'all';
    }
    return currentPath;
  }, [currentPath, location.state]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRadioOpen, setIsRadioOpen] = useState(false);
  const [libraryItems, setLibraryItems] = useState<MediaItem[]>([]);

  // Search state synced with URL query (?q=)
  const searchQuery = searchParams.get('q') || '';
  const setSearchQuery = useCallback((q: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (q) {
        next.set('q', q);
      } else {
        next.delete('q');
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // Selected item for modal overlay
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [playingEpisode, setPlayingEpisode] = useState<Episode | undefined>();

  // TanStack Query: Cached Server States with 0 lag
  const { data: billboardItems = [], isLoading: isBillboardLoading } = useBillboardQuery();
  const { data: rails = [], isLoading: isRailsLoading } = useRailsQuery();
  const { data: allMedia = [], isLoading: isAllMediaLoading } = useAllMediaQuery();
  const { data: searchResults = [] } = useSearchMediaQuery(searchQuery);

  const isLoading = isBillboardLoading && isRailsLoading && isAllMediaLoading;

  // Spatial keyboard navigation for TV / remote control / arrow keys
  useGridKeyboardNav({
    containerSelector: '[data-grid-nav="true"], main',
    columns: 4,
    enabled: !selectedItem && !currentMedia && !showProfileGate,
  });

  // Sync Library on tab visit
  useEffect(() => {
    if (
      activeCategory === 'library' ||
      activeCategory === 'watchlist' ||
      activeCategory === 'continue-watch'
    ) {
      api.getWatchlistItems().then(setLibraryItems);
    }
  }, [activeCategory]);

  // Deep-linking: Load title modal from /title/:id or ?titleId=
  useEffect(() => {
    const titleMatch = location.pathname.match(/\/title\/(\d+)/);
    const titleId = titleMatch ? titleMatch[1] : searchParams.get('titleId');

    if (titleId && (!selectedItem || selectedItem.id !== Number(titleId))) {
      api.getMediaDetails(Number(titleId)).then((found) => {
        if (found) setSelectedItem(found);
      });
    }
  }, [location.pathname, searchParams, selectedItem]);

  // Parallel / Nested Modal Route Handlers
  const handleOpenDetail = (item: MediaItem) => {
    setSelectedItem(item);
    navigate(`/title/${item.id}`, {
      state: {
        backgroundLocation: location,
        backgroundCategory: activeCategory,
      },
    });
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
    if (location.pathname.startsWith('/title/')) {
      navigate(-1);
    } else {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('titleId');
        return next;
      });
    }
  };

  const handlePlay = (item: MediaItem, episode?: Episode) => {
    setPlayingEpisode(episode);
    playMedia(item);
    navigate(`/watch/${item.id}`, {
      state: {
        backgroundLocation: location,
        backgroundCategory: activeCategory,
      },
    });
  };

  const handleClosePlayer = () => {
    closePlayer();
    if (location.pathname.startsWith('/watch/')) {
      navigate(-1);
    }
  };

  const handleNextEpisode = () => {
    if (!currentMedia) return;
    api.getEpisodes(currentMedia.id).then((eps) => {
      const currentEpIndex = eps.findIndex((e) => e.id === playingEpisode?.id);
      if (currentEpIndex >= 0 && currentEpIndex + 1 < eps.length) {
        setPlayingEpisode(eps[currentEpIndex + 1]);
      }
    });
  };

  // Sidebar selection handler
  const handleSelectNavView = (view: NavViewId) => {
    if (searchQuery) setSearchQuery('');
    if (view === 'home') {
      navigate('/');
    } else {
      navigate(`/${view}`);
    }
    setIsSidebarOpen(false);
  };

  if (showProfileGate || !activeProfile) {
    return (
      <ProfileGate
        onSelectProfile={(profile) => {
          setActiveProfile(profile);
          setShowProfileGate(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-[#f4f4f5] flex flex-col font-sans select-none">
      {/* Sticky Top Navigation Bar */}
      <Navbar
        activeProfile={activeProfile}
        onSwitchProfile={() => setShowProfileGate(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          if (searchQuery) setSearchQuery('');
          navigate(cat === 'all' ? '/' : `/${cat}`);
        }}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Vidbox Left Sidebar Drawer with all 16 items */}
      <VidboxSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeView={activeCategory as NavViewId}
        onSelectView={handleSelectNavView}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 md:pb-0" data-grid-nav="true">
        {isLoading ? (
          <div className="flex h-screen items-center justify-center bg-[#0b0b0d]">
            <div className="flex flex-col items-center gap-4">
              <div
                className="h-12 w-12 rounded-full border-4 border-t-transparent animate-spin shadow-lg"
                style={{ borderColor: accentHex, borderTopColor: 'transparent' }}
              />
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400">
                Echora · Loading Cinema Experience...
              </span>
            </div>
          </div>
        ) : searchQuery ? (
          <SearchGrid
            query={searchQuery}
            category="Search"
            items={searchResults}
            onSelect={handleOpenDetail}
            onSuggestionClick={(sug) => setSearchQuery(sug)}
          />
        ) : activeCategory === 'anime' ? (
          <AnimeView
            items={allMedia}
            onSelect={handleOpenDetail}
            onPlay={handlePlay}
          />
        ) : activeCategory === 'manga' ? (
          <MangaView />
        ) : activeCategory === 'collection' ? (
          <CollectionView
            items={allMedia}
            onSelect={handleOpenDetail}
          />
        ) : activeCategory === '4k' ? (
          <FourKView
            items={allMedia}
            onSelect={handleOpenDetail}
            onPlay={handlePlay}
          />
        ) : activeCategory === 'drama' || activeCategory === 'asian-drama' ? (
          <DramaView
            items={allMedia}
            onSelect={handleOpenDetail}
            onPlay={handlePlay}
          />
        ) : activeCategory === 'live-tv' || activeCategory === 'tv' ? (
          <LiveTvView />
        ) : activeCategory === 'live-sports' || activeCategory === 'sports' ? (
          <LiveSportsView
            onPlayStream={(url, title) => {
              handlePlay({
                id: Math.floor(Math.random() * 900000) + 100000,
                title,
                name: title,
                overview: 'Live match broadcast',
                poster_path:
                  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
                backdrop_path:
                  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1280&q=80',
                media_type: 'tv',
                release_date: '2026-10-26',
                vote_average: 9.0,
                vote_count: 500,
                genre_ids: [10770],
                popularity: 300,
                adult: false,
                streamUrl: url,
              });
            }}
          />
        ) : activeCategory === 'radio' ? (
          <RadioAtlasView onBack={() => navigate('/')} />
        ) : activeCategory === 'history' ? (
          <HistoryView
            items={allMedia}
            onSelect={handleOpenDetail}
            onPlay={handlePlay}
            onNavigateHome={() => navigate('/')}
          />
        ) : activeCategory === 'continue-watch' ? (
          <LibraryView
            items={libraryItems.length > 0 ? libraryItems : allMedia.slice(0, 8)}
            onSelect={handleOpenDetail}
            onPlay={handlePlay}
            onNavigateDiscover={() => navigate('/discover')}
          />
        ) : activeCategory === 'watchlist' || activeCategory === 'library' ? (
          <LibraryView
            items={libraryItems.length > 0 ? libraryItems : allMedia.slice(0, 10)}
            onSelect={handleOpenDetail}
            onPlay={handlePlay}
            onNavigateDiscover={() => navigate('/discover')}
          />
        ) : activeCategory === 'movies' ? (
          <DiscoverView
            items={allMedia.filter((i) => i.media_type === 'movie')}
            onSelect={handleOpenDetail}
            onPlay={handlePlay}
          />
        ) : activeCategory === 'series' ? (
          <DiscoverView
            items={allMedia.filter((i) => i.media_type === 'tv')}
            onSelect={handleOpenDetail}
            onPlay={handlePlay}
          />
        ) : activeCategory === 'discover' ? (
          <DiscoverView
            items={allMedia}
            onSelect={handleOpenDetail}
            onPlay={handlePlay}
          />
        ) : activeCategory === 'calendar' ? (
          <CalendarView items={allMedia} onSelect={handleOpenDetail} />
        ) : activeCategory === 'addons' ? (
          <AddonsView />
        ) : (
          <>
            {/* Hero Billboard */}
            {billboardItems.length > 0 && (
              <HeroBillboard
                items={billboardItems}
                onPlay={handlePlay}
                onMoreInfo={handleOpenDetail}
              />
            )}

            {/* Carousel Rows Container */}
            <div className="relative z-10 pb-16 space-y-4">
              {rails.map((rail, index) => (
                <React.Fragment key={rail.id}>
                  <CarouselRow
                    rail={rail}
                    onSelect={handleOpenDetail}
                    onPlay={handlePlay}
                  />
                  {index === 0 && <MangaRail />}
                </React.Fragment>
              ))}
              {rails.length === 0 && <MangaRail />}
            </div>
          </>
        )}
      </main>

      {/* Persistent Floating Radio Player */}
      <RadioPlayer
        isVisible={isRadioOpen}
        onClose={() => setIsRadioOpen(false)}
      />

      {/* Floating AI Assistant Bot Widget */}
      {activeCategory !== 'radio' &&
        activeCategory !== 'live-tv' &&
        activeCategory !== 'tv' &&
        activeCategory !== 'live-sports' &&
        activeCategory !== 'sports' &&
        !currentMedia && (
          <AIAssistantBot
            items={allMedia}
            onSelect={handleOpenDetail}
            onPlay={handlePlay}
          />
        )}

      {/* Floating Picture-in-Picture Mini Player */}
      {isPiP && (
        <FloatingPiP
          onExpand={() => {
            setPiP(false);
          }}
        />
      )}

      {/* Footer */}
      <Footer />

      {/* Title Detail Page View (Parallel / Modal Route) */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={handleCloseDetail}
          onPlay={handlePlay}
          onSelectRelated={handleOpenDetail}
        />
      )}

      {/* Fullscreen HLS Video Player (Parallel / Modal Route) */}
      {currentMedia && (
        <VideoPlayer
          item={currentMedia}
          episode={playingEpisode}
          onClose={handleClosePlayer}
          onNextEpisode={handleNextEpisode}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AccentProvider>
      <MainApp />
    </AccentProvider>
  );
};
