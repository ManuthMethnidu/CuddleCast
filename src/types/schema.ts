export interface MediaItem {
  id: number;
  title: string;
  name: string;
  original_title?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  media_type: 'movie' | 'tv';
  release_date: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  logo_path?: string | null;
  adult: boolean;
  rank?: number;
  streamUrl?: string;
  trailerUrl?: string;
}

export interface BillboardData extends MediaItem {
  rank?: number;
  streamUrl: string;
  trailerUrl: string;
}

export interface CarouselRail {
  id: string;
  title: string;
  isTop10?: boolean;
  isContinueWatching?: boolean;
  items: (MediaItem & Partial<UserWatchProgress>)[];
}

export interface Episode {
  id: number;
  episode_number: number;
  season_number: number;
  title: string;
  overview: string;
  runtime: number;
  still_path: string;
  progress?: number;
  streamUrl: string;
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  episodes?: Episode[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

export interface StreamSource {
  quality: string;
  url: string;
  type: 'hls' | 'mp4';
}

export interface UserWatchProgress {
  id: number;
  media_id: number;
  progress_seconds: number;
  total_seconds: number;
  last_watched: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar_url: string;
  is_kids: boolean;
}
