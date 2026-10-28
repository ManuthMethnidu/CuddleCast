import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Radio as RadioIcon,
  Search,
  Play,
  Pause,
  Sparkles,
  Compass,
  Heart,
  Volume2,
  VolumeX,
  Shuffle,
  Music,
  TrendingUp,
  Clock,
  Settings2,
  Loader2,
  X,
  Filter,
  CircleDot,
  Download,
  Trash2,
  Square,
  HardDriveDownload,
  CheckCircle2,
} from 'lucide-react';
import { useAccent } from '../context/AccentContext';
import { authStorage } from '../services/storage';
import {
  RadioBrowserStation,
  radioBrowserApi,
  INITIAL_CURATED_STATIONS,
  POPULAR_GENRES,
  getCountryFlag,
} from '../services/radioBrowser';
import { useRadioStore } from '../store/radioStore';
import { RadioOnboardingModal } from './RadioOnboardingModal';
import {
  radioRecorder,
  RadioRecordingItem,
  ActiveRecordingState,
  getBlob,
} from '../services/radioRecorder';

interface RadioViewProps {
  onBack?: () => void;
}

type NavCategory =
  | 'for-you'
  | 'local'
  | 'global'
  | 'genre'
  | 'favorites'
  | 'recent'
  | 'search'
  | 'recordings';

