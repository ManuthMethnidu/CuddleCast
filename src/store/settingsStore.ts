import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type PerformanceMode = 'low' | 'medium' | 'high';

export interface UserSettingsState {
  // System Performance Mode (low = potato/max performance, medium = balanced, high = cinematic)
  performanceMode: PerformanceMode;

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
    (set) => ({
      ...DEFAULT_SETTINGS,

      setPerformanceMode: (performanceMode) => {
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-performance', performanceMode);
        }
        set({ performanceMode });
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
