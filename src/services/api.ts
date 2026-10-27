import capturedData from '../mocks/capturedPayloads.json';
import { BillboardData, CarouselRail, CastMember, Episode, MediaItem } from '../types/schema';
import { authStorage } from './storage';

const DATA_MODE = (import.meta.env?.VITE_DATA_MODE as string) || 'auto';

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

/**
 * Clean static item from test Mux stream URLs
 */
function sanitizeStaticItem(item: any): MediaItem {
  const { streamUrl: _streamUrl, ...rest } = item;
  return rest as MediaItem;
}

/**
 * Universal mapper from raw TMDB response to normalized Echora MediaItem
 */
function mapTmdbToMediaItem(r: any, defaultType: 'movie' | 'tv' = 'movie'): MediaItem {
  const isTv =
    r.media_type === 'tv' ||
    (!r.media_type && (defaultType === 'tv' || Boolean(r.first_air_date)));
  const mediaType: 'movie' | 'tv' = isTv ? 'tv' : 'movie';
  const releaseDate = r.release_date || r.first_air_date || '';

  return {
    id: r.id,
    title: r.title || r.name || 'Untitled',
    name: r.name || r.title || 'Untitled',
    original_title: r.original_title || r.original_name,
    overview: r.overview || '',
    poster_path: r.poster_path
      ? `https://image.tmdb.org/t/p/w500${r.poster_path}`
      : r.backdrop_path
      ? `https://image.tmdb.org/t/p/w500${r.backdrop_path}`
      : '',
    backdrop_path: r.backdrop_path
      ? `https://image.tmdb.org/t/p/original${r.backdrop_path}`
      : r.poster_path
      ? `https://image.tmdb.org/t/p/original${r.poster_path}`
      : '',
    media_type: mediaType,
    release_date: releaseDate,
    first_air_date: r.first_air_date,
    vote_average: typeof r.vote_average === 'number' ? Math.round(r.vote_average * 10) / 10 : 0,
    vote_count: r.vote_count || 0,
    popularity: r.popularity || 0,
    genre_ids: r.genre_ids || (r.genres ? r.genres.map((g: any) => g.id) : []),
    genres: r.genres ? r.genres.map((g: any) => g.name) : [],
    adult: Boolean(r.adult),
  };
}

class ApiService {
  async getBillboard(): Promise<BillboardData[]> {
    if (DATA_MODE !== 'mock') {
      try {
        const data = await fetchFromTMDB('/trending/all/day');
        if (data.results && data.results.length > 0) {
          return data.results.slice(0, 8).map((r: any, idx: number) => ({
            ...mapTmdbToMediaItem(r, r.media_type === 'tv' ? 'tv' : 'movie'),
            rank: idx + 1,
          })) as BillboardData[];
        }
      } catch (err) {
        console.warn('Live billboard fetch notice:', err);
      }
    }

    // Static fallback without mock Mux stream URLs
    return (capturedData.billboard as any[]).map((item, idx) => ({
      ...sanitizeStaticItem(item),
      rank: idx + 1,
    })) as BillboardData[];
  }

