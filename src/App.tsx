import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBillboard } from './components/HeroBillboard';
import { CarouselRow } from './components/CarouselRow';
import { DetailModal } from './components/DetailModal';
import { VideoPlayer } from './components/VideoPlayer';
import { SearchGrid } from './components/SearchGrid';
import { DiscoverView } from './components/DiscoverView';
import { LibraryView } from './components/LibraryView';
import { CalendarView } from './components/CalendarView';
import { AddonsView } from './components/AddonsView';
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
  const [activeCategory, setActiveCategory] = useState<'all' | 'discover' | 'library' | 'calendar' | 'addons'>('all');

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
    if (activeCategory === 'library') {
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
          setActiveCategory(cat as any);
          if (searchQuery) setSearchQuery('');
        }}
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
        ) : activeCategory === 'discover' ? (
          <DiscoverView
            items={allMedia}
            onSelect={handleOpenDetail}
            onPlay={handlePlay}
          />
        ) : activeCategory === 'library' ? (
          <LibraryView
            items={libraryItems.length > 0 ? libraryItems : allMedia.slice(0, 10)}
            onSelect={handleOpenDetail}
            onPlay={handlePlay}
            onNavigateDiscover={() => setActiveCategory('discover')}
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
