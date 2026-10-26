import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VidboxSidebar, NavViewId } from './components/VidboxSidebar';
import { HeroBillboard } from './components/HeroBillboard';
import { CarouselRow } from './components/CarouselRow';
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
import { AIAssistantBot } from './components/AIAssistantBot';
import { DonateModal } from './components/DonateModal';
import { DiscordModal } from './components/DiscordModal';
import { ProfileGate } from './components/ProfileGate';
import { Footer } from './components/Footer';
import { BillboardData, CarouselRail, Episode, MediaItem, UserProfile } from './types/schema';
import { api } from './services/api';
import { authStorage } from './services/supabase';
import { AccentProvider, useAccent } from './context/AccentContext';

const MainApp: React.FC = () => {
  const { accentHex } = useAccent();
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(() => {
    return authStorage.getActiveProfile();
  });
  const [showProfileGate, setShowProfileGate] = useState(false);

  const [billboardItems, setBillboardItems] = useState<BillboardData[]>([]);
  const [rails, setRails] = useState<CarouselRail[]>([]);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [libraryItems, setLibraryItems] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  
  // Navigation State
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isDiscordOpen, setIsDiscordOpen] = useState(false);
  const [isRadioOpen, setIsRadioOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [playingItem, setPlayingItem] = useState<{ item: MediaItem; episode?: Episode } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load
  useEffect(() => {
    authStorage.initSync().then(() => {
      Promise.all([
        api.getBillboard(),
        api.getRails(),
        api.getAllMedia(),
        api.getWatchlistItems(),
      ]).then(([b, r, all, lib]) => {
        setBillboardItems(b);
        setRails(r);
        setAllMedia(all);
        setLibraryItems(lib);
        setIsLoading(false);
      });
    });
  }, []);

  // Sync Library on tab visit
  useEffect(() => {
    if (activeCategory === 'library' || activeCategory === 'watchlist' || activeCategory === 'continue-watch') {
      api.getWatchlistItems().then(setLibraryItems);
    }
  }, [activeCategory]);

  // URL Query Sync for search & title modal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const titleId = params.get('titleId');

    if (q) {
      setSearchQuery(q);
    }

    if (titleId) {
      api.getMediaDetails(Number(titleId)).then(found => {
        if (found) setSelectedItem(found);
      });
    }
  }, []);

  // Handle Search Input & URL update
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (searchQuery) {
      params.set('q', searchQuery);
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
      api.searchMedia(searchQuery).then(setSearchResults);
    } else {
      params.delete('q');
      const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleOpenDetail = (item: MediaItem) => {
    setSelectedItem(item);
    const params = new URLSearchParams(window.location.search);
    params.set('titleId', String(item.id));
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
    const params = new URLSearchParams(window.location.search);
    params.delete('titleId');
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.pushState({}, '', newUrl);
  };

  const handlePlay = (item: MediaItem, episode?: Episode) => {
    setPlayingItem({ item, episode });
  };

  const handleNextEpisode = () => {
    if (!playingItem?.item) return;
    api.getEpisodes(playingItem.item.id).then(eps => {
      const currentEpIndex = eps.findIndex(e => e.id === playingItem.episode?.id);
      if (currentEpIndex >= 0 && currentEpIndex + 1 < eps.length) {
        setPlayingItem({ item: playingItem.item, episode: eps[currentEpIndex + 1] });
      }
    });
  };

  // Sidebar selection handler
  const handleSelectNavView = (view: NavViewId) => {
    if (view === 'donate') {
      setIsDonateOpen(true);
    } else if (view === 'discord') {
      setIsDiscordOpen(true);
    } else if (view === 'radio') {
      setIsRadioOpen(true);
    } else if (view === 'home') {
      setActiveCategory('all');
      if (searchQuery) setSearchQuery('');
    } else {
      setActiveCategory(view);
      if (searchQuery) setSearchQuery('');
    }
  };

  if (showProfileGate || !activeProfile) {
    return (
      <ProfileGate
        onSelectProfile={profile => {
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
        onCategoryChange={cat => {
          setActiveCategory(cat);
          if (searchQuery) setSearchQuery('');
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
      <main className="flex-1 pb-16 md:pb-0">
        {isLoading ? (
          <div className="flex h-screen items-center justify-center bg-[#0b0b0d]">
            <div className="flex flex-col items-center gap-4">
              <div
                className="h-12 w-12 rounded-full border-4 border-t-transparent animate-spin shadow-lg"
                style={{ borderColor: accentHex, borderTopColor: 'transparent' }}
              />
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400">
                DX.BI · Loading Cinema Experience...
              </span>
            </div>
          </div>
        ) : searchQuery ? (
          <SearchGrid
            query={searchQuery}
            category="Search"
            items={searchResults}
            onSelect={handleOpenDetail}
            onSuggestionClick={sug => setSearchQuery(sug)}
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
        ) : activeCategory === 'drama' ? (
          <DramaView
            items={allMedia}
            onSelect={handleOpenDetail}
            onPlay={handlePlay}
          />
        ) : activeCategory === 'live-tv' ? (
          <LiveTvView />
        ) : activeCategory === 'live-sports' ? (
          <LiveSportsView
            onPlayStream={(url, title) => {
              handlePlay({
                id: Math.floor(Math.random() * 900000) + 100000,
                title,
                name: title,
                overview: 'Live match broadcast',
                poster_path: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
                backdrop_path: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1280&q=80',
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
        ) : activeCategory === 'history' ? (
          <HistoryView
            items={allMedia}
            onSelect={handleOpenDetail}
            onPlay={handlePlay}
            onNavigateHome={() => setActiveCategory('all')}
          />
        ) : activeCategory === 'continue-watch' ? (
          <LibraryView
            items={libraryItems.length > 0 ? libraryItems : allMedia.slice(0, 8)}
            onSelect={handleOpenDetail}
            onPlay={handlePlay}
            onNavigateDiscover={() => setActiveCategory('discover')}
          />
        ) : activeCategory === 'watchlist' || activeCategory === 'library' ? (
          <LibraryView
            items={libraryItems.length > 0 ? libraryItems : allMedia.slice(0, 10)}
            onSelect={handleOpenDetail}
            onPlay={handlePlay}
            onNavigateDiscover={() => setActiveCategory('discover')}
          />
        ) : activeCategory === 'movies' ? (
          <DiscoverView
            items={allMedia.filter(i => i.media_type === 'movie')}
            onSelect={handleOpenDetail}
            onPlay={handlePlay}
          />
        ) : activeCategory === 'series' ? (
          <DiscoverView
            items={allMedia.filter(i => i.media_type === 'tv')}
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
          <CalendarView
            items={allMedia}
            onSelect={handleOpenDetail}
          />
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
              {rails.map(rail => (
                <CarouselRow
                  key={rail.id}
                  rail={rail}
                  onSelect={handleOpenDetail}
                  onPlay={handlePlay}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Persistent Floating Radio Player */}
      <RadioPlayer
        isVisible={isRadioOpen}
        onClose={() => setIsRadioOpen(false)}
      />

      {/* Floating AI Assistant Bot Widget (Cyan robot circle from user screenshot) */}
      <AIAssistantBot
        items={allMedia}
        onSelect={handleOpenDetail}
        onPlay={handlePlay}
      />

      {/* Crypto Donate Modal */}
      <DonateModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
      />

      {/* Discord Community Modal */}
      <DiscordModal
        isOpen={isDiscordOpen}
        onClose={() => setIsDiscordOpen(false)}
      />

      {/* Footer */}
      <Footer />

      {/* Title Detail Page View */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={handleCloseDetail}
          onPlay={handlePlay}
          onSelectRelated={handleOpenDetail}
        />
      )}

      {/* Fullscreen HLS Video Player */}
      {playingItem && (
        <VideoPlayer
          item={playingItem.item}
          episode={playingItem.episode}
          onClose={() => setPlayingItem(null)}
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
