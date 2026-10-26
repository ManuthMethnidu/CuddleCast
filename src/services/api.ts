import capturedData from '../mocks/capturedPayloads.json';
import { BillboardData, CarouselRail, CastMember, Episode, MediaItem } from '../types/schema';
import { authStorage } from './supabase';

const TMDB_API_KEY = (import.meta.env?.VITE_TMDB_API_KEY as string) || '';
const DATA_MODE = (import.meta.env?.VITE_DATA_MODE as string) || 'auto';

const isLiveTMDB = Boolean(
  (DATA_MODE === 'live' || DATA_MODE === 'auto') &&
  TMDB_API_KEY &&
  TMDB_API_KEY !== 'your_tmdb_api_key_here' &&
  !TMDB_API_KEY.includes('your_tmdb')
);

export const DEFAULT_STREAM = (import.meta.env?.VITE_DEFAULT_HLS_STREAM as string) || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
export const DEFAULT_TRAILER = (import.meta.env?.VITE_FALLBACK_TRAILER_HLS as string) || 'https://test-streams.mux.dev/pts_shift/master.m3u8';

class ApiService {
  async getBillboard(): Promise<BillboardData[]> {
    return (capturedData.billboard as BillboardData[]).map(item => ({
      ...item,
      streamUrl: DEFAULT_STREAM,
      trailerUrl: DEFAULT_TRAILER,
    }));
  }

  async getRails(): Promise<CarouselRail[]> {
    // Merge live local storage progress into Continue Watching rail
    const progressList = authStorage.getProgressList();
    const allItems = capturedData.allItems as MediaItem[];

    const continueWatchingItems = progressList.map(prog => {
      const match = allItems.find(i => i.id === prog.media_id) || allItems[0];
      return {
        ...match,
        progress_seconds: prog.progress_seconds,
        total_seconds: prog.total_seconds,
        last_watched: prog.last_watched,
      };
    });

    const activeContinueWatching = continueWatchingItems.length > 0 
      ? continueWatchingItems 
      : (capturedData.continueWatching as (MediaItem & { progress_seconds: number; total_seconds: number })[]);

    const rails = capturedData.rails.map(rail => {
      if (rail.id === 'continue-watching') {
        return {
          ...rail,
          items: activeContinueWatching,
        };
      }
      return rail;
    });

    return rails as CarouselRail[];
  }

  async getMediaDetails(id: number): Promise<MediaItem | null> {
    const allItems = capturedData.allItems as MediaItem[];
    const match = allItems.find(i => i.id === id);
    if (match) return match;

    // Check billboard
    const billboard = capturedData.billboard as MediaItem[];
    const bMatch = billboard.find(i => i.id === id);
    if (bMatch) return bMatch;

    return allItems[0] || null;
  }

  async getEpisodes(_mediaId: number, _seasonNumber: number = 1): Promise<Episode[]> {
    return capturedData.episodes as Episode[];
  }

  async getCast(_mediaId: number): Promise<CastMember[]> {
    return capturedData.cast as CastMember[];
  }

  async searchMedia(query: string): Promise<MediaItem[]> {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    const allItems = capturedData.allItems as MediaItem[];
    return allItems.filter(item =>
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.overview && item.overview.toLowerCase().includes(q))
    );
  }

  async getWatchlistItems(): Promise<MediaItem[]> {
    const watchlistIds = authStorage.getWatchlist();
    const allItems = capturedData.allItems as MediaItem[];
    return allItems.filter(i => watchlistIds.includes(i.id));
  }
}

export const api = new ApiService();
export const isUsingLiveTMDB = isLiveTMDB;