  async getRails(): Promise<CarouselRail[]> {
    const progressList = authStorage.getProgressList();
    const staticAllItems = (capturedData.allItems as any[]).map(sanitizeStaticItem);

    // Continue Watching from local storage
    const continueWatchingItems = progressList.map((prog) => {
      const match =
        prog.media_item ||
        staticAllItems.find((i) => i.id === prog.media_id) || {
          id: prog.media_id,
          title: 'Watched Title',
          name: 'Watched Title',
          overview: '',
          poster_path: '',
          backdrop_path: '',
          media_type: 'movie' as const,
          release_date: '',
          vote_average: 0,
          vote_count: 0,
          genre_ids: [],
          popularity: 0,
          adult: false,
        };
      return {
        ...match,
        progress_seconds: prog.progress_seconds,
        total_seconds: prog.total_seconds,
        last_watched: prog.last_watched,
      };
    });

    const isGuest = authStorage.getUserId() === 'guest';
    const activeContinueWatching =
      continueWatchingItems.length > 0
        ? continueWatchingItems
        : isGuest
        ? ((capturedData.continueWatching as any[]) || []).map(sanitizeStaticItem)
        : [];

    if (DATA_MODE !== 'mock') {
      try {
        const [
          trendingMoviesRes,
          trendingSeriesRes,
          popularMoviesRes,
          popularSeriesRes,
          topRatedMoviesRes,
          topRatedSeriesRes,
          airingSeriesRes,
        ] = await Promise.allSettled([
          fetchFromTMDB('/trending/movie/day'),
          fetchFromTMDB('/trending/tv/day'),
          fetchFromTMDB('/movie/popular'),
          fetchFromTMDB('/tv/popular'),
          fetchFromTMDB('/movie/top_rated'),
          fetchFromTMDB('/tv/top_rated'),
          fetchFromTMDB('/tv/on_the_air'),
        ]);

        const getResults = (
          res: PromiseSettledResult<any>,
          type: 'movie' | 'tv'
        ): MediaItem[] => {
          if (res.status === 'fulfilled' && res.value?.results?.length > 0) {
            return res.value.results.map((r: any) => mapTmdbToMediaItem(r, type));
          }
          return [];
        };

        const trendingMovies = getResults(trendingMoviesRes, 'movie');
        const trendingSeries = getResults(trendingSeriesRes, 'tv');
        const popularMovies = getResults(popularMoviesRes, 'movie');
        const popularSeries = getResults(popularSeriesRes, 'tv');
        const topRatedMovies = getResults(topRatedMoviesRes, 'movie');
        const topRatedSeries = getResults(topRatedSeriesRes, 'tv');
        const airingSeries = getResults(airingSeriesRes, 'tv');

        if (trendingMovies.length > 0) {
          const liveRails: CarouselRail[] = [];

          if (activeContinueWatching.length > 0) {
            liveRails.push({
              id: 'continue-watching',
              title: 'Continue Watching',
              isContinueWatching: true,
              items: activeContinueWatching,
            });
          }

          liveRails.push({
            id: 'trending-movies',
            title: 'Trending Movies Today',
            items: trendingMovies,
          });

          if (trendingSeries.length > 0) {
            liveRails.push({
              id: 'trending-series',
              title: 'Trending TV Series',
              items: trendingSeries,
            });
          }

          if (popularMovies.length > 0) {
            liveRails.push({
              id: 'popular-movies',
              title: 'Popular Movies',
              items: popularMovies,
            });
          }

          if (popularSeries.length > 0) {
            liveRails.push({
              id: 'popular-series',
              title: 'Popular Series',
              items: popularSeries,
            });
          }

          if (topRatedMovies.length > 0) {
            liveRails.push({
              id: 'top-rated-movies',
              title: 'Top Rated Movies',
              items: topRatedMovies,
            });
          }

          if (topRatedSeries.length > 0) {
            liveRails.push({
              id: 'top-rated-series',
              title: 'Top Rated Series',
              items: topRatedSeries,
            });
          }

          if (airingSeries.length > 0) {
            liveRails.push({
              id: 'airing-series',
              title: 'Airing This Week',
              items: airingSeries,
            });
          }

          return liveRails;
        }
      } catch (err) {
        console.warn('Live rails fetch notice, falling back to static:', err);
      }
    }

    // Static fallback
    const rails = capturedData.rails.map((rail) => {
      if (rail.id === 'continue-watching') {
        return {
          ...rail,
          items: activeContinueWatching,
        };
      }
      return {
        ...rail,
        items: (rail.items || []).map(sanitizeStaticItem),
      };
    });

    return rails as CarouselRail[];
  }

