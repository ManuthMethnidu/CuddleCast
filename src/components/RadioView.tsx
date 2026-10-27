import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Radio as RadioIcon,
  Search,
  Shuffle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Star,
  Globe as GlobeIcon,
  Flame,
  Clock,
  Sparkles,
  ExternalLink,
  RotateCw,
  Compass,
  Headphones,
  Signal,
} from 'lucide-react';
import { useAccent } from '../context/AccentContext';
import { authStorage } from '../services/storage';
import {
  RadioBrowserStation,
  radioBrowserApi,
  INITIAL_CURATED_STATIONS,
  POPULAR_GENRES,
  FEATURED_COUNTRIES,
} from '../services/radioBrowser';
import Globe, { GlobeMarker } from './lightswind/globe';

interface RadioViewProps {
  onBack?: () => void;
}

type TabMode = 'globe' | 'trending' | 'genres' | 'countries' | 'favorites' | 'recent';

export const RadioView: React.FC<RadioViewProps> = () => {
  const { accentHex } = useAccent();

  // Stations & Playing state
  const [stations, setStations] = useState<RadioBrowserStation[]>(INITIAL_CURATED_STATIONS);
  const [selectedStation, setSelectedStation] = useState<RadioBrowserStation>(
    INITIAL_CURATED_STATIONS[0]
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);

  // Tabs, Filters & Search
  const [activeTab, setActiveTab] = useState<TabMode>('globe');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('GLOBAL');
  const [isFetching, setIsFetching] = useState(false);

  // Globe controls
  const [autoRotate, setAutoRotate] = useState(true);
  const [globeFocus, setGlobeFocus] = useState<[number, number] | null>([
    INITIAL_CURATED_STATIONS[0].latitude,
    INITIAL_CURATED_STATIONS[0].longitude,
  ]);

  // User-scoped favorites & recents
  const [favorites, setFavorites] = useState<string[]>(() =>
    authStorage.getRadioFavorites()
  );
  const [recent, setRecent] = useState<string[]>(() =>
    authStorage.getRadioRecent()
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Subscribe to storage changes (e.g. user switch)
  useEffect(() => {
    const reload = () => {
      setFavorites(authStorage.getRadioFavorites());
      setRecent(authStorage.getRadioRecent());
    };
    const unsubscribe = authStorage.subscribe(reload);
    return unsubscribe;
  }, []);

  // Fetch initial top stations from Radio Browser info API
  useEffect(() => {
    let isCancelled = false;
    setIsFetching(true);
    radioBrowserApi
      .getTopStations(120)
      .then((data) => {
        if (!isCancelled && data && data.length > 0) {
          setStations(data);
          setSelectedStation(data[0]);
          setGlobeFocus([data[0].latitude, data[0].longitude]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!isCancelled) setIsFetching(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Handle Genre filter change
  const handleSelectGenre = (genreId: string) => {
    setSelectedGenre(genreId);
    setSelectedCountry('GLOBAL');
    setSearchQuery('');
    setIsFetching(true);
    radioBrowserApi
      .getStationsByTag(genreId, 100)
      .then((data) => {
        if (data && data.length > 0) {
          setStations(data);
          setSelectedStation(data[0]);
          setGlobeFocus([data[0].latitude, data[0].longitude]);
        }
      })
      .catch(() => {})
      .finally(() => setIsFetching(false));
  };

  // Handle Country filter change
  const handleSelectCountry = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setSelectedGenre('all');
    setSearchQuery('');
    setIsFetching(true);
    radioBrowserApi
      .getStationsByCountry(countryCode, 100)
      .then((data) => {
        if (data && data.length > 0) {
          setStations(data);
          setSelectedStation(data[0]);
          setGlobeFocus([data[0].latitude, data[0].longitude]);
        }
      })
      .catch(() => {})
      .finally(() => setIsFetching(false));
  };

  // Handle Search Input (debounced)
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timer = setTimeout(() => {
      setIsFetching(true);
      radioBrowserApi
        .searchStations(searchQuery, 80)
        .then((data) => {
          if (data && data.length > 0) {
            setStations(data);
          }
        })
        .catch(() => {})
        .finally(() => setIsFetching(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Audio Playback Synchronization
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Play station handler
  const playStation = useCallback(
    (st: RadioBrowserStation) => {
      setSelectedStation(st);
      setGlobeFocus([st.latitude, st.longitude]);
      setStreamError(false);
      setIsLoadingStream(true);

      // Record in recent stations (persisted uniquely per Clerk user)
      setRecent((prev) => {
        const updated = [st.stationuuid, ...prev.filter((id) => id !== st.stationuuid)].slice(0, 40);
        authStorage.saveRadioRecent(updated);
        return updated;
      });

      const audio = audioRef.current;
      if (audio) {
        audio.src = st.url_resolved || st.url;
        audio.load();
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsLoadingStream(false);
          })
          .catch((err) => {
            console.warn('Radio stream playback notice:', err);
            setIsPlaying(false);
            setIsLoadingStream(false);
            setStreamError(true);
          });
      }
    },
    []
  );

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setIsLoadingStream(true);
      setStreamError(false);
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoadingStream(false);
        })
        .catch(() => {
          setIsPlaying(false);
          setIsLoadingStream(false);
          setStreamError(true);
        });
    }
  };

  // Toggle Favorite
  const toggleFavorite = (uuid: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const exists = prev.includes(uuid);
      const updated = exists ? prev.filter((id) => id !== uuid) : [...prev, uuid];
      authStorage.saveRadioFavorites(updated);
      return updated;
    });
  };

  // Random Tune ("Surprise Me")
  const handleRandomTune = () => {
    if (stations.length === 0) return;
    const pool = stations.filter((s) => s.stationuuid !== selectedStation.stationuuid);
    const random = pool[Math.floor(Math.random() * pool.length)] || stations[0];
    playStation(random);
  };

  // Markers for 3D Globe
  const globeMarkers = useMemo<GlobeMarker[]>(() => {
    return stations.map((st) => {
      const isSelected = st.stationuuid === selectedStation.stationuuid;
      return {
        location: [st.latitude, st.longitude],
        size: isSelected ? 0.085 : 0.038,
        color: isSelected ? [1, 0.4, 0.3] : [0.35, 0.75, 1],
        id: st.stationuuid,
      };
    });
  }, [stations, selectedStation.stationuuid]);

  // Displayed stations based on current active tab
  const displayedStations = useMemo(() => {
    if (activeTab === 'favorites') {
      return stations.filter((s) => favorites.includes(s.stationuuid));
    }
    if (activeTab === 'recent') {
      return recent
        .map((uuid) => stations.find((s) => s.stationuuid === uuid))
        .filter(Boolean) as RadioBrowserStation[];
    }
    if (activeTab === 'trending') {
      return [...stations].sort((a, b) => b.votes - a.votes);
    }
    return stations;
  }, [stations, activeTab, favorites, recent]);

  const isCurrentFavorite = favorites.includes(selectedStation.stationuuid);

  return (
    <div className="mx-auto max-w-[1720px] px-3.5 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-28 select-none animate-fadeIn text-[#F3F3F3]">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onPlaying={() => {
          setIsPlaying(true);
          setIsLoadingStream(false);
        }}
        onWaiting={() => setIsLoadingStream(true)}
        onError={() => {
          setStreamError(true);
          setIsPlaying(false);
          setIsLoadingStream(false);
        }}
        preload="none"
      />

      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg border border-white/10"
            style={{ background: `${accentHex}25`, color: accentHex }}
          >
            <RadioIcon className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Global Radio
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live 3D Globe
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Powered by Radio Browser · Real-time 3D station tuning across 190+ countries
            </p>
          </div>
        </div>

        {/* Global Controls & Random Zap */}
        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={handleRandomTune}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-black transition-all hover:scale-105 active:scale-95 shadow-md flex-shrink-0"
            style={{ background: '#fff' }}
            title="Tune to a random radio station on Earth"
          >
            <Shuffle className="h-3.5 w-3.5 fill-black" />
            <span>Surprise Me</span>
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex-shrink-0 ${
              autoRotate
                ? 'bg-white/15 border-white/20 text-white'
                : 'bg-black/30 border-white/10 text-zinc-400 hover:text-white'
            }`}
            title="Toggle Earth Auto-Rotation"
          >
            <RotateCw className={`h-3.5 w-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>{autoRotate ? 'Rotate On' : 'Rotate Off'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive 3D Globe + Live Tuner Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        {/* 3D Globe Stage (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col rounded-3xl bg-[#13171d]/90 border border-white/10 overflow-hidden shadow-2xl relative min-h-[460px] sm:min-h-[580px]">
          {/* Ambient Cosmic Radial Glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${accentHex}30 0%, transparent 68%)`,
            }}
          />

          {/* Top Globe HUD Overlay */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-mono text-zinc-300">
              <Compass className="h-3.5 w-3.5 text-sky-400" />
              <span>
                {selectedStation.latitude.toFixed(2)}°N, {selectedStation.longitude.toFixed(2)}°E
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-zinc-300">
              <Signal className="h-3 w-3 text-emerald-400 animate-pulse" />
              <span>{stations.length} Active Stations</span>
            </div>
          </div>

          {/* The Lightswind 3D Globe Component */}
          <div className="flex-1 w-full flex items-center justify-center p-2 sm:p-6 z-10 cursor-grab active:cursor-grabbing">
            <Globe
              className="w-full h-full max-h-[540px]"
              scale={1.18}
              theta={0.25}
              diffuse={1.25}
              dark={1}
              mapSamples={26000}
              mapBrightness={11}
              baseColor="#1c2430"
              markerColor={accentHex}
              glowColor="#3b82f6"
              markers={globeMarkers}
              autoRotate={autoRotate}
              autoRotateSpeed={0.0025}
              focusLocation={globeFocus}
            />
          </div>

          {/* Bottom Globe Hint */}
          <div className="relative z-20 px-4 py-2.5 bg-black/40 backdrop-blur-md border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>🖱️ Drag to rotate globe · Scroll/Pinch to zoom</span>
            <span className="text-zinc-500">Lightswind 3D Engine</span>
          </div>
        </div>

        {/* Live Tuner & Current Station Deck (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 rounded-3xl bg-[#171b22]/90 border border-white/10 p-5 sm:p-6 shadow-2xl relative">
          {/* Station Now Playing Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-400 border border-white/5 flex items-center gap-1.5">
                <Headphones className="h-3 w-3" style={{ color: accentHex }} />
                <span>Now Tuned</span>
              </span>

              <div className="flex items-center gap-2">
                {/* External link to station website */}
                {selectedStation.homepage && (
                  <a
                    href={selectedStation.homepage}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Visit official station website"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}

                {/* Favorite Button */}
                <button
                  onClick={(e) => toggleFavorite(selectedStation.stationuuid, e)}
                  className={`p-2 rounded-xl transition-all ${
                    isCurrentFavorite
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                  title={isCurrentFavorite ? 'Remove from favorites' : 'Save to favorites'}
                >
                  <Star className={`h-4 w-4 ${isCurrentFavorite ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Station Title & Country */}
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug line-clamp-2">
                {selectedStation.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-medium">
                <span className="text-zinc-200 font-semibold">{selectedStation.country}</span>
                <span>•</span>
                <span className="uppercase text-sky-400 font-mono font-bold">
                  {selectedStation.codec} {selectedStation.bitrate}kbps
                </span>
                <span>•</span>
                <span>{selectedStation.votes.toLocaleString()} votes</span>
              </div>
            </div>

            {/* Tags Pills */}
            {selectedStation.tags && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedStation.tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .slice(0, 4)
                  .map((tag) => (
                    <span
                      key={tag}
                      onClick={() => handleSelectGenre(tag)}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 hover:bg-white/15 text-zinc-300 border border-white/5 cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
              </div>
            )}

            {/* Stream Error Banner */}
            {streamError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
                <span>Station is temporarily unreachable or offline.</span>
                <button
                  onClick={handleRandomTune}
                  className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 font-bold transition-colors"
                >
                  Try Another
                </button>
              </div>
            )}

            {/* Live Audio Visualizer Equalizer */}
            <div className="h-14 rounded-2xl bg-black/40 border border-white/5 p-3 flex items-end justify-between gap-1 overflow-hidden">
              {Array.from({ length: 28 }).map((_, i) => {
                const randomHeight = isPlaying ? Math.floor(20 + Math.random() * 80) : 10;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-full transition-all duration-150"
                    style={{
                      height: `${randomHeight}%`,
                      background: isPlaying ? accentHex : '#4b5563',
                      opacity: isPlaying ? 0.9 : 0.3,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Primary Audio Controls */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            {/* Play Button & Volume */}
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                disabled={isLoadingStream}
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-black transition-all hover:scale-105 active:scale-95 shadow-xl flex-shrink-0"
                style={{ background: '#fff' }}
                title={isPlaying ? 'Pause' : 'Play Live Broadcast'}
              >
                {isLoadingStream ? (
                  <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-6 w-6 fill-black" />
                ) : (
                  <Play className="h-6 w-6 fill-black ml-1" />
                )}
              </button>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold text-white">Stream Volume</span>
                  <span>{isMuted ? '0%' : `${Math.round(volume * 100)}%`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-zinc-400 hover:text-white transition-colors"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4 text-red-400" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discovery & Navigation Tabs Section */}
      <div className="mt-12 space-y-6">
        {/* Navigation Tabs and Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-4 border-b border-white/10">
          {/* Main Filter Tabs */}
          <div className="flex items-center gap-1 rounded-2xl bg-[#18181d] border border-white/10 p-1.5 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'globe', label: 'All Stations', icon: GlobeIcon },
                { id: 'trending', label: 'Top Voted', icon: Flame },
                { id: 'genres', label: 'Genres', icon: Sparkles },
                { id: 'countries', label: 'Countries', icon: Compass },
                { id: 'favorites', label: `Favorites (${favorites.length})`, icon: Star },
                { id: 'recent', label: 'Recent', icon: Clock },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/15 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            {isFetching ? (
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            )}
            <input
              type="text"
              placeholder="Search station, city, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#18181d] border border-white/10 text-xs text-white placeholder-zinc-500 outline-none focus:border-white/30 transition-all"
            />
          </div>
        </div>

        {/* Sub-Filters: Genre Pills (when Genres or Globe is active) */}
        {activeTab === 'genres' && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {POPULAR_GENRES.map((g) => (
              <button
                key={g.id}
                onClick={() => handleSelectGenre(g.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedGenre === g.id
                    ? 'bg-white text-black shadow'
                    : 'bg-[#18181d] border border-white/10 text-zinc-300 hover:text-white'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        )}

        {/* Sub-Filters: Country Pills (when Countries is active) */}
        {activeTab === 'countries' && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {FEATURED_COUNTRIES.map((c) => (
              <button
                key={c.code}
                onClick={() => handleSelectCountry(c.code)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCountry === c.code
                    ? 'bg-white text-black shadow'
                    : 'bg-[#18181d] border border-white/10 text-zinc-300 hover:text-white'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Stations Grid List */}
        {displayedStations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {displayedStations.map((st) => {
              const isSelected = st.stationuuid === selectedStation.stationuuid;
              const isFav = favorites.includes(st.stationuuid);

              return (
                <div
                  key={st.stationuuid}
                  onClick={() => playStation(st)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-white/10 border-white/30 shadow-lg'
                      : 'bg-[#171b22] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Play / Playing Indicator */}
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 transition-all ${
                        isSelected && isPlaying
                          ? 'bg-emerald-500 text-black shadow'
                          : 'bg-white/5 text-zinc-400 group-hover:bg-white/15 group-hover:text-white'
                      }`}
                    >
                      {isSelected && isPlaying ? (
                        <div className="flex items-center gap-0.5">
                          <span className="w-1 h-3 bg-black rounded-full animate-pulse" />
                          <span className="w-1 h-4 bg-black rounded-full animate-bounce" />
                          <span className="w-1 h-2 bg-black rounded-full animate-pulse" />
                        </div>
                      ) : (
                        <Play className="h-4 w-4 ml-0.5 fill-current" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-xs sm:text-sm truncate group-hover:text-amber-400 transition-colors">
                        {st.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {st.country} · {st.codec} {st.bitrate}k
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                    <button
                      onClick={(e) => toggleFavorite(st.stationuuid, e)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isFav
                          ? 'text-amber-400'
                          : 'text-zinc-500 hover:text-white hover:bg-white/10'
                      }`}
                      title={isFav ? 'Remove favorite' : 'Add favorite'}
                    >
                      <Star className={`h-4 w-4 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <RadioIcon className="h-12 w-12 text-zinc-600 mb-3" />
            <p className="text-base font-bold text-white">No radio stations found</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              {activeTab === 'favorites'
                ? 'You have not added any radio stations to your favorites yet. Click the star on any station to save it!'
                : activeTab === 'recent'
                ? 'Your recently played radio stations will automatically appear here.'
                : 'Try clearing your search query or choosing another genre or country.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RadioView;
