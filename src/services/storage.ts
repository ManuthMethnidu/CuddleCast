import { MediaItem, UserProfile, UserWatchProgress } from '../types/schema';

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'echora_current_user_id',
  PROFILES: 'echora_profiles',
  ACTIVE_PROFILE: 'echora_active_profile',
  WATCHLIST: 'echora_watchlist',
  WATCHLIST_MEDIA: 'echora_watchlist_media',
  PROGRESS: 'echora_progress',
  LIKES: 'echora_likes',
  LIKES_MEDIA: 'echora_likes_media',
  CUSTOM_TV_CHANNELS: 'echora_custom_tv_channels',
  TV_FAVORITES: 'echora_tv_favorites',
  RADIO_FAVORITES: 'echora_radio_favorites',
  RADIO_FAVORITE_OBJECTS: 'echora_radio_favorite_objects',
  RADIO_RECENT: 'echora_radio_recent',
  RADIO_PREFERENCES: 'echora_radio_preferences',
};

const LEGACY_STORAGE_KEYS = {
  PROFILES: 'cuddlecast_profiles',
  ACTIVE_PROFILE: 'cuddlecast_active_profile',
  WATCHLIST: 'cuddlecast_watchlist',
  PROGRESS: 'cuddlecast_progress',
  LIKES: 'cuddlecast_likes',
  CUSTOM_TV_CHANNELS: 'cuddlecast_custom_tv_channels',
  TV_FAVORITES: 'cuddlecast_tv_favorites',
  RADIO_FAVORITES: 'radio_atlas_favorites',
  RADIO_RECENT: 'radio_atlas_recent',
};

export const AVATAR_PRESETS = [
  {
    id: 'av-1',
    label: 'Cyan Hero',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'av-2',
    label: 'Cinema Director',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'av-3',
    label: 'Kids & Family',
    url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'av-4',
    label: 'Cyberpunk Neon',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'av-5',
    label: 'Anime & Fantasy',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'av-6',
    label: 'Space Explorer',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'av-7',
    label: 'Classic Noir',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'av-8',
    label: 'Popcorn Cinephile',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  },
];

const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'prof-1',
    name: 'Echora Member',
    avatar_url: AVATAR_PRESETS[0].url,
    is_kids: false,
  },
  {
    id: 'prof-2',
    name: 'Guest Watcher',
    avatar_url: AVATAR_PRESETS[1].url,
    is_kids: false,
  },
  {
    id: 'prof-3',
    name: 'Kids Club',
    avatar_url: AVATAR_PRESETS[2].url,
    is_kids: true,
  },
];

const DEFAULT_TV_FAVORITES = [
  'yt-sky-news',
  'bloomberg',
  'yt-abc-news',
  'yt-playlist-skynews',
  'naruto',
];

class StorageService {
  private activeUserId: string = 'guest';
  private listeners: Set<() => void> = new Set();

