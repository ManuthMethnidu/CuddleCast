import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Radio,
  Search,
  Headphones,
  Music,
  Mic,
  Disc3,
  Guitar,
  Flame,
  Play,
  Pause,
  Loader2,
  X,
} from 'lucide-react';
import { useAccent } from '../context/AccentContext';
import { useRadioStore } from '../store/radioStore';
import {
  radioBrowserApi,
  RadioBrowserStation,
  getCountryFlag,
  detectUserCountryCode,
  FEATURED_COUNTRIES,
} from '../services/radioBrowser';

interface RadioOnboardingModalProps {
  isOpen: boolean;
  onClose?: () => void;
  forceEdit?: boolean;
}

interface GenreOption {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const ONBOARDING_GENRES: GenreOption[] = [
  { id: 'lofi', label: 'Lo-Fi Chill', desc: 'Study, focus & ambient beats', icon: Headphones, color: 'from-indigo-600 to-purple-600' },
  { id: 'electronic', label: 'Electronic & Dance', desc: 'House, techno, EDM & club', icon: Disc3, color: 'from-cyan-600 to-blue-600' },
  { id: 'chillout', label: 'Chillout Lounge', desc: 'Downtempo, cafe & relax', icon: Music, color: 'from-teal-600 to-emerald-600' },
  { id: 'rock', label: 'Rock & Alternative', desc: 'Classic rock, indie & grunge', icon: Guitar, color: 'from-amber-600 to-orange-600' },
  { id: 'jazz', label: 'Smooth Jazz', desc: 'Bebop, saxophone & soul', icon: Music, color: 'from-rose-600 to-pink-600' },
  { id: 'classical', label: 'Classical & Symphony', desc: 'Orchestral, piano & strings', icon: Sparkles, color: 'from-emerald-600 to-teal-700' },
  { id: 'pop', label: 'Top 40 & Pop', desc: 'Today hits & global charts', icon: Mic, color: 'from-fuchsia-600 to-pink-500' },
  { id: 'hiphop', label: 'Hip-Hop & R&B', desc: 'Urban grooves, rap & trap', icon: Flame, color: 'from-orange-600 to-red-600' },
  { id: 'ambient', label: 'Ambient & Space', desc: 'Deep sleep, drones & cosmos', icon: Compass, color: 'from-violet-700 to-purple-900' },
  { id: 'news', label: 'News, Talk & Sports', desc: 'BBC, NPR & live commentary', icon: Radio, color: 'from-blue-600 to-indigo-700' },
  { id: 'synthwave', label: 'Synthwave & 80s', desc: 'Retro cyber vibes & neon', icon: Disc3, color: 'from-pink-600 to-purple-700' },
  { id: 'reggae', label: 'Reggae & Dub', desc: 'Roots, dub & island sunshine', icon: Music, color: 'from-yellow-600 to-emerald-600' },
];

export const RadioOnboardingModal: React.FC<RadioOnboardingModalProps> = ({
  isOpen,
  onClose,
  forceEdit: _forceEdit = false,
}) => {
  const { accentHex } = useAccent();
  const {
    userPreferences,
    completeOnboarding,
    setIsOnboardingOpen,
    playStation,
    currentStation,
    isPlaying,
    togglePlay,
  } = useRadioStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCountry, setSelectedCountry] = useState(userPreferences.countryCode || 'US');
  const [countrySearch, setCountrySearch] = useState('');
  const [allCountries, setAllCountries] = useState<Array<{ code: string; name: string }>>(FEATURED_COUNTRIES);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    userPreferences.favoriteGenres && userPreferences.favoriteGenres.length > 0
      ? userPreferences.favoriteGenres
      : ['lofi', 'chillout', 'electronic']
  );
  const [recommendedStations, setRecommendedStations] = useState<RadioBrowserStation[]>([]);
  const [preselectedStationIds, setPreselectedStationIds] = useState<Set<string>>(new Set());
  const [isLoadingStations, setIsLoadingStations] = useState(false);

  // Auto-detect country on initial mount if not yet completed
  useEffect(() => {
    if (!userPreferences.isOnboardingCompleted) {
      const detected = detectUserCountryCode();
      if (detected) {
        setSelectedCountry(detected);
      }
    }
  }, [userPreferences.isOnboardingCompleted]);

  // Fetch full country list from Radio Browser
  useEffect(() => {
    let isMounted = true;
    radioBrowserApi
      .getCountries()
      .then((countries) => {
        if (!isMounted || !countries || countries.length === 0) return;
        const list = countries.map((c) => ({
          code: c.iso_3166_1.toUpperCase(),
          name: c.name,
        }));
        // Deduplicate and combine with featured
        const map = new Map<string, string>();
        FEATURED_COUNTRIES.forEach((c) => map.set(c.code, c.name));
        list.forEach((c) => {
          if (!map.has(c.code)) map.set(c.code, c.name);
        });
        const combined = Array.from(map.entries()).map(([code, name]) => ({ code, name }));
        setAllCountries(combined);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // When reaching Step 3, fetch curated stations based on Country + Genres
  useEffect(() => {
    if (step === 3) {
      setIsLoadingStations(true);
      radioBrowserApi
        .getCuratedForUser(selectedCountry, selectedGenres, 12)
        .then((stations) => {
          setRecommendedStations(stations);
          // Preselect top 6 by default
          const defaultSelected = new Set(stations.slice(0, 6).map((s) => s.stationuuid));
          setPreselectedStationIds(defaultSelected);
        })
        .finally(() => {
          setIsLoadingStations(false);
        });
    }
  }, [step, selectedCountry, selectedGenres]);

  if (!isOpen) return null;

  const handleCountryAutoDetect = () => {
    const detected = detectUserCountryCode();
    setSelectedCountry(detected);
  };

  const handleToggleGenre = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
  };

  const handleToggleStationPick = (stationuuid: string) => {
    setPreselectedStationIds((prev) => {
      const next = new Set(prev);
      if (next.has(stationuuid)) {
        next.delete(stationuuid);
      } else {
        next.add(stationuuid);
      }
      return next;
    });
  };

  const handleFinish = () => {
    const countryObj = allCountries.find((c) => c.code === selectedCountry);
    const countryName = countryObj ? countryObj.name : selectedCountry;
    const chosenStations = recommendedStations.filter((s) =>
      preselectedStationIds.has(s.stationuuid)
    );

    completeOnboarding({
      countryCode: selectedCountry,
      countryName,
      favoriteGenres: selectedGenres,
      preselectedStations: chosenStations,
    });

    if (onClose) onClose();
  };

  const filteredCountries = allCountries.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-[#252b32] border border-[rgba(243,243,243,0.15)] rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col max-h-[92vh] overflow-hidden text-[#F3F3F3]">
        {/* Top Header */}
        <div className="p-6 border-b border-[rgba(243,243,243,0.10)] flex items-center justify-between bg-[#1e252e]/60">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-white/10"
              style={{ backgroundColor: `${accentHex}25`, color: accentHex }}
            >
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#F3F3F3] flex items-center gap-2">
                <span>Personalize Your Radio</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#353f49] text-[rgba(243,243,243,0.80)] border border-[rgba(243,243,243,0.10)]">
                  Step {step} of 3
                </span>
              </h2>
              <p className="text-xs text-[rgba(243,243,243,0.60)]">
                {step === 1 && 'Where in the world are you tuning in from?'}
                {step === 2 && 'What vibes and genres match your day?'}
                {step === 3 && 'Pick your starter favorites to curate your feed!'}
              </p>
            </div>
          </div>

          {/* Close / Skip button */}
          <button
            onClick={() => {
              completeOnboarding({
                countryCode: selectedCountry,
                countryName:
                  allCountries.find((c) => c.code === selectedCountry)?.name || 'United States',
                favoriteGenres: selectedGenres,
              });
              setIsOnboardingOpen(false);
              if (onClose) onClose();
            }}
            className="p-2 rounded-full text-[rgba(243,243,243,0.50)] hover:text-white hover:bg-[rgba(243,243,243,0.08)] transition-colors active:scale-95"
            title="Skip and start exploring"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="h-1 bg-[#1e252e] w-full">
          <div
            className="h-full transition-all duration-300 shadow-[0_0_8px_rgba(33,133,213,0.6)]"
            style={{
              width: step === 1 ? '33.3%' : step === 2 ? '66.6%' : '100%',
              backgroundColor: accentHex,
            }}
          />
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* STEP 1: Country & Location */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-[#F3F3F3]">Select Your Country</span>
                <button
                  onClick={handleCountryAutoDetect}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#353f49] hover:bg-[#3A4750] text-xs text-[#F3F3F3] transition-all active:scale-95 border border-[rgba(243,243,243,0.12)] shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#2185D5]" />
                  <span>Auto-Detect</span>
                </button>
              </div>

              {/* Search Country Input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(243,243,243,0.45)]" />
                <input
                  type="text"
                  placeholder="Search countries (e.g. Germany, Japan, United States)..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#1e252e] border border-[rgba(243,243,243,0.14)] text-sm text-[#F3F3F3] placeholder-[rgba(243,243,243,0.45)] focus:outline-none focus:border-[#2185D5] focus:ring-1 focus:ring-[#2185D5]/50"
                />
              </div>

              {/* Quick Country Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                {filteredCountries.slice(0, 48).map((c) => {
                  const isSelected = selectedCountry === c.code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => setSelectedCountry(c.code)}
                      className={`flex items-center justify-between p-3 rounded-2xl text-left border transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'bg-[#3A4750] text-[#F3F3F3] font-semibold border-[#2185D5] shadow-md ring-1 ring-[#2185D5]/50'
                          : 'bg-[#353f49]/70 hover:bg-[#3A4750] text-[rgba(243,243,243,0.80)] border-[rgba(243,243,243,0.08)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-xl flex-shrink-0">{getCountryFlag(c.code)}</span>
                        <span className="text-xs truncate">{c.name}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Choose Vibes & Genres */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#F3F3F3]">
                  Select your favorite listening vibes:
                </span>
                <span className="text-xs text-[rgba(243,243,243,0.60)] font-mono tabular-nums">
                  {selectedGenres.length} selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {ONBOARDING_GENRES.map((g) => {
                  const isSelected = selectedGenres.includes(g.id);
                  const Icon = g.icon;
                  return (
                    <button
                      key={g.id}
                      onClick={() => handleToggleGenre(g.id)}
                      className={`relative flex items-center gap-3.5 p-3.5 rounded-2xl text-left border transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'bg-[#3A4750] text-[#F3F3F3] shadow-lg border-[#2185D5] ring-1 ring-[#2185D5]/50'
                          : 'bg-[#353f49]/70 hover:bg-[#3A4750] text-[rgba(243,243,243,0.80)] border-[rgba(243,243,243,0.08)]'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center text-white shadow-md flex-shrink-0 ring-1 ring-white/10`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 truncate">
                        <h4 className="text-sm font-semibold text-[#F3F3F3] truncate">{g.label}</h4>
                        <p className="text-xs text-[rgba(243,243,243,0.60)] truncate">{g.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#2185D5] border-[#2185D5] text-white'
                            : 'border-[rgba(243,243,243,0.25)]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Curated Stations Pre-selection */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-[#F3F3F3]">
                    Recommended Stations for You
                  </span>
                  <p className="text-xs text-[rgba(243,243,243,0.60)]">
                    Ranked by community votes in {allCountries.find((c) => c.code === selectedCountry)?.name || selectedCountry}
                  </p>
                </div>
                <span className="text-xs text-[rgba(243,243,243,0.60)] font-mono tabular-nums">
                  {preselectedStationIds.size} stations picked
                </span>
              </div>

              {isLoadingStations ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-[rgba(243,243,243,0.60)]">
                  <Loader2 className="w-7 h-7 animate-spin text-[#2185D5]" />
                  <p className="text-xs">Tuning in to stations from Radio Browser...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {recommendedStations.map((station) => {
                    const isChecked = preselectedStationIds.has(station.stationuuid);
                    const isCurrentPlaying = currentStation?.stationuuid === station.stationuuid && isPlaying;

                    return (
                      <div
                        key={station.stationuuid}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                          isChecked
                            ? 'bg-[#3A4750] border-[#2185D5]/60 ring-1 ring-[#2185D5]/30'
                            : 'bg-[#353f49]/60 hover:bg-[#353f49] border-[rgba(243,243,243,0.08)] opacity-80'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          {/* Station Favicon */}
                          <div className="relative w-11 h-11 rounded-xl bg-[#1e252e] border border-[rgba(243,243,243,0.12)] flex items-center justify-center overflow-hidden flex-shrink-0 ring-1 ring-white/10 ring-inset">
                            {station.favicon ? (
                              <img
                                src={station.favicon}
                                alt={station.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <Radio className="w-5 h-5 text-[rgba(243,243,243,0.45)]" />
                            )}
                          </div>

                          <div className="truncate">
                            <h4 className="text-sm font-semibold text-[#F3F3F3] truncate max-w-[260px] sm:max-w-md">
                              {station.name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-[rgba(243,243,243,0.60)]">
                              <span>{station.country}</span>
                              {station.codec && (
                                <span className="px-1.5 py-0.5 rounded bg-[#303841] text-[10px] font-mono text-[rgba(243,243,243,0.75)] border border-[rgba(243,243,243,0.08)]">
                                  {station.codec} {station.bitrate > 0 ? `${station.bitrate}k` : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions: Audio preview & checkbox */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (isCurrentPlaying) {
                                togglePlay();
                              } else {
                                playStation(station);
                              }
                            }}
                            className="p-2 rounded-full hover:bg-[rgba(243,243,243,0.10)] text-[rgba(243,243,243,0.75)] hover:text-white transition-colors active:scale-95"
                            title={isCurrentPlaying ? 'Pause preview' : 'Preview station'}
                          >
                            {isCurrentPlaying ? (
                              <Pause className="w-4 h-4 text-[#2185D5] fill-[#2185D5]" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleToggleStationPick(station.stationuuid)}
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all active:scale-95 ${
                              isChecked
                                ? 'bg-[#2185D5] border-[#2185D5] text-white shadow-sm'
                                : 'border-[rgba(243,243,243,0.25)] hover:border-white'
                            }`}
                          >
                            {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 sm:p-6 border-t border-[rgba(243,243,243,0.10)] bg-[#1e252e]/80 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#353f49] hover:bg-[#3A4750] text-sm font-medium text-[#F3F3F3] transition-all active:scale-95 border border-[rgba(243,243,243,0.10)]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={() => {
                completeOnboarding({
                  countryCode: selectedCountry,
                  countryName:
                    allCountries.find((c) => c.code === selectedCountry)?.name || 'United States',
                  favoriteGenres: selectedGenres,
                });
                setIsOnboardingOpen(false);
                if (onClose) onClose();
              }}
              className="text-xs text-[rgba(243,243,243,0.50)] hover:text-white hover:underline transition-all"
            >
              Skip and explore
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as any)}
              disabled={step === 2 && selectedGenres.length === 0}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl text-sm font-bold text-white transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-lg bg-[#2185D5] hover:bg-[#1a74be]"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold text-white transition-transform active:scale-95 shadow-xl bg-gradient-to-r from-[#2185D5] to-emerald-400 hover:brightness-110"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Listening</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
