import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type PerformanceMode = 'low' | 'medium' | 'high';
export type AccountStatus = 'online' | 'away' | 'busy';
export type AccountTheme = 'light' | 'dark' | 'system';

export const DEFAULT_NAV_ITEMS = [
  'all',
  'sports',
  'manga',
  'anime',
  'live-tv',
  'radio',
  'discover',
  'library',
];

export interface UserSettingsState {
  // System Performance Mode (low = potato/max performance, medium = balanced, high = cinematic)
  performanceMode: PerformanceMode;

  // Navigation Bar Customization
  enabledNavItems: string[];

  // User Profile Status & Theme
  userStatus: AccountStatus;
  themeMode: AccountTheme;

  // Browsing Experience
  billboard: boolean;
  ratings: boolean;
  wideContinue: boolean;
  criticReviews: boolean;

  // Video & Streaming Engine
  autoplayNext: boolean;
  skipIntro: boolean;
  soundBoost: boolean;
  defaultQuality: 'auto' | '1080p' | '720p' | '4k';
  defaultProvider: string;
  preferredAudioLanguage: string;
  preferredSubtitleLanguage: string;

  // Actions
  setPerformanceMode: (mode: PerformanceMode) => void;
  setEnabledNavItems: (items: string[]) => void;
  toggleNavItem: (id: string) => void;
  setUserStatus: (status: AccountStatus) => void;
  setThemeMode: (theme: AccountTheme) => void;
  setBillboard: (enabled: boolean) => void;
  setRatings: (enabled: boolean) => void;
  setWideContinue: (enabled: boolean) => void;
  setCriticReviews: (enabled: boolean) => void;
  setAutoplayNext: (enabled: boolean) => void;
  setSkipIntro: (enabled: boolean) => void;
  setSoundBoost: (enabled: boolean) => void;
  setDefaultQuality: (quality: 'auto' | '1080p' | '720p' | '4k') => void;
  setDefaultProvider: (providerId: string) => void;
  setPreferredAudioLanguage: (lang: string) => void;
  setPreferredSubtitleLanguage: (lang: string) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS = {
  performanceMode: 'high' as PerformanceMode,
  enabledNavItems: DEFAULT_NAV_ITEMS,
  userStatus: 'online' as AccountStatus,
  themeMode: 'dark' as AccountTheme,
  billboard: true,
  ratings: true,
  wideContinue: true,
  criticReviews: true,
  autoplayNext: true,
  skipIntro: true,
  soundBoost: false,
  defaultQuality: 'auto' as const,
  defaultProvider: 'vidlink',
  preferredAudioLanguage: 'en',
  preferredSubtitleLanguage: 'en',
};

export const useSettingsStore = create<UserSettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      setPerformanceMode: (performanceMode) => {
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-performance', performanceMode);
        }
        set({ performanceMode });
      },
      setEnabledNavItems: (enabledNavItems) => set({ enabledNavItems }),
      toggleNavItem: (id: string) => {
        const current = get().enabledNavItems || DEFAULT_NAV_ITEMS;
        if (current.includes(id)) {
          // Keep at least 1 nav item
          if (current.length > 1) {
            set({ enabledNavItems: current.filter((item) => item !== id) });
          }
        } else {
          set({ enabledNavItems: [...current, id] });
        }
      },
      setUserStatus: (userStatus) => set({ userStatus }),
      setThemeMode: (themeMode) => {
        if (typeof document !== 'undefined') {
          if (themeMode === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          } else if (themeMode === 'light') {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
          } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', prefersDark);
            document.documentElement.classList.toggle('light', !prefersDark);
          }
        }
        set({ themeMode });
      },
      setBillboard: (billboard) => set({ billboard }),
      setRatings: (ratings) => set({ ratings }),
      setWideContinue: (wideContinue) => set({ wideContinue }),
      setCriticReviews: (criticReviews) => set({ criticReviews }),
      setAutoplayNext: (autoplayNext) => set({ autoplayNext }),
      setSkipIntro: (skipIntro) => set({ skipIntro }),
      setSoundBoost: (soundBoost) => set({ soundBoost }),
      setDefaultQuality: (defaultQuality) => set({ defaultQuality }),
      setDefaultProvider: (defaultProvider) => set({ defaultProvider }),
      setPreferredAudioLanguage: (preferredAudioLanguage) =>
        set({ preferredAudioLanguage }),
      setPreferredSubtitleLanguage: (preferredSubtitleLanguage) =>
        set({ preferredSubtitleLanguage }),
      resetToDefaults: () => {
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-performance', DEFAULT_SETTINGS.performanceMode);
        }
        set(DEFAULT_SETTINGS);
      },
    }),
    {
      name: 'echora_persistent_settings_v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
