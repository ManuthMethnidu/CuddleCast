import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { BillboardData, CarouselRail, CastMember, Episode, MediaItem } from '../types/schema';

// Query Keys
export const queryKeys = {
  billboard: ['catalog', 'billboard'] as const,
  rails: ['catalog', 'rails'] as const,
  allMedia: ['catalog', 'allMedia'] as const,
  mediaDetails: (id: number) => ['catalog', 'media', id] as const,
  episodes: (mediaId: number, season: number) =>
    ['catalog', 'episodes', mediaId, season] as const,
  cast: (mediaId: number) => ['catalog', 'cast', mediaId] as const,
  search: (query: string) => ['catalog', 'search', query] as const,
};

// 1. Billboard Query (Cached for 10 minutes)
export const useBillboardQuery = () => {
  return useQuery<BillboardData[]>({
    queryKey: queryKeys.billboard,
    queryFn: () => api.getBillboard(),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
};

// 2. Carousel Rails Query (Cached for 5 minutes)
export const useRailsQuery = () => {
  return useQuery<CarouselRail[]>({
    queryKey: queryKeys.rails,
    queryFn: () => api.getRails(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};

// 3. All Media Items Query
export const useAllMediaQuery = () => {
  return useQuery<MediaItem[]>({
    queryKey: queryKeys.allMedia,
    queryFn: () => api.getAllMedia(),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  });
};

// 4. Media Detail Query
export const useMediaDetailsQuery = (id: number | null) => {
  return useQuery<MediaItem | null>({
    queryKey: queryKeys.mediaDetails(id || 0),
    queryFn: () => (id ? api.getMediaDetails(id) : Promise.resolve(null)),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 10,
  });
};

// 5. Episodes Query
export const useEpisodesQuery = (mediaId: number | null, season: number = 1) => {
  return useQuery<Episode[]>({
    queryKey: queryKeys.episodes(mediaId || 0, season),
    queryFn: () => (mediaId ? api.getEpisodes(mediaId, season) : Promise.resolve([])),
    enabled: Boolean(mediaId),
    staleTime: 1000 * 60 * 10,
  });
};

// 6. Cast Query
export const useCastQuery = (mediaId: number | null) => {
  return useQuery<CastMember[]>({
    queryKey: queryKeys.cast(mediaId || 0),
    queryFn: () => (mediaId ? api.getCast(mediaId) : Promise.resolve([])),
    enabled: Boolean(mediaId),
    staleTime: 1000 * 60 * 10,
  });
};

// 7. Search Media Query
export const useSearchMediaQuery = (query: string) => {
  return useQuery<MediaItem[]>({
    queryKey: queryKeys.search(query.trim().toLowerCase()),
    queryFn: () => api.searchMedia(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 3,
  });
};