  constructor() {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
        if (saved) {
          this.activeUserId = saved;
        }
      }
    } catch {}
  }

  // Active User Scope Management
  getUserId(): string {
    return this.activeUserId;
  }

  setUserId(userId?: string | null): void {
    const nextId = userId && userId.trim() ? userId.trim() : 'guest';
    if (this.activeUserId === nextId) return;
    this.activeUserId = nextId;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, nextId);
      }
    } catch {}
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Storage notify error:', err);
      }
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('echora:storage-updated', {
          detail: { userId: this.activeUserId },
        })
      );
    }
  }

  private getKey(base: string, overrideUserId?: string): string {
    const uid = overrideUserId || this.activeUserId || 'guest';
    return `${base}_${uid}`;
  }

  // --- PROFILES (Preserved for compatibility) ---
  getProfiles(): UserProfile[] {
    const raw =
      localStorage.getItem(STORAGE_KEYS.PROFILES) ||
      localStorage.getItem(LEGACY_STORAGE_KEYS.PROFILES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(DEFAULT_PROFILES));
      return DEFAULT_PROFILES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_PROFILES;
    }
  }

  saveProfile(profile: UserProfile): void {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      profiles[idx] = profile;
    } else {
      profiles.push(profile);
    }
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  }

  getActiveProfile(): UserProfile {
    const raw =
      localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE) ||
      localStorage.getItem(LEGACY_STORAGE_KEYS.ACTIVE_PROFILE);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    const defaultProfile = this.getProfiles()[0];
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, JSON.stringify(defaultProfile));
    return defaultProfile;
  }

  setActiveProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, JSON.stringify(profile));
  }

  deleteProfile(id: string): UserProfile[] {
    const profiles = this.getProfiles().filter((p) => p.id !== id);
    if (profiles.length === 0) return this.getProfiles();
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

    const active = this.getActiveProfile();
    if (active.id === id) {
      this.setActiveProfile(profiles[0]);
    }
    return profiles;
  }

  syncClerkProfile(name?: string | null, avatarUrl?: string | null): UserProfile {
    const active = this.getActiveProfile();
    const updated: UserProfile = {
      ...active,
      name: name?.trim() || active.name,
      avatar_url: avatarUrl || active.avatar_url,
    };
    this.saveProfile(updated);
    this.setActiveProfile(updated);
    return updated;
  }

  // --- WATCHLIST (User-Scoped) ---
  getWatchlist(userId?: string): number[] {
    const uid = userId || this.activeUserId || 'guest';
    const key = this.getKey(STORAGE_KEYS.WATCHLIST, uid);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    // Guest fallback: legacy storage or initial demo IDs
    if (uid === 'guest') {
      const legacy =
        localStorage.getItem(STORAGE_KEYS.WATCHLIST) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS.WATCHLIST);
      if (legacy) {
        try {
          return JSON.parse(legacy);
        } catch {}
      }
      return [96677, 1400940];
    }
    return [];
  }

  getStoredWatchlistMedia(userId?: string): MediaItem[] {
    const uid = userId || this.activeUserId || 'guest';
    const key = this.getKey(STORAGE_KEYS.WATCHLIST_MEDIA, uid);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    return [];
  }

  toggleWatchlist(mediaId: number, mediaItem?: MediaItem, userId?: string): boolean {
    const uid = userId || this.activeUserId || 'guest';
    const list = this.getWatchlist(uid);
    const mediaList = this.getStoredWatchlistMedia(uid);

    const idx = list.indexOf(mediaId);
    let inList = false;

    if (idx >= 0) {
      list.splice(idx, 1);
      const mediaIdx = mediaList.findIndex((m) => m.id === mediaId);
      if (mediaIdx >= 0) mediaList.splice(mediaIdx, 1);
      inList = false;
    } else {
      list.unshift(mediaId);
      if (mediaItem) {
        const mediaIdx = mediaList.findIndex((m) => m.id === mediaId);
        if (mediaIdx >= 0) {
          mediaList[mediaIdx] = mediaItem;
        } else {
          mediaList.unshift(mediaItem);
        }
      }
      inList = true;
    }

    const key = this.getKey(STORAGE_KEYS.WATCHLIST, uid);
    localStorage.setItem(key, JSON.stringify(list));

    const mediaKey = this.getKey(STORAGE_KEYS.WATCHLIST_MEDIA, uid);
    localStorage.setItem(mediaKey, JSON.stringify(mediaList));

    this.notify();
    return inList;
  }

  isInWatchlist(mediaId: number, userId?: string): boolean {
    return this.getWatchlist(userId).includes(mediaId);
  }

  clearWatchlist(userId?: string): void {
    const uid = userId || this.activeUserId || 'guest';
    const key = this.getKey(STORAGE_KEYS.WATCHLIST, uid);
    localStorage.removeItem(key);

    const mediaKey = this.getKey(STORAGE_KEYS.WATCHLIST_MEDIA, uid);
    localStorage.removeItem(mediaKey);

    if (uid === 'guest') {
      localStorage.removeItem(STORAGE_KEYS.WATCHLIST);
      localStorage.removeItem(LEGACY_STORAGE_KEYS.WATCHLIST);
    }
    this.notify();
  }

  // --- LIKES & FAVORITES (User-Scoped) ---
  getLikes(userId?: string): number[] {
    const uid = userId || this.activeUserId || 'guest';
    const key = this.getKey(STORAGE_KEYS.LIKES, uid);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    if (uid === 'guest') {
      const legacy =
        localStorage.getItem(STORAGE_KEYS.LIKES) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS.LIKES);
      if (legacy) {
        try {
          return JSON.parse(legacy);
        } catch {}
      }
    }
    return [];
  }

  getStoredLikesMedia(userId?: string): MediaItem[] {
    const uid = userId || this.activeUserId || 'guest';
    const key = this.getKey(STORAGE_KEYS.LIKES_MEDIA, uid);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    return [];
  }

  toggleLike(mediaId: number, mediaItem?: MediaItem, userId?: string): boolean {
    const uid = userId || this.activeUserId || 'guest';
    const list = this.getLikes(uid);
    const mediaList = this.getStoredLikesMedia(uid);

    const idx = list.indexOf(mediaId);
    let isLiked = false;

    if (idx >= 0) {
      list.splice(idx, 1);
      const mIdx = mediaList.findIndex((m) => m.id === mediaId);
      if (mIdx >= 0) mediaList.splice(mIdx, 1);
      isLiked = false;
    } else {
      list.unshift(mediaId);
      if (mediaItem) {
        const mIdx = mediaList.findIndex((m) => m.id === mediaId);
        if (mIdx >= 0) {
          mediaList[mIdx] = mediaItem;
        } else {
          mediaList.unshift(mediaItem);
        }
      }
      isLiked = true;
    }

    const key = this.getKey(STORAGE_KEYS.LIKES, uid);
    localStorage.setItem(key, JSON.stringify(list));

    const mediaKey = this.getKey(STORAGE_KEYS.LIKES_MEDIA, uid);
    localStorage.setItem(mediaKey, JSON.stringify(mediaList));

    this.notify();
    return isLiked;
  }

  isLiked(mediaId: number, userId?: string): boolean {
    return this.getLikes(userId).includes(mediaId);
  }

  // --- CONTINUE WATCHING & PLAYBACK PROGRESS (User-Scoped) ---
  getProgressList(userId?: string): UserWatchProgress[] {
    const uid = userId || this.activeUserId || 'guest';
    const key = this.getKey(STORAGE_KEYS.PROGRESS, uid);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    if (uid === 'guest') {
      const legacy =
        localStorage.getItem(STORAGE_KEYS.PROGRESS) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS.PROGRESS);
      if (legacy) {
        try {
          return JSON.parse(legacy);
        } catch {}
      }
    }
    return [];
  }

  saveProgress(
    mediaId: number,
    progressSeconds: number,
    totalSeconds: number,
    mediaItem?: MediaItem,
    userId?: string
  ): void {
    const uid = userId || this.activeUserId || 'guest';
    const list = this.getProgressList(uid);
    const existingIdx = list.findIndex((p) => p.media_id === mediaId);

    const prevItem = existingIdx >= 0 ? list[existingIdx] : null;
    const finalMediaItem = mediaItem || prevItem?.media_item;

    const item: UserWatchProgress = {
      id: mediaId,
      media_id: mediaId,
      progress_seconds: Math.floor(progressSeconds),
      total_seconds: Math.max(1, Math.floor(totalSeconds)),
      last_watched: new Date().toISOString(),
      ...(finalMediaItem ? { media_item: finalMediaItem } : {}),
    };

    if (existingIdx >= 0) {
      list[existingIdx] = item;
    } else {
      list.unshift(item);
    }

    const key = this.getKey(STORAGE_KEYS.PROGRESS, uid);
    localStorage.setItem(key, JSON.stringify(list));
    this.notify();
  }

  updateWatchHeartbeat(mediaId: number, mediaItem?: MediaItem, userId?: string): void {
    const uid = userId || this.activeUserId || 'guest';
    const existing = this.getProgress(mediaId, uid);
    const curProg = existing ? existing.progress_seconds + 10 : 10;
    const total = existing ? existing.total_seconds : 7200;
    this.saveProgress(mediaId, curProg, total, mediaItem || existing?.media_item, uid);
  }

  getProgress(mediaId: number, userId?: string): UserWatchProgress | null {
    const list = this.getProgressList(userId);
    return list.find((p) => p.media_id === mediaId) || null;
  }

  removeProgress(mediaId: number, userId?: string): void {
    const uid = userId || this.activeUserId || 'guest';
    const list = this.getProgressList(uid).filter((p) => p.media_id !== mediaId);
    const key = this.getKey(STORAGE_KEYS.PROGRESS, uid);
    localStorage.setItem(key, JSON.stringify(list));
    this.notify();
  }

  clearProgress(userId?: string): void {
    const uid = userId || this.activeUserId || 'guest';
    const key = this.getKey(STORAGE_KEYS.PROGRESS, uid);
    localStorage.removeItem(key);
    if (uid === 'guest') {
      localStorage.removeItem(STORAGE_KEYS.PROGRESS);
      localStorage.removeItem(LEGACY_STORAGE_KEYS.PROGRESS);
    }
    this.notify();
  }

  // --- YOUTUBE PLAYLISTS & CUSTOM CHANNELS (User-Scoped) ---
  getCustomTvChannels(userId?: string): any[] {
    const uid = userId || this.activeUserId || 'guest';
    const key = this.getKey(STORAGE_KEYS.CUSTOM_TV_CHANNELS, uid);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    if (uid === 'guest') {
      const legacy =
        localStorage.getItem(STORAGE_KEYS.CUSTOM_TV_CHANNELS) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS.CUSTOM_TV_CHANNELS);
      if (legacy) {
        try {
          return JSON.parse(legacy);
        } catch {}
      }
    }
    return [];
  }

  saveCustomTvChannels(channels: any[], userId?: string): void {
    const uid = userId || this.activeUserId || 'guest';
    const key = this.getKey(STORAGE_KEYS.CUSTOM_TV_CHANNELS, uid);
    localStorage.setItem(key, JSON.stringify(channels));
    this.notify();
  }

  // --- TV & YOUTUBE FAVORITES (User-Scoped) ---
  getTvFavorites(userId?: string): string[] {
    const uid = userId || this.activeUserId || 'guest';
    const key = this.getKey(STORAGE_KEYS.TV_FAVORITES, uid);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return DEFAULT_TV_FAVORITES;
      }
    }
    if (uid === 'guest') {
      const legacy =
        localStorage.getItem(STORAGE_KEYS.TV_FAVORITES) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS.TV_FAVORITES);
      if (legacy) {
        try {
          return JSON.parse(legacy);
        } catch {}
      }
    }
    return DEFAULT_TV_FAVORITES;
  }

  saveTvFavorites(favorites: string[], userId?: string): void {
    const uid = userId || this.activeUserId || 'guest';
    const key = this.getKey(STORAGE_KEYS.TV_FAVORITES, uid);
    localStorage.setItem(key, JSON.stringify(favorites));
    this.notify();
  }

  toggleTvFavorite(channelId: string, userId?: string): string[] {
    const current = this.getTvFavorites(userId);
    const updated = current.includes(channelId)
      ? current.filter((id) => id !== channelId)
      : [...current, channelId];
    this.saveTvFavorites(updated, userId);
    return updated;
  }

  // --- RADIO FAVORITES & RECENT (User-Scoped) ---
  getRadioFavorites(userId?: string): string[] {
    const uid = userId || this.activeUserId || 'guest';
    const key = this.getKey(STORAGE_KEYS.RADIO_FAVORITES, uid);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    // Check legacy storage
    const legacy =
      localStorage.getItem(LEGACY_STORAGE_KEYS.RADIO_FAVORITES) ||
      localStorage.getItem('radio_atlas_favorites');
    if (legacy) {
      try {
        return JSON.parse(legacy);
      } catch {}
    }
    return ['lofi-girl', 'nightride-fm'];
  }

  saveRadioFavorites(favorites: string[], userId?: string): void {
    const uid = userId || this.activeUserId || 'guest';
    const key = this.getKey(STORAGE_KEYS.RADIO_FAVORITES, uid);
    localStorage.setItem(key, JSON.stringify(favorites));
    this.notify();
  }

  getRadioFavoriteStations(userId?: string): any[] {
    const uid = userId || this.activeUserId || 'guest';
    const key = this.getKey(STORAGE_KEYS.RADIO_FAVORITE_OBJECTS, uid);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return [];
  }

  saveRadioFavoriteStations(stations: any[], userId?: string): void {
    const uid = userId || this.activeUserId || 'guest';
    const key = this.getKey(STORAGE_KEYS.RADIO_FAVORITE_OBJECTS, uid);
    localStorage.setItem(key, JSON.stringify(stations));
    this.notify();
  }

  toggleRadioFavoriteStation(station: any, userId?: string): boolean {
    const uid = userId || this.activeUserId || 'guest';
    const favIds = this.getRadioFavorites(uid);
    const favStations = this.getRadioFavoriteStations(uid);
    const stationId = station.stationuuid || station.id;
    const exists = favIds.includes(stationId);

    if (exists) {
      const updatedIds = favIds.filter((id) => id !== stationId);
      const updatedStations = favStations.filter(
        (s) => (s.stationuuid || s.id) !== stationId
      );
      this.saveRadioFavorites(updatedIds, uid);
      this.saveRadioFavoriteStations(updatedStations, uid);
      return false;
    } else {
      const updatedIds = [...favIds, stationId];
      const updatedStations = [station, ...favStations];
      this.saveRadioFavorites(updatedIds, uid);
      this.saveRadioFavoriteStations(updatedStations, uid);
      return true;
    }
  }

  getRadioRecent(userId?: string): string[] {
    const uid = userId || this.activeUserId || 'guest';
    const key = this.getKey(STORAGE_KEYS.RADIO_RECENT, uid);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    const legacy =
      localStorage.getItem(LEGACY_STORAGE_KEYS.RADIO_RECENT) ||
      localStorage.getItem('radio_atlas_recent');
    if (legacy) {
      try {
        return JSON.parse(legacy);
      } catch {}
    }
    return [];
  }

  saveRadioRecent(recent: string[], userId?: string): void {
    const uid = userId || this.activeUserId || 'guest';
    const key = this.getKey(STORAGE_KEYS.RADIO_RECENT, uid);
    localStorage.setItem(key, JSON.stringify(recent));
    this.notify();
  }

  getRadioOnboarding(userId?: string): {
    completed: boolean;
    countryCode?: string;
    countryName?: string;
    favoriteGenres?: string[];
  } {
    const uid = userId || this.activeUserId || 'guest';
    const raw = localStorage.getItem(`echora_radio_onboarding_${uid}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return { completed: false };
  }

  saveRadioOnboarding(
    data: {
      completed?: boolean;
      countryCode?: string;
      countryName?: string;
      favoriteGenres?: string[];
      isOnboardingCompleted?: boolean;
    },
    userId?: string
  ): void {
    const uid = userId || this.activeUserId || 'guest';
    const existing = this.getRadioOnboarding(uid);
    const updated = {
      ...existing,
      ...data,
      completed: data.completed ?? data.isOnboardingCompleted ?? true,
    };
    localStorage.setItem(`echora_radio_onboarding_${uid}`, JSON.stringify(updated));
    this.notify();
  }

  // --- UNIFIED RADIO USER PREFERENCES ---
  getRadioPreferences(userId?: string): RadioPreferencesPayload {
    const uid = userId || this.activeUserId || 'guest';
    const key = this.getKey(STORAGE_KEYS.RADIO_PREFERENCES, uid);
    const raw = localStorage.getItem(key);
    let parsed: Partial<RadioPreferencesPayload> = {};
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch {}
    }

    const onboarding = this.getRadioOnboarding(uid);
    const favoriteStations = this.getRadioFavoriteStations(uid);
    const recentStations = this.getRadioRecent(uid);

    return {
      countryCode: parsed.countryCode || onboarding.countryCode || 'US',
      countryName: parsed.countryName || onboarding.countryName || 'United States',
      favoriteGenres:
        parsed.favoriteGenres || onboarding.favoriteGenres || ['lofi', 'chillout', 'electronic'],
      isOnboardingCompleted: parsed.isOnboardingCompleted ?? onboarding.completed ?? false,
      volume: typeof parsed.volume === 'number' ? parsed.volume : 0.85,
      isMuted: parsed.isMuted ?? false,
      screensaverTheme: parsed.screensaverTheme || 'spectrum-bars',
      lastStation: parsed.lastStation || null,
      favoriteStations: parsed.favoriteStations || favoriteStations || [],
      recentStations: parsed.recentStations || recentStations || [],
    };
  }

  saveRadioPreferences(data: Partial<RadioPreferencesPayload>, userId?: string): void {
    const uid = userId || this.activeUserId || 'guest';
    const current = this.getRadioPreferences(uid);
    const updated: RadioPreferencesPayload = {
      ...current,
      ...data,
      screensaverTheme: data.screensaverTheme || current.screensaverTheme || 'microslats',
    };
    const key = this.getKey(STORAGE_KEYS.RADIO_PREFERENCES, uid);
    localStorage.setItem(key, JSON.stringify(updated));

    if (
      data.countryCode ||
      data.countryName ||
      data.favoriteGenres ||
      typeof data.isOnboardingCompleted === 'boolean'
    ) {
      this.saveRadioOnboarding(
        {
          countryCode: updated.countryCode,
          countryName: updated.countryName,
          favoriteGenres: updated.favoriteGenres,
          completed: updated.isOnboardingCompleted,
        },
        uid
      );
    }
    if (data.favoriteStations) {
      this.saveRadioFavoriteStations(data.favoriteStations, uid);
    }
    if (data.recentStations) {
      this.saveRadioRecent(data.recentStations, uid);
    }

    this.notify();
  }
}

export interface RadioPreferencesPayload {
  countryCode: string;
  countryName: string;
  favoriteGenres: string[];
  isOnboardingCompleted: boolean;
  volume: number;
  isMuted: boolean;
  screensaverTheme: string;
  lastStation?: any;
  favoriteStations: any[];
  recentStations: string[];
}

export const authStorage = new StorageService();