export const RadioView: React.FC<RadioViewProps> = ({ onBack }) => {
  const { accentHex } = useAccent();

  // Zustand Global Radio Store
  const {
    currentStation,
    isPlaying,
    isLoadingStream,
    playStation,
    togglePlay,
    pause,
    volume,
    isMuted,
    setVolume,
    toggleMute,
    setScreensaverOpen,
    userPreferences,
    isOnboardingOpen,
    setIsOnboardingOpen,
    wander,
  } = useRadioStore();

  // Navigation & Filter State
  const [activeCategory, setActiveCategory] = useState<NavCategory>('for-you');
  const [selectedGenreId, setSelectedGenreId] = useState<string>('all');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Station lists
  const [forYouStations, setForYouStations] = useState<RadioBrowserStation[]>([]);
  const [localStations, setLocalStations] = useState<RadioBrowserStation[]>([]);
  const [globalStations, setGlobalStations] = useState<RadioBrowserStation[]>([]);
  const [genreStations, setGenreStations] = useState<RadioBrowserStation[]>([]);
  const [searchResults, setSearchResults] = useState<RadioBrowserStation[]>([]);
  const [favoritesList, setFavoritesList] = useState<RadioBrowserStation[]>([]);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isForceEditingOnboarding, setIsForceEditingOnboarding] = useState(false);
  const [favIds, setFavIds] = useState<string[]>([]);
  const [stats, setStats] = useState({ stations: 65400, countries: 228, tags: 12500 });

  // Recording State & Storage
  const [recordingState, setRecordingState] = useState<ActiveRecordingState>(
    radioRecorder.getState()
  );
  const [savedRecordings, setSavedRecordings] = useState<RadioRecordingItem[]>([]);
  const [playingRecordingId, setPlayingRecordingId] = useState<string | null>(null);
  const [recordingAudioEl, setRecordingAudioEl] = useState<HTMLAudioElement | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  useEffect(() => {
    setSavedRecordings(radioRecorder.getRecordings());
    const unsubscribe = radioRecorder.subscribe((state) => {
      setRecordingState(state);
      setSavedRecordings(radioRecorder.getRecordings());
    });
    return () => {
      unsubscribe();
      if (recordingAudioEl) {
        recordingAudioEl.pause();
      }
    };
  }, []);

  // Stop recording preview if live radio starts playing
  useEffect(() => {
    if (isPlaying && recordingAudioEl) {
      recordingAudioEl.pause();
      setPlayingRecordingId(null);
    }
  }, [isPlaying]);

  // Sync volume with recording playback
  useEffect(() => {
    if (recordingAudioEl) {
      recordingAudioEl.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, recordingAudioEl]);

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStartRecording = async (stationToRecord?: RadioBrowserStation) => {
    const target = stationToRecord || currentStation;
    if (!target) return;

    // Start playing station so user hears what is recording
    if (!currentStation || currentStation.stationuuid !== target.stationuuid || !isPlaying) {
      playStation(target);
    }

    const started = await radioRecorder.start(target);
    if (started) {
      setDownloadToast(`Recording live: "${target.name}"`);
      setTimeout(() => setDownloadToast(null), 3500);
    }
  };

  const handleStopRecording = async () => {
    const result = await radioRecorder.stop();
    if (result) {
      setSavedRecordings(radioRecorder.getRecordings());
      setDownloadToast(`Downloaded "${result.item.filename}" (${formatBytes(result.item.sizeBytes)})`);
      setTimeout(() => setDownloadToast(null), 5000);
    }
  };

  const handleDownloadSavedRecording = async (rec: RadioRecordingItem) => {
    const success = await radioRecorder.downloadSaved(rec);
    if (success) {
      setDownloadToast(`Downloaded "${rec.filename}"`);
      setTimeout(() => setDownloadToast(null), 3500);
    }
  };

  const handleDeleteRecording = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (playingRecordingId === id && recordingAudioEl) {
      recordingAudioEl.pause();
      setPlayingRecordingId(null);
    }
    await radioRecorder.deleteRecording(id);
    setSavedRecordings(radioRecorder.getRecordings());
  };

  const handleTogglePlayRecording = async (rec: RadioRecordingItem) => {
    if (playingRecordingId === rec.id) {
      if (recordingAudioEl) {
        if (recordingAudioEl.paused) {
          recordingAudioEl.play();
        } else {
          recordingAudioEl.pause();
        }
      }
      return;
    }

    if (recordingAudioEl) {
      recordingAudioEl.pause();
    }

    // Pause live radio so audio does not collide
    pause();

    const blob = await getBlob(rec.id);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.volume = isMuted ? 0 : volume;
    audio.play().catch((err) => console.warn('Preview playback failed:', err));

    audio.onended = () => {
      setPlayingRecordingId(null);
      URL.revokeObjectURL(url);
    };

    setRecordingAudioEl(audio);
    setPlayingRecordingId(rec.id);
  };

  // Handle Home Click: Stop radio and go back home
  const handleGoHome = () => {
    pause();
    if (onBack) {
      onBack();
    }
  };

  // Sync favorites from authStorage and resolve all station details
  const refreshFavorites = async () => {
    const ids = authStorage.getRadioFavorites();
    setFavIds(ids);
    const storedObjs: RadioBrowserStation[] = authStorage.getRadioFavoriteStations();

    const stationMap = new Map<string, RadioBrowserStation>();

    // 1. Add all stored favorite station objects
    storedObjs.forEach((s) => {
      const id = s.stationuuid || (s as any).id;
      if (id) stationMap.set(id, s);
    });

    // 2. Add known stations from in-memory lists
    [
      ...INITIAL_CURATED_STATIONS,
      ...forYouStations,
      ...localStations,
      ...globalStations,
      ...genreStations,
    ].forEach((s) => {
      if (s.stationuuid && !stationMap.has(s.stationuuid)) {
        stationMap.set(s.stationuuid, s);
      }
    });

    // 3. Find which IDs are still missing objects
    const missingIds = ids.filter((id) => !stationMap.has(id));
    if (missingIds.length > 0) {
      try {
        const fetched = await radioBrowserApi.getStationsByUuids(missingIds);
        fetched.forEach((s) => {
          if (s.stationuuid) stationMap.set(s.stationuuid, s);
        });
      } catch (err) {
        console.warn('Could not fetch missing favorite stations:', err);
      }
    }

    // 4. Resolve full list in user order and update storage
    const resolvedStations = ids
      .map((id) => stationMap.get(id))
      .filter(Boolean) as RadioBrowserStation[];

    setFavoritesList(resolvedStations);
    if (resolvedStations.length > storedObjs.length) {
      authStorage.saveRadioFavoriteStations(resolvedStations);
    }
  };

  useEffect(() => {
    refreshFavorites();
    const unsubscribe = authStorage.subscribe(() => refreshFavorites());
    return () => unsubscribe();
  }, []);

  // Fetch stats on mount
  useEffect(() => {
    radioBrowserApi.getStats().then(setStats).catch(() => {});
  }, []);

  // Auto-prompt onboarding if first time
  useEffect(() => {
    const onboarding = authStorage.getRadioOnboarding();
    if (!onboarding.completed && !userPreferences.isOnboardingCompleted) {
      setIsOnboardingOpen(true);
    }
  }, [userPreferences.isOnboardingCompleted, setIsOnboardingOpen]);

  // Auto-launch screensaver when mouse is idle on the radio page
  useEffect(() => {
    if (isOnboardingOpen || isForceEditingOnboarding) return;

    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const IDLE_TIME_MS = 15000; // 15 seconds of mouse stillness on radio page

    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setScreensaverOpen(true);
      }, IDLE_TIME_MS);
    };

    // Start timer
    resetIdleTimer();

    // Reset timer on any user interaction
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel'];
    const handleActivity = () => resetIdleTimer();

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleActivity, { passive: true });
    });

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleActivity);
      });
    };
  }, [isOnboardingOpen, isForceEditingOnboarding, setScreensaverOpen]);

  // Load curated "For You", Local (all stations in user's country), and Global stations
  useEffect(() => {
    let isMounted = true;
    const loadCurated = async () => {
      setIsLoading(true);
      try {
        const country = userPreferences.countryCode || 'US';
        const genres = userPreferences.favoriteGenres || ['lofi', 'chillout', 'electronic'];

        const [curated, local, global] = await Promise.all([
          radioBrowserApi.getCuratedForUser(country, genres, 40),
          radioBrowserApi.getStationsByCountry(country, 120), // Loads all/broadest list of stations in country
          radioBrowserApi.getTopStations(40),
        ]);

        if (isMounted) {
          setForYouStations(curated);
          setLocalStations(local);
          setGlobalStations(global);
        }
      } catch (err) {
        console.warn('Error loading initial curated stations:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadCurated();
    return () => {
      isMounted = false;
    };
  }, [userPreferences.countryCode, userPreferences.favoriteGenres]);

  // Debounced search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Execute search when debounced query updates
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let isMounted = true;
    setIsSearching(true);
    setActiveCategory('search');

    radioBrowserApi
      .searchStations(debouncedQuery, 60)
      .then((results) => {
        if (isMounted) setSearchResults(results);
      })
      .catch((err) => {
        console.warn('Search failed:', err);
        if (isMounted) setSearchResults([]);
      })
      .finally(() => {
        if (isMounted) setIsSearching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  // Handle Genre selection via Dropdown
  const handleSelectGenre = async (genreId: string) => {
    setSelectedGenreId(genreId);
    setSearchQuery('');
    if (genreId === 'all') {
      setActiveCategory('for-you');
      return;
    }
    setActiveCategory('genre');
    setIsLoading(true);
    try {
      const results = await radioBrowserApi.getStationsByTag(genreId, 60);
      setGenreStations(results);
    } catch {
      setGenreStations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Favorite Station
  const handleToggleFavorite = (station: RadioBrowserStation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    authStorage.toggleRadioFavoriteStation(station);
    refreshFavorites();
  };

  // Active view list of stations
  const displayedStations = useMemo(() => {
    if (activeCategory === 'search') return searchResults;

    if (activeCategory === 'for-you') {
      // Made for You: Always show liked stations at the top, regardless of country!
      const seen = new Set<string>();
      const combined: RadioBrowserStation[] = [];
      favoritesList.forEach((s) => {
        if (!seen.has(s.stationuuid)) {
          seen.add(s.stationuuid);
          combined.push(s);
        }
      });
      forYouStations.forEach((s) => {
        if (!seen.has(s.stationuuid)) {
          seen.add(s.stationuuid);
          combined.push(s);
        }
      });
      return combined;
    }

    if (activeCategory === 'local') {
      // All Stations in selected country:
      // Include any liked stations from this country at the top,
      // and ensure liked stations appear even if not in the first 120 results!
      const currentCountryCode = (userPreferences.countryCode || 'US').toUpperCase();
      const countryFavs = favoritesList.filter(
        (s) => (s.countrycode || '').toUpperCase() === currentCountryCode
      );
      const seen = new Set<string>(countryFavs.map((s) => s.stationuuid));
      const combined = [...countryFavs];
      localStations.forEach((s) => {
        if (!seen.has(s.stationuuid)) {
          seen.add(s.stationuuid);
          combined.push(s);
        }
      });
      return combined;
    }

    if (activeCategory === 'global') return globalStations;
    if (activeCategory === 'genre') return genreStations;

    if (activeCategory === 'favorites') {
      // Liked Stations: Always display all liked stations, whether he selected another country or not!
      return favoritesList;
    }

    if (activeCategory === 'recordings') {
      return [];
    }

    if (activeCategory === 'recent') {
      const recentIds = authStorage.getRadioRecent();
      const allKnown = [
        ...favoritesList,
        ...forYouStations,
        ...localStations,
        ...globalStations,
        ...INITIAL_CURATED_STATIONS,
      ];
      return recentIds
        .map((id) => allKnown.find((s) => s.stationuuid === id))
        .filter(Boolean) as RadioBrowserStation[];
    }
    return forYouStations;
  }, [
    activeCategory,
    searchResults,
    forYouStations,
    localStations,
    globalStations,
    genreStations,
    favoritesList,
    userPreferences.countryCode,
  ]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#070b14] text-white overflow-hidden select-none">
      {/* Onboarding Wizard Modal */}
      <RadioOnboardingModal
        isOpen={isOnboardingOpen || isForceEditingOnboarding}
        forceEdit={isForceEditingOnboarding}
        onClose={() => {
          setIsForceEditingOnboarding(false);
          setIsOnboardingOpen(false);
        }}
      />

      {/* ========================================================= */}
      {/* 1. TOP OPTIONS FRAME (Consolidates all controls in 1 bar) */}
      {/* ========================================================= */}
      <header className="flex-shrink-0 z-30 bg-[#0a0f1d]/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-2.5 space-y-2">
        {/* Top Row: Home Button, Logo, Search, Location Pill & Screensaver */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Home Button + Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-zinc-200 hover:text-white transition-all group active:scale-95 shadow-sm"
              title="Stop radio and return to Home"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Home</span>
            </button>

            <div className="h-5 w-[1px] bg-white/15 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
                style={{ backgroundColor: `${accentHex}25`, color: accentHex }}
              >
                <RadioIcon className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold tracking-tight text-white leading-tight">
                  Echora Radio
                </h1>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{stats.stations.toLocaleString()}+ ONLINE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Search input */}
          <div className="relative flex-1 min-w-[180px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search 65,000+ stations by name, tag, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Location & Preferences Pill + Screensaver Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsForceEditingOnboarding(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-200 hover:text-white transition-all shadow-sm"
              title="Change your region and favorite genres"
            >
              <span className="text-sm leading-none">
                {getCountryFlag(userPreferences.countryCode || 'US')}
              </span>
              <span className="text-xs font-medium max-w-[110px] truncate hidden md:inline">
                {userPreferences.countryName || 'United States'}
              </span>
              <Settings2 className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            <button
              onClick={() => setScreensaverOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-cyan-600/30 hover:from-purple-600/50 hover:to-cyan-600/50 border border-white/20 text-xs font-semibold text-white shadow-md transition-all active:scale-95"
              title="Launch full-screen reactive audio visualizer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span className="hidden sm:inline">Screensaver</span>
            </button>
          </div>
        </div>

        {/* Bottom Row of Top Frame: Category Pills + Genre Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1.5 border-t border-white/5">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5 max-w-full">
            <button
              onClick={() => {
                setActiveCategory('for-you');
                setSelectedGenreId('all');
                setSearchQuery('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === 'for-you' && !searchQuery
                  ? 'bg-white/20 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
              style={activeCategory === 'for-you' && !searchQuery ? { color: accentHex } : {}}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Made For You</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('local');
                setSelectedGenreId('all');
                setSearchQuery('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === 'local' && !searchQuery
                  ? 'bg-white/20 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
              style={activeCategory === 'local' && !searchQuery ? { color: accentHex } : {}}
            >
              <span>{getCountryFlag(userPreferences.countryCode || 'US')}</span>
              <span>All Stations in {userPreferences.countryName || 'Your Region'}</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('global');
                setSelectedGenreId('all');
                setSearchQuery('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === 'global' && !searchQuery
                  ? 'bg-white/20 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
              style={activeCategory === 'global' && !searchQuery ? { color: accentHex } : {}}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Global Top 50</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('favorites');
                setSearchQuery('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === 'favorites' && !searchQuery
                  ? 'bg-white/20 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  favIds.length > 0 ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
              <span>Liked ({favIds.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('recent');
                setSearchQuery('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === 'recent' && !searchQuery
                  ? 'bg-white/20 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Recent</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('recordings');
                setSearchQuery('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === 'recordings' && !searchQuery
                  ? 'bg-white/20 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
              style={activeCategory === 'recordings' && !searchQuery ? { color: accentHex } : {}}
            >
              <HardDriveDownload className="w-3.5 h-3.5 text-rose-400" />
              <span>Recordings ({savedRecordings.length})</span>
            </button>

            <button
              onClick={wander}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap text-zinc-400 hover:text-cyan-300 hover:bg-white/5 transition-all group"
            >
              <Shuffle className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
              <span>Surprise Me</span>
            </button>
          </div>

          {/* Genre / Vibe Dropdown on Right of Top Frame */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-zinc-300">
              <Music className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <select
                value={activeCategory === 'genre' ? selectedGenreId : 'all'}
                onChange={(e) => handleSelectGenre(e.target.value)}
                className="bg-transparent text-xs text-zinc-200 outline-none cursor-pointer max-w-[140px] truncate"
                aria-label="Filter by Genre"
              >
                <option value="all" className="bg-[#0f172a] text-zinc-300">
                  🎵 All Genres
                </option>
                {POPULAR_GENRES.filter((g) => g.id !== 'all').map((g) => (
                  <option key={g.id} value={g.id} className="bg-[#0f172a] text-white">
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. FULL SCREEN STATION CANVAS (100% Width & Responsive)  */}
      {/* ========================================================= */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4">
        {activeCategory === 'recordings' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <HardDriveDownload className="w-5 h-5 text-rose-400" />
                  <span>My Radio Recordings ({savedRecordings.length})</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Broadcasts recorded live and downloaded locally to your computer.
                </p>
              </div>

              {savedRecordings.length > 0 && (
                <div className="text-xs text-zinc-400 font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                  Total Size:{' '}
                  <span className="text-white font-bold">
                    {formatBytes(
                      savedRecordings.reduce((acc, r) => acc + (r.sizeBytes || 0), 0)
                    )}
                  </span>
                </div>
              )}
            </div>

            {savedRecordings.length === 0 ? (
              <div className="py-20 text-center rounded-2xl bg-white/[0.02] border border-white/10 p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                  <HardDriveDownload className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-zinc-200">No recordings saved yet</h4>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                    You can record any live station! Click the{' '}
                    <span className="text-rose-400 font-medium">🔴 Record</span> button in the bottom player bar or on any station card. When you stop, the audio file is automatically downloaded to your computer and saved here for replay.
                  </p>
                </div>
                <button
                  onClick={() => setActiveCategory('for-you')}
                  className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all shadow-md active:scale-95"
                >
                  Explore Radio Stations
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {savedRecordings.map((rec) => {
                  const isThisPlaying = playingRecordingId === rec.id && !recordingAudioEl?.paused;

                  return (
                    <div
                      key={rec.id}
                      className={`group relative p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        playingRecordingId === rec.id
                          ? 'bg-white/15 border-white/30 shadow-lg'
                          : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10'
                      }`}
                      style={
                        playingRecordingId === rec.id ? { borderColor: `${accentHex}90` } : {}
                      }
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative w-12 h-12 rounded-xl bg-black/60 border border-white/15 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
                          {rec.favicon ? (
                            <img
                              src={rec.favicon}
                              alt={rec.stationName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <RadioIcon className="w-5 h-5 text-zinc-400" />
                          )}

                          <button
                            onClick={() => handleTogglePlayRecording(rec)}
                            className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                              isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                            title={isThisPlaying ? 'Pause preview' : 'Play preview'}
                          >
                            {isThisPlaying ? (
                              <Pause className="w-4 h-4 text-white fill-white" />
                            ) : (
                              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                            )}
                          </button>
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-xs font-semibold text-white truncate">
                            {rec.stationName}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 truncate">
                            <span>{getCountryFlag(rec.countrycode)}</span>
                            <span className="truncate">{rec.country || 'Global'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                            <span>{formatDate(rec.timestamp)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-zinc-300">
                            {rec.codec || 'MP3'}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {formatDuration(rec.durationSeconds)} • {formatBytes(rec.sizeBytes)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleTogglePlayRecording(rec)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors"
                            title={isThisPlaying ? 'Pause preview' : 'Play preview'}
                          >
                            {isThisPlaying ? (
                              <Pause className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDownloadSavedRecording(rec)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-medium transition-colors"
                            title="Download audio file to computer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Save</span>
                          </button>

                          <button
                            onClick={(e) => handleDeleteRecording(rec.id, e)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                            title="Delete recording"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Header bar with Title, Count, and Filter Reset */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  {activeCategory === 'search' && <span>Search: "{debouncedQuery}"</span>}
                  {activeCategory === 'for-you' && <span>Made For You</span>}
                  {activeCategory === 'local' && (
                    <span>
                      All Stations in {userPreferences.countryName || 'Your Region'}{' '}
                      {getCountryFlag(userPreferences.countryCode || 'US')}
                    </span>
                  )}
                  {activeCategory === 'global' && <span>Global Top 50 Worldwide</span>}
                  {activeCategory === 'favorites' && (
                    <span>Liked Stations ({favoritesList.length})</span>
                  )}
                  {activeCategory === 'recent' && <span>Recently Played</span>}
                  {activeCategory === 'genre' && (
                    <span>
                      {POPULAR_GENRES.find((g) => g.id === selectedGenreId)?.label || selectedGenreId}{' '}
                      Stations
                    </span>
                  )}
                </h2>
                <p className="text-xs text-zinc-400">
                  {displayedStations.length} stations available
                </p>
              </div>

              {/* Quick Reset if filtered */}
              {(activeCategory === 'genre' || searchQuery) && (
                <button
                  onClick={() => {
                    setActiveCategory('for-you');
                    setSelectedGenreId('all');
                    setSearchQuery('');
                  }}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Filter className="w-3 h-3" />
                  <span>Reset to For You</span>
                </button>
              )}
            </div>

            {/* Station Cards Grid - 100% width with 4 to 5 responsive columns! */}
            {isLoading || isSearching ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-400">
                <Loader2 className="w-7 h-7 animate-spin text-cyan-400" />
                <p className="text-xs">Connecting to radio stations...</p>
              </div>
            ) : displayedStations.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-white/[0.02] border border-white/10 p-8 space-y-3">
                <RadioIcon className="w-10 h-10 text-zinc-500 mx-auto" />
                <h4 className="text-sm font-semibold text-zinc-300">No stations found</h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Try another keyword, or choose another genre from the dropdown above.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('for-you');
                    setSelectedGenreId('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white transition-colors"
                >
                  Back to Recommended
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {displayedStations.map((station) => {
                  const isStationActive = currentStation?.stationuuid === station.stationuuid;
                  const isThisPlaying = isStationActive && isPlaying;
                  const isFav = favIds.includes(station.stationuuid);
                  const isThisRecording =
                    recordingState.isRecording &&
                    recordingState.station?.stationuuid === station.stationuuid;

                  return (
                    <div
                      key={station.stationuuid}
                      onClick={() => {
                        if (isStationActive) {
                          togglePlay();
                        } else {
                          playStation(station);
                        }
                      }}
                      className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isStationActive
                          ? 'bg-white/15 border-white/30 shadow-lg'
                          : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10'
                      }`}
                      style={isStationActive ? { borderColor: `${accentHex}90` } : {}}
                    >
                      {/* Artwork & Hover Play Icon */}
                      <div className="relative w-12 h-12 rounded-xl bg-black/60 border border-white/15 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
                        {station.favicon ? (
                          <img
                            src={station.favicon}
                            alt={station.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <RadioIcon className="w-5 h-5 text-zinc-400" />
                        )}

                        {/* Hover / Active Play Indicator */}
                        <div
                          className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                            isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {isThisPlaying ? (
                            <Pause className="w-4 h-4 text-white fill-white" />
                          ) : (
                            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                          )}
                        </div>
                      </div>

                      {/* Station Details */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h4 className="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                          {station.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 truncate">
                          <span>{getCountryFlag(station.countrycode)}</span>
                          <span className="truncate">{station.country}</span>
                        </div>
                        {station.tags && (
                          <p className="text-[10px] text-zinc-500 truncate">
                            {station.tags.split(',').slice(0, 2).join(', ')}
                          </p>
                        )}
                      </div>

                      {/* Quick Record Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isThisRecording) {
                            handleStopRecording();
                          } else {
                            handleStartRecording(station);
                          }
                        }}
                        className={`p-1.5 rounded-full transition-all flex-shrink-0 ${
                          isThisRecording
                            ? 'text-rose-400 animate-pulse bg-rose-500/20'
                            : 'text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-rose-400 hover:bg-rose-500/10'
                        }`}
                        title={
                          isThisRecording
                            ? 'Stop recording and download MP3'
                            : `Record ${station.name}`
                        }
                      >
                        {isThisRecording ? (
                          <Square className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        ) : (
                          <CircleDot className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => handleToggleFavorite(station, e)}
                        className={`p-1.5 rounded-full transition-all flex-shrink-0 ${
                          isFav
                            ? 'text-rose-400 hover:text-rose-300'
                            : 'text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-white'
                        }`}
                        title={isFav ? 'Remove Favorite' : 'Save Favorite'}
                      >
                        <Heart
                          className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* ========================================================= */}
      {/* 3. BOTTOM AUDIO CONTROLLER (Persistent Playback Bar) */}
      {/* ========================================================= */}
      <footer className="h-20 bg-[#090d19] border-t border-white/15 px-4 sm:px-6 flex items-center justify-between z-30 flex-shrink-0 shadow-2xl">
        {/* Left: Current Playing Station */}
        <div className="w-1/3 flex items-center gap-3 truncate">
          {currentStation ? (
            <>
              <div className="relative w-11 h-11 rounded-xl bg-black/60 border border-white/15 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {currentStation.favicon ? (
                  <img
                    src={currentStation.favicon}
                    alt={currentStation.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <RadioIcon className="w-5 h-5 text-zinc-400" />
                )}
              </div>

              <div className="truncate space-y-0.5">
                <h4 className="text-xs sm:text-sm font-semibold text-white truncate max-w-[150px] sm:max-w-xs">
                  {currentStation.name}
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 truncate">
                  <span>{getCountryFlag(currentStation.countrycode)}</span>
                  <span className="truncate">{currentStation.country}</span>
                </div>
              </div>

              <button
                onClick={() => handleToggleFavorite(currentStation)}
                className="hidden sm:block p-1.5 text-zinc-400 hover:text-white transition-colors ml-1"
                title="Toggle favorite"
              >
                <Heart
                  className={`w-4 h-4 ${
                    favIds.includes(currentStation.stationuuid)
                      ? 'fill-rose-500 text-rose-500'
                      : ''
                  }`}
                />
              </button>
            </>
          ) : (
            <div className="text-xs text-zinc-500 flex items-center gap-2">
              <RadioIcon className="w-4 h-4" />
              <span>Select any station to play</span>
            </div>
          )}
        </div>

        {/* Center: Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={wander}
            className="p-2 rounded-full text-zinc-400 hover:text-cyan-300 transition-colors"
            title="Random surprise station"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            disabled={!currentStation}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 shadow-xl disabled:opacity-50"
            style={{ backgroundColor: accentHex }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoadingStream ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>

          {/* Record Live Audio Button / Active REC Indicator */}
          {recordingState.isRecording ? (
            <button
              onClick={handleStopRecording}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 hover:text-rose-200 text-xs font-semibold shadow-lg transition-all animate-pulse"
              title="Stop recording and download MP3 to your computer"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-ping" />
              <span className="font-mono">
                REC {formatDuration(recordingState.durationSeconds)} ({formatBytes(recordingState.bytesRecorded)})
              </span>
              <Square className="w-3 h-3 fill-rose-400 text-rose-400 ml-0.5" />
            </button>
          ) : (
            <button
              onClick={() => handleStartRecording()}
              disabled={!currentStation}
              className="p-2 rounded-full text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40"
              title={
                currentStation
                  ? `Record & download live broadcast of ${currentStation.name}`
                  : 'Play a station to record'
              }
            >
              <CircleDot className="w-4 h-4 text-rose-500" />
            </button>
          )}

          <button
            onClick={() => setScreensaverOpen(true)}
            className="p-2 rounded-full text-zinc-400 hover:text-white transition-colors"
            title="Open Audio Visualizer"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </button>
        </div>

        {/* Right: Volume Slider */}
        <div className="w-1/3 flex items-center justify-end gap-2">
          <button
            onClick={toggleMute}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 sm:w-24 h-1 accent-cyan-400 cursor-pointer"
            style={{ accentColor: accentHex }}
            aria-label="Volume"
          />
        </div>
      </footer>

      {/* Floating Notification Toast */}
      {downloadToast && (
        <div className="fixed bottom-24 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#0f172a]/95 border border-rose-500/40 text-white text-xs font-medium shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{downloadToast}</span>
        </div>
      )}
    </div>
  );
};
