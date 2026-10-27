import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AccentColor } from '../context/AccentContext';

export interface UserSettingsState {
  // Appearance & Theme
  accent: AccentColor;
  ambientLighting: boolean;

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
  setAccent: (accent: AccentColor) => void;
  setAmbientLighting: (enabled: boolean) => void;
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
  accent: 'blue' as AccentColor,
  ambientLighting: true,
  billboard: true,
  ratings: true,
  wideContinue: true,
  criticReviews: true,
  autoplayNext: true,
  skipIntro: true,
  soundBoost: false,
  defaultQuality: 'auto' as const,
  defaultProvider: 'vidfast',
  preferredAudioLanguage: 'en',
  preferredSubtitleLanguage: 'en',
};

export const useSettingsStore = create<UserSettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setAccent: (accent) => set({ accent }),
      setAmbientLighting: (ambientLighting) => set({ ambientLighting }),
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
      resetToDefaults: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'echora_persistent_settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
