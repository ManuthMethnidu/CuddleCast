import { UserProfile, UserWatchProgress } from '../types/schema';

const STORAGE_KEYS = {
  PROFILES: 'echora_profiles',
  ACTIVE_PROFILE: 'echora_active_profile',
  WATCHLIST: 'echora_watchlist',
  PROGRESS: 'echora_progress',
  LIKES: 'echora_likes',
};

const LEGACY_STORAGE_KEYS = {
  PROFILES: 'cuddlecast_profiles',
  ACTIVE_PROFILE: 'cuddlecast_active_profile',
  WATCHLIST: 'cuddlecast_watchlist',
  PROGRESS: 'cuddlecast_progress',
  LIKES: 'cuddlecast_likes',
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

class StorageService {
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
    if (profiles.length === 0) return this.getProfiles(); // Protect against deleting the only profile
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

    // If active profile was deleted, switch to the first remaining profile
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

  getWatchlist(): number[] {
    const raw =
      localStorage.getItem(STORAGE_KEYS.WATCHLIST) ||
      localStorage.getItem(LEGACY_STORAGE_KEYS.WATCHLIST);
    if (!raw) return [96677, 1400940];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  toggleWatchlist(mediaId: number): boolean {
    const list = this.getWatchlist();
    const idx = list.indexOf(mediaId);
    let inList = false;

    if (idx >= 0) {
      list.splice(idx, 1);
      inList = false;
    } else {
      list.push(mediaId);
      inList = true;
    }
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
    return inList;
  }

  isInWatchlist(mediaId: number): boolean {
    return this.getWatchlist().includes(mediaId);
  }

  getLikes(): number[] {
    const raw =
      localStorage.getItem(STORAGE_KEYS.LIKES) ||
      localStorage.getItem(LEGACY_STORAGE_KEYS.LIKES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  toggleLike(mediaId: number): boolean {
    const list = this.getLikes();
    const idx = list.indexOf(mediaId);
    let isLiked = false;

    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(mediaId);
      isLiked = true;
    }
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(list));
    return isLiked;
  }

  isLiked(mediaId: number): boolean {
    return this.getLikes().includes(mediaId);
  }

  getProgressList(): UserWatchProgress[] {
    const raw =
      localStorage.getItem(STORAGE_KEYS.PROGRESS) ||
      localStorage.getItem(LEGACY_STORAGE_KEYS.PROGRESS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveProgress(mediaId: number, progressSeconds: number, totalSeconds: number): void {
    const list = this.getProgressList();
    const existing = list.findIndex((p) => p.media_id === mediaId);

    const item: UserWatchProgress = {
      id: mediaId,
      media_id: mediaId,
      progress_seconds: Math.floor(progressSeconds),
      total_seconds: Math.floor(totalSeconds),
      last_watched: new Date().toISOString(),
    };

    if (existing >= 0) {
      list[existing] = item;
    } else {
      list.unshift(item);
    }
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(list));
  }

  getProgress(mediaId: number): UserWatchProgress | null {
    const list = this.getProgressList();
    return list.find((p) => p.media_id === mediaId) || null;
  }

  clearWatchlist(): void {
    localStorage.removeItem(STORAGE_KEYS.WATCHLIST);
    localStorage.removeItem(LEGACY_STORAGE_KEYS.WATCHLIST);
  }

  clearProgress(): void {
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(LEGACY_STORAGE_KEYS.PROGRESS);
  }
}

export const authStorage = new StorageService();
