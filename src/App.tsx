import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBillboard } from './components/HeroBillboard';
import { CarouselRow } from './components/CarouselRow';
import { DetailModal } from './components/DetailModal';
import { VideoPlayer } from './components/VideoPlayer';
import { SearchGrid } from './components/SearchGrid';
import { ProfileGate } from './components/ProfileGate';
import { Footer } from './components/Footer';
import { BillboardData, CarouselRail, Episode, MediaItem, UserProfile } from './types/schema';
import { api } from './services/api';
import { authStorage } from './services/supabase';

export const App: React.FC = () => {
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(() => {
    return authStorage.getActiveProfile();
  });
  const [showProfileGate, setShowProfileGate] = useState(false);

  const [billboardItems, setBillboardItems] = useState<BillboardData[]>([]);
  const [rails, setRails] = useState<CarouselRail[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');

  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [playingItem, setPlayingItem] = useState<{ item: MediaItem; episode?: Episode } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load
  useEffect(() => {
    Promise.all([api.getBillboard(), api.getRails()]).then(([b, r]) => {
      setBillboardItems(b);
      setRails(r);
      setIsLoading(false);
    });
  }, []);

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

  // Handle Category Filter
  useEffect(() => {
    if (activeCategory === 'watchlist') {
      api.getWatchlistItems().then(items => {
        setSearchResults(items);
      });
    } else if (activeCategory === 'movie' || activeCategory === 'tv') {
      api.searchMedia('').then(() => {
        api.getRails().then(allRails => {
          const filtered = allRails.map(rail => ({
            ...rail,
            items: rail.items.filter(i => i.media_type === activeCategory),
          })).filter(r => r.items.length > 0);
          setRails(filtered);
        });
      });
    } else {
      api.getRails().then(setRails);
    }
  }, [activeCategory]);

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
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Sticky Header Navbar */}
      <Navbar
        activeProfile={activeProfile}
        onSwitchProfile={() => setShowProfileGate(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={cat => {
          setActiveCategory(cat);
          if (cat !== 'watchlist') setSearchQuery('');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isLoading ? (
          <div className="flex h-screen items-center justify-center bg-black">
            <div className="h-12 w-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
          </div>
        ) : searchQuery || activeCategory === 'watchlist' ? (
          <SearchGrid
            query={searchQuery}
            category={activeCategory === 'watchlist' ? 'My Watchlist' : activeCategory}
            items={searchResults}
            onSelect={handleOpenDetail}
            onSuggestionClick={sug => setSearchQuery(sug)}
          />
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
            <div className="-mt-16 sm:-mt-20 md:-mt-24 lg:-mt-28 relative z-20 pb-16 space-y-4">
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

      {/* Title Detail Modal */}
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
