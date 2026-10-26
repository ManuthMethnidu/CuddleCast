import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, UserWatchProgress } from '../types/schema';

const SUPABASE_URL = (import.meta.env?.VITE_SUPABASE_URL as string) || '';
const SUPABASE_KEY = (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) || '';

const isLiveSupabase = Boolean(
  SUPABASE_URL &&
  SUPABASE_URL !== 'your_supabase_project_url_here' &&
  !SUPABASE_URL.includes('your_supabase') &&
  SUPABASE_KEY &&
  SUPABASE_KEY !== 'your_supabase_anon_key_here'
);

export const supabase: SupabaseClient | null = isLiveSupabase
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

const STORAGE_KEYS = {
  PROFILES: 'cuddlecast_profiles',
  ACTIVE_PROFILE: 'cuddlecast_active_profile',
  WATCHLIST: 'cuddlecast_watchlist',
  PROGRESS: 'cuddlecast_progress',
  LIKES: 'cuddlecast_likes',
};

const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'prof-1',
    name: 'CuddleCast Member',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    is_kids: false,
  },
  {
    id: 'prof-2',
    name: 'Guest Watcher',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    is_kids: false,
  },
  {
    id: 'prof-3',
    name: 'Kids Club',
    avatar_url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=200&q=80',
    is_kids: true,
  },
];

class StorageService {
  private client = supabase;

  async initSync(): Promise<void> {
    if (!this.client) return;
    try {
      // Sync Profiles
      const { data: profs } = await this.client.from('profiles').select('*');
      if (profs && profs.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profs));
      }

      // Sync Active Profile Watchlist
      const active = this.getActiveProfile();
      if (active) {
        const { data: wl } = await this.client
          .from('watchlist')
          .select('media_id')
          .eq('profile_id', active.id);
        if (wl) {
          localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(wl.map(w => Number(w.media_id))));
        }

        const { data: lks } = await this.client
          .from('likes')
          .select('media_id')
          .eq('profile_id', active.id);
        if (lks) {
          localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(lks.map(l => Number(l.media_id))));
        }

        const { data: prog } = await this.client
          .from('watch_progress')
          .select('*')
          .eq('profile_id', active.id);
        if (prog) {
          localStorage.setItem(
            STORAGE_KEYS.PROGRESS,
            JSON.stringify(
              prog.map(p => ({
                id: Number(p.media_id),
                media_id: Number(p.media_id),
                progress_seconds: p.progress_seconds,
                total_seconds: p.total_seconds,
                last_watched: p.last_watched,
              }))
            )
          );
        }
      }
    } catch (err) {
      console.warn('Supabase sync warning:', err);
    }
  }

  getProfiles(): UserProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
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

  async saveProfile(profile: UserProfile): Promise<void> {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex(p => p.id === profile.id);
    if (idx >= 0) {
      profiles[idx] = profile;
    } else {
      profiles.push(profile);
    }
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

    if (this.client) {
      await this.client.from('profiles').upsert({
        id: profile.id,
        name: profile.name,
        avatar_url: profile.avatar_url,
        is_kids: profile.is_kids,
      });
    }
  }

  getActiveProfile(): UserProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE);
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
    // Re-sync for new active profile
    if (this.client) {
      this.initSync();
    }
  }

  getWatchlist(): number[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
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
    const active = this.getActiveProfile();

    if (idx >= 0) {
      list.splice(idx, 1);
      inList = false;
      if (this.client && active) {
        this.client
          .from('watchlist')
          .delete()
          .match({ profile_id: active.id, media_id: mediaId })
          .then();
      }
    } else {
      list.push(mediaId);
      inList = true;
      if (this.client && active) {
        this.client
          .from('watchlist')
          .insert({ profile_id: active.id, media_id: mediaId })
          .then();
      }
    }
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
    return inList;
  }

  isInWatchlist(mediaId: number): boolean {
    return this.getWatchlist().includes(mediaId);
  }

  getLikes(): number[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LIKES);
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
    const active = this.getActiveProfile();

    if (idx >= 0) {
      list.splice(idx, 1);
      if (this.client && active) {
        this.client
          .from('likes')
          .delete()
          .match({ profile_id: active.id, media_id: mediaId })
          .then();
      }
    } else {
      list.push(mediaId);
      isLiked = true;
      if (this.client && active) {
        this.client
          .from('likes')
          .insert({ profile_id: active.id, media_id: mediaId })
          .then();
      }
    }
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(list));
    return isLiked;
  }

  isLiked(mediaId: number): boolean {
    return this.getLikes().includes(mediaId);
  }

  getProgressList(): UserWatchProgress[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveProgress(mediaId: number, progressSeconds: number, totalSeconds: number): void {
    const list = this.getProgressList();
    const existing = list.findIndex(p => p.media_id === mediaId);
    const active = this.getActiveProfile();

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

    if (this.client && active) {
      this.client
        .from('watch_progress')
        .upsert(
          {
            profile_id: active.id,
            media_id: mediaId,
            progress_seconds: Math.floor(progressSeconds),
            total_seconds: Math.floor(totalSeconds),
            last_watched: new Date().toISOString(),
          },
          { onConflict: 'profile_id,media_id' }
        )
        .then();
    }
  }

  getProgress(mediaId: number): UserWatchProgress | null {
    const list = this.getProgressList();
    return list.find(p => p.media_id === mediaId) || null;
  }
}

export const authStorage = new StorageService();
export const isUsingLiveSupabase = isLiveSupabase;