  async getMediaDetails(id: number, mediaType?: 'movie' | 'tv'): Promise<MediaItem | null> {
    if (DATA_MODE !== 'mock') {
      const typesToTry: ('movie' | 'tv')[] = mediaType
        ? [mediaType, mediaType === 'movie' ? 'tv' : 'movie']
        : ['movie', 'tv'];

      for (const type of typesToTry) {
        try {
          const r = await fetchFromTMDB(`/${type}/${id}`);
          if (r && r.id && !r.status_code) {
            return mapTmdbToMediaItem(r, type);
          }
        } catch {
          // Try next media type
        }
      }
    }

    const allItems = (capturedData.allItems as any[]).map(sanitizeStaticItem);
    const match = allItems.find((i) => i.id === id);
    if (match) return match;

    const billboard = (capturedData.billboard as any[]).map(sanitizeStaticItem);
    const bMatch = billboard.find((i) => i.id === id);
    if (bMatch) return bMatch;

    return null;
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
          }));
        }
      } catch (err) {
        console.warn('Live episodes fetch notice:', err);
      }
    }

    return ((capturedData.episodes as any[]) || []).map((ep) => {
      const { streamUrl: _s, ...rest } = ep;
      return rest as Episode;
    });
  }

  async getCast(mediaId: number, mediaType?: 'movie' | 'tv'): Promise<CastMember[]> {
    if (DATA_MODE !== 'mock') {
      const typesToTry: ('movie' | 'tv')[] = mediaType
        ? [mediaType, mediaType === 'movie' ? 'tv' : 'movie']
        : ['movie', 'tv'];

      for (const type of typesToTry) {
        try {
          const data = await fetchFromTMDB(`/${type}/${mediaId}/credits`);
          if (data.cast && data.cast.length > 0) {
            return data.cast.slice(0, 15).map((c: any) => ({
              id: c.id,
              name: c.name,
              character: c.character || '',
              profile_path: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : '',
            }));
          }
        } catch {
          // Continue to next type
        }
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
            .map((r: any) => mapTmdbToMediaItem(r, r.media_type === 'tv' ? 'tv' : 'movie'));
        }
      } catch (err) {
        console.warn('Live search fallback notice:', err);
      }
    }

    const q = query.toLowerCase().trim();
    const allItems = (capturedData.allItems as any[]).map(sanitizeStaticItem);
    return allItems.filter(
      (item) =>
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.overview && item.overview.toLowerCase().includes(q))
    );
  }

  async getWatchlistItems(): Promise<MediaItem[]> {
    const watchlistIds = authStorage.getWatchlist();
    const storedMedia = authStorage.getStoredWatchlistMedia();
    const staticAllItems = (capturedData.allItems as any[]).map(sanitizeStaticItem);

    const items: MediaItem[] = [];
    const seen = new Set<number>();

    for (const id of watchlistIds) {
      if (seen.has(id)) continue;
      seen.add(id);

      const fromStored = storedMedia.find((m) => m.id === id);
      if (fromStored) {
        items.push(fromStored);
        continue;
      }
      const fromStatic = staticAllItems.find((m) => m.id === id);
      if (fromStatic) {
        items.push(fromStatic);
        continue;
      }
      try {
        const fetched = await this.getMediaDetails(id);
        if (fetched) {
          items.push(fetched);
        }
      } catch {
        // Ignore details fetch failure
      }
    }
    return items;
  }

  async getAllMedia(): Promise<MediaItem[]> {
    if (DATA_MODE !== 'mock') {
      try {
        const [popMovies, popTv, trendMovies, trendTv] = await Promise.allSettled([
          fetchFromTMDB('/movie/popular'),
          fetchFromTMDB('/tv/popular'),
          fetchFromTMDB('/trending/movie/week'),
          fetchFromTMDB('/trending/tv/week'),
        ]);

        const items: MediaItem[] = [];
        const seenIds = new Set<number>();

        const addItems = (res: PromiseSettledResult<any>, type: 'movie' | 'tv') => {
          if (res.status === 'fulfilled' && res.value?.results) {
            for (const r of res.value.results) {
              if (!seenIds.has(r.id)) {
                seenIds.add(r.id);
                items.push(mapTmdbToMediaItem(r, type));
              }
            }
          }
        };

        addItems(popMovies, 'movie');
        addItems(popTv, 'tv');
        addItems(trendMovies, 'movie');
        addItems(trendTv, 'tv');

        if (items.length > 0) {
          return items;
        }
      } catch (err) {
        console.warn('Live all-media fetch notice:', err);
      }
    }

    return ((capturedData.allItems as any[]) || []).map(sanitizeStaticItem);
  }
}

export const api = new ApiService();
export const isUsingLiveTMDB = true;
