import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { RadioBrowserStation, radioBrowserApi } from '../services/radioBrowser';
import { authStorage } from '../services/storage';

export type ScreensaverTheme = 'waviz-bars';

export interface UserRadioPreferences {
  countryCode: string;
  countryName: string;
  favoriteGenres: string[];
  isOnboardingCompleted: boolean;
}

interface RadioState {
  currentStation: RadioBrowserStation | null;
  isPlaying: boolean;
  isLoadingStream: boolean;
  streamError: boolean;
  volume: number;
  isMuted: boolean;
  isPillVisible: boolean;
  isScreensaverOpen: boolean;
  screensaverTheme: ScreensaverTheme;
  userPreferences: UserRadioPreferences;
  isOnboardingOpen: boolean;

  // Actions
  playStation: (station: RadioBrowserStation) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPillVisible: (visible: boolean) => void;
  setScreensaverOpen: (open: boolean) => void;
  setScreensaverTheme: (theme: ScreensaverTheme) => void;
  setStreamStatus: (status: { isLoading?: boolean; hasError?: boolean }) => void;
  wander: () => Promise<RadioBrowserStation | null>;
  setUserPreferences: (prefs: Partial<UserRadioPreferences>) => void;
  setIsOnboardingOpen: (open: boolean) => void;
  completeOnboarding: (data: {
    countryCode: string;
    countryName: string;
    favoriteGenres: string[];
    preselectedStations?: RadioBrowserStation[];
  }) => void;
}

// Global persistent audio singleton
let globalAudio: HTMLAudioElement | null = null;

export function getGlobalRadioAudio(): HTMLAudioElement {
  if (typeof window === 'undefined') {
    return {} as HTMLAudioElement;
  }
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.preload = 'none';
    globalAudio.crossOrigin = 'anonymous';

    globalAudio.addEventListener('waiting', () => {
      useRadioStore.getState().setStreamStatus({ isLoading: true });
    });

    globalAudio.addEventListener('playing', () => {
      useRadioStore.getState().setStreamStatus({ isLoading: false, hasError: false });
    });

    globalAudio.addEventListener('error', () => {
      useRadioStore.getState().setStreamStatus({ isLoading: false, hasError: true });
    });
  }
  return globalAudio;
}

