import capturedData from '../mocks/capturedPayloads.json';
import { BillboardData, CarouselRail, CastMember, Episode, MediaItem } from '../types/schema';
import { authStorage } from './storage';

const DATA_MODE = (import.meta.env?.VITE_DATA_MODE as string) || 'auto';

export const DEFAULT_STREAM =
  (import.meta.env?.VITE_DEFAULT_HLS_STREAM as string) ||
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
export const DEFAULT_TRAILER =
  (import.meta.env?.VITE_FALLBACK_TRAILER_HLS as string) ||
  'https://test-streams.mux.dev/pts_shift/master.m3u8';

/**
 * Secure Serverless Proxy Requester
 * Requests are routed through /api/tmdb (Vercel Edge Function or Vite dev proxy),
 * where the private TMDB_API_KEY is attached securely on the server side.
 * The browser NEVER sees or receives the secret API key.
 */
async function fetchFromTMDB(
  path: string,
  params: Record<string, string | number | boolean> = {}
): Promise<any> {
  const query = new URLSearchParams();
  query.set('path', path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) {
      query.set(k, String(v));
    }
  }

  const res = await fetch(`/api/tmdb?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`TMDB Proxy HTTP ${res.status}`);
  }
  return await res.json();
}

class ApiService {
  async getBillboard(): Promise<BillboardData[]> {
    if (DATA_MODE !== 'mock') {
      try {
        const data = await fetchFromTMDB('/trending/all/day');
        if (data.results && data.results.length > 0) {
          return data.results.slice(0, 5).map((r: any, idx: number) => ({
            id: r.id,
            title: r.title || r.name || 'Featured Title',
            name: r.name || r.title || 'Featured Title',
            overview: r.overview || '',
            poster_path: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : '',
            backdrop_path: r.backdrop_path ? `https://image.tmdb.org/t/p/original${r.backdrop_path}` : '',
            media_type: (r.media_type === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv',
            release_date: r.release_date || r.first_air_date || '',
            vote_average: r.vote_average || 0,
            vote_count: r.vote_count || 0,
            popularity: r.popularity || 0,
            genre_ids: r.genre_ids || [],
            adult: Boolean(r.adult),
            rank: idx + 1,
            streamUrl: DEFAULT_STREAM,
            trailerUrl: DEFAULT_TRAILER,
          }));
        }
      } catch (err) {
        console.warn('Live billboard fetch fallback:', err);
      }
    }

    return (capturedData.billboard as BillboardData[]).map((item) => ({
      ...item,
      streamUrl: DEFAULT_STREAM,
      trailerUrl: DEFAULT_TRAILER,
    }));
  }

  async getRails(): Promise<CarouselRail[]> {
    const progressList = authStorage.getProgressList();
    const allItems = capturedData.allItems as MediaItem[];

    const continueWatchingItems = progressList.map((prog) => {
      const match = allItems.find((i) => i.id === prog.media_id) || allItems[0];
      return {
        ...match,
        progress_seconds: prog.progress_seconds,
        total_seconds: prog.total_seconds,
        last_watched: prog.last_watched,
      };
    });

    const activeContinueWatching =
      continueWatchingItems.length > 0
        ? continueWatchingItems
        : (capturedData.continueWatching as (MediaItem & {
            progress_seconds: number;
            total_seconds: number;
          })[]);

    const rails = capturedData.rails.map((rail) => {
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

  async getMediaDetails(id: number, mediaType?: 'movie' | 'tv'): Promise<MediaItem | null> {
    if (DATA_MODE !== 'mock') {
      try {
        const type = mediaType || 'movie';
        const r = await fetchFromTMDB(`/${type}/${id}`);
        return {
          id: r.id,
          title: r.title || r.name || 'Untitled',
          name: r.name || r.title || 'Untitled',
          original_title: r.original_title || r.original_name,
          overview: r.overview || '',
          poster_path: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : '',
          backdrop_path: r.backdrop_path ? `https://image.tmdb.org/t/p/original${r.backdrop_path}` : '',
          media_type: (type === 'tv' || r.first_air_date ? 'tv' : 'movie') as 'movie' | 'tv',
          release_date: r.release_date || r.first_air_date || '',
          first_air_date: r.first_air_date,
          vote_average: r.vote_average || 0,
          vote_count: r.vote_count || 0,
          popularity: r.popularity || 0,
          genre_ids: r.genres ? r.genres.map((g: any) => g.id) : [],
          genres: r.genres ? r.genres.map((g: any) => g.name) : [],
          adult: Boolean(r.adult),
          streamUrl: DEFAULT_STREAM,
          trailerUrl: DEFAULT_TRAILER,
        };
      } catch (err) {
        console.warn('Live details fetch fallback:', err);
      }
    }

    const allItems = capturedData.allItems as MediaItem[];
    const match = allItems.find((i) => i.id === id);
    if (match) return match;

    const billboard = capturedData.billboard as MediaItem[];
    const bMatch = billboard.find((i) => i.id === id);
    if (bMatch) return bMatch;

    return allItems[0] || null;
  }

  async getEpisodes(mediaId: number, seasonNumber: number = 1): Promise<Episode[]> {
    if (DATA_MODE !== 'mock') {
      try {
        const data = await fetchFromTMDB(`/tv/${mediaId}/season/${seasonNumber}`);
        if (data.episodes && data.episodes.length > 0) {
          return data.episodes.map((ep: any) => ({
            id: ep.id,
            episode_number: ep.episode_number,
            season_number: ep.season_number,
            title: ep.name || `Episode ${ep.episode_number}`,
            overview: ep.overview || '',
            runtime: ep.runtime || 45,
            still_path: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : '',
            streamUrl: DEFAULT_STREAM,
          }));
        }
      } catch (err) {
        console.warn('Live episodes fetch fallback:', err);
      }
    }

    return capturedData.episodes as Episode[];
  }

  async getCast(mediaId: number, mediaType?: 'movie' | 'tv'): Promise<CastMember[]> {
    if (DATA_MODE !== 'mock') {
      try {
        const type = mediaType || 'movie';
        const data = await fetchFromTMDB(`/${type}/${mediaId}/credits`);
        if (data.cast && data.cast.length > 0) {
          return data.cast.slice(0, 15).map((c: any) => ({
            id: c.id,
            name: c.name,
            character: c.character || '',
            profile_path: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : '',
          }));
        }
      } catch (err) {
        console.warn('Live cast fetch fallback:', err);
      }
    }

    return capturedData.cast as CastMember[];
  }

  async searchMedia(query: string): Promise<MediaItem[]> {
    if (!query.trim()) return [];

    if (DATA_MODE !== 'mock') {
      try {
        const data = await fetchFromTMDB('/search/multi', {
          query: query.trim(),
          include_adult: false,
        });
        if (data.results && data.results.length > 0) {
          return data.results
            .filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv')
            .map((r: any) => ({
              id: r.id,
              title: r.title || r.name || 'Untitled',
              name: r.name || r.title || 'Untitled',
              original_title: r.original_title || r.original_name,
              overview: r.overview || '',
              poster_path: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : '',
              backdrop_path: r.backdrop_path ? `https://image.tmdb.org/t/p/original${r.backdrop_path}` : '',
              media_type: (r.media_type === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv',
              release_date: r.release_date || r.first_air_date || '',
              first_air_date: r.first_air_date,
              vote_average: r.vote_average || 0,
              vote_count: r.vote_count || 0,
              popularity: r.popularity || 0,
              genre_ids: r.genre_ids || [],
              adult: Boolean(r.adult),
              streamUrl: DEFAULT_STREAM,
              trailerUrl: DEFAULT_TRAILER,
            }));
        }
      } catch (err) {
        console.warn('Live search fallback to local dataset:', err);
      }
    }

    const q = query.toLowerCase().trim();
    const allItems = capturedData.allItems as MediaItem[];
    return allItems.filter(
      (item) =>
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.overview && item.overview.toLowerCase().includes(q))
    );
  }

  async getWatchlistItems(): Promise<MediaItem[]> {
    const watchlistIds = authStorage.getWatchlist();
    const allItems = capturedData.allItems as MediaItem[];
    return allItems.filter((i) => watchlistIds.includes(i.id));
  }

  async getAllMedia(): Promise<MediaItem[]> {
    return (capturedData.allItems as MediaItem[]) || [];
  }
}

export const api = new ApiService();
export const isUsingLiveTMDB = true;