export const useRadioStore = create<RadioState>()(
  persist(
    (set, get) => ({
      currentStation: null,
      isPlaying: false,
      isLoadingStream: false,
      streamError: false,
      volume: 0.85,
      isMuted: false,
      isPillVisible: false,
      isScreensaverOpen: false,
      screensaverTheme: 'waviz-bars',
      userPreferences: {
        countryCode: 'US',
        countryName: 'United States',
        favoriteGenres: ['chillout', 'lofi', 'electronic'],
        isOnboardingCompleted: false,
      },
      isOnboardingOpen: false,

      playStation: (station: RadioBrowserStation) => {
        const audio = getGlobalRadioAudio();
        const streamUrl = station.url_resolved || station.url;

        // Save to recents in database/storage
        const currentRecent = authStorage.getRadioRecent();
        const updatedRecent = [
          station.stationuuid,
          ...currentRecent.filter((id) => id !== station.stationuuid),
        ].slice(0, 30);
        authStorage.saveRadioRecent(updatedRecent);
        authStorage.saveRadioPreferences({
          lastStation: station,
          recentStations: updatedRecent,
        });

        // Count click on community Radio Browser
        radioBrowserApi.countClick(station.stationuuid).catch(() => {});

        set({
          currentStation: station,
          isPlaying: true,
          isLoadingStream: true,
          streamError: false,
          isPillVisible: true,
        });

        if (audio) {
          audio.src = streamUrl;
          audio.volume = get().isMuted ? 0 : get().volume;
          audio.play().catch((err) => {
            console.warn('Radio stream auto-play blocked or failed:', err);
            // If failed, retry with original station url if different
            if (station.url && station.url !== streamUrl) {
              audio.src = station.url;
              audio.play().catch(() => {
                set({ isPlaying: false, isLoadingStream: false, streamError: true });
              });
            } else {
              set({ isPlaying: false, isLoadingStream: false, streamError: true });
            }
          });
        }
      },

      togglePlay: () => {
        const { isPlaying, currentStation, resume, pause } = get();
        if (!currentStation) return;
        if (isPlaying) {
          pause();
        } else {
          resume();
        }
      },

      pause: () => {
        const audio = getGlobalRadioAudio();
        if (audio) {
          audio.pause();
        }
        set({ isPlaying: false, isLoadingStream: false });
      },

      resume: () => {
        const { currentStation, isMuted, volume } = get();
        if (!currentStation) return;
        const audio = getGlobalRadioAudio();
        if (audio) {
          if (!audio.src || audio.src === '' || audio.src.endsWith('null')) {
            audio.src = currentStation.url_resolved || currentStation.url;
          }
          audio.volume = isMuted ? 0 : volume;
          audio.play().catch(() => {
            set({ streamError: true });
          });
        }
        set({ isPlaying: true, streamError: false });
      },

      stop: () => {
        const audio = getGlobalRadioAudio();
        if (audio) {
          audio.pause();
          audio.src = '';
        }
        set({
          isPlaying: false,
          isLoadingStream: false,
          streamError: false,
          isPillVisible: false,
          isScreensaverOpen: false,
        });
      },

      setVolume: (volume: number) => {
        const audio = getGlobalRadioAudio();
        const clamped = Math.max(0, Math.min(1, volume));
        if (audio && !get().isMuted) {
          audio.volume = clamped;
        }
        set({ volume: clamped, isMuted: clamped === 0 });
        authStorage.saveRadioPreferences({ volume: clamped, isMuted: clamped === 0 });
      },

      toggleMute: () => {
        const { isMuted, volume } = get();
        const nextMuted = !isMuted;
        const audio = getGlobalRadioAudio();
        if (audio) {
          audio.volume = nextMuted ? 0 : volume;
        }
        set({ isMuted: nextMuted });
        authStorage.saveRadioPreferences({ isMuted: nextMuted });
      },

      setPillVisible: (visible: boolean) => {
        set({ isPillVisible: visible });
      },

      setScreensaverOpen: (open: boolean) => {
        set({ isScreensaverOpen: open });
      },

      setScreensaverTheme: (_theme: ScreensaverTheme) => {
        set({ screensaverTheme: 'waviz-bars' });
      },

      setStreamStatus: ({ isLoading, hasError }) => {
        set((state) => ({
          isLoadingStream: typeof isLoading === 'boolean' ? isLoading : state.isLoadingStream,
          streamError: typeof hasError === 'boolean' ? hasError : state.streamError,
        }));
      },

      wander: async () => {
        set({ isLoadingStream: true });
        const station = await radioBrowserApi.getRandomStation();
        if (station) {
          get().playStation(station);
          return station;
        }
        set({ isLoadingStream: false });
        return null;
      },

      setUserPreferences: (prefs) => {
        set((state) => {
          const next = { ...state.userPreferences, ...prefs };
          authStorage.saveRadioPreferences({
            countryCode: next.countryCode,
            countryName: next.countryName,
            favoriteGenres: next.favoriteGenres,
            isOnboardingCompleted: next.isOnboardingCompleted,
          });
          return { userPreferences: next };
        });
      },

      setIsOnboardingOpen: (open) => {
        set({ isOnboardingOpen: open });
      },

      completeOnboarding: ({ countryCode, countryName, favoriteGenres, preselectedStations = [] }) => {
        const updatedPrefs: UserRadioPreferences = {
          countryCode,
          countryName,
          favoriteGenres,
          isOnboardingCompleted: true,
        };

        // If user pre-selected stations, merge them into favorites without overwriting existing
        let mergedStationObjs: any[] = [];
        if (preselectedStations.length > 0) {
          const currentFavs = authStorage.getRadioFavorites();
          const currentStationObjs = authStorage.getRadioFavoriteStations();
          const newIds = preselectedStations.map((s) => s.stationuuid);
          const combinedIds = Array.from(new Set([...newIds, ...currentFavs]));

          const stationMap = new Map<string, RadioBrowserStation>();
          currentStationObjs.forEach((s: any) => {
            const id = s.stationuuid || s.id;
            if (id) stationMap.set(id, s);
          });
          preselectedStations.forEach((s) => {
            const id = s.stationuuid || (s as any).id;
            if (id) stationMap.set(id, s);
          });

          mergedStationObjs = Array.from(stationMap.values());
          authStorage.saveRadioFavorites(combinedIds);
          authStorage.saveRadioFavoriteStations(mergedStationObjs);
        }

        authStorage.saveRadioPreferences({
          countryCode,
          countryName,
          favoriteGenres,
          isOnboardingCompleted: true,
          favoriteStations: mergedStationObjs.length > 0 ? mergedStationObjs : undefined,
        });

        set({
          userPreferences: updatedPrefs,
          isOnboardingOpen: false,
        });

        // Automatically start playing the top preselected station if idle
        if (!get().currentStation && preselectedStations.length > 0) {
          get().playStation(preselectedStations[0]);
        }
      },
    }),
    {
      name: 'echora_radio_playback_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        screensaverTheme: state.screensaverTheme,
        currentStation: state.currentStation,
        userPreferences: state.userPreferences,
      }),
    }
  )
);
