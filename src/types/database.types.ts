/**
-- ==============================================================================
-- ECHORA DATABASE TYPES
-- Generated & structured for Supabase Client Type-Safety
-- ==============================================================================
*/

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MediaType =
  | 'movie'
  | 'tv'
  | 'anime'
  | 'manga'
  | 'live_tv'
  | 'sports'
  | 'radio'
  | 'asian_drama';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          avatar_url: string | null;
          is_kids: boolean;
          pin_code: string | null;
          preferred_language: string;
          preferred_quality: string;
          autoplay_next: boolean;
          accent_color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          avatar_url?: string | null;
          is_kids?: boolean;
          pin_code?: string | null;
          preferred_language?: string;
          preferred_quality?: string;
          autoplay_next?: boolean;
          accent_color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          avatar_url?: string | null;
          is_kids?: boolean;
          pin_code?: string | null;
          preferred_language?: string;
          preferred_quality?: string;
          autoplay_next?: boolean;
          accent_color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      media_items: {
        Row: {
          id: string;
          tmdb_id: number | null;
          imdb_id: string | null;
          title: string;
          original_title: string | null;
          overview: string | null;
          poster_path: string | null;
          backdrop_path: string | null;
          logo_path: string | null;
          media_type: MediaType;
          release_date: string | null;
          first_air_date: string | null;
          vote_average: number;
          vote_count: number;
          popularity: number;
          genre_ids: number[];
          genres: string[];
          adult: boolean;
          stream_url: string | null;
          trailer_url: string | null;
          status: string;
          extra_metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          tmdb_id?: number | null;
          imdb_id?: string | null;
          title: string;
          original_title?: string | null;
          overview?: string | null;
          poster_path?: string | null;
          backdrop_path?: string | null;
          logo_path?: string | null;
          media_type: MediaType;
          release_date?: string | null;
          first_air_date?: string | null;
          vote_average?: number;
          vote_count?: number;
          popularity?: number;
          genre_ids?: number[];
          genres?: string[];
          adult?: boolean;
          stream_url?: string | null;
          trailer_url?: string | null;
          status?: string;
          extra_metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tmdb_id?: number | null;
          imdb_id?: string | null;
          title?: string;
          original_title?: string | null;
          overview?: string | null;
          poster_path?: string | null;
          backdrop_path?: string | null;
          logo_path?: string | null;
          media_type?: MediaType;
          release_date?: string | null;
          first_air_date?: string | null;
          vote_average?: number;
          vote_count?: number;
          popularity?: number;
          genre_ids?: number[];
          genres?: string[];
          adult?: boolean;
          stream_url?: string | null;
          trailer_url?: string | null;
          status?: string;
          extra_metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      seasons: {
        Row: {
          id: string;
          media_id: string;
          season_number: number;
          name: string;
          overview: string | null;
          poster_path: string | null;
          episode_count: number;
          air_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          media_id: string;
          season_number: number;
          name: string;
          overview?: string | null;
          poster_path?: string | null;
          episode_count?: number;
          air_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          media_id?: string;
          season_number?: number;
          name?: string;
          overview?: string | null;
          poster_path?: string | null;
          episode_count?: number;
          air_date?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      episodes: {
        Row: {
          id: string;
          media_id: string;
          season_id: string;
          season_number: number;
          episode_number: number;
          title: string;
          overview: string | null;
          still_path: string | null;
          runtime_minutes: number | null;
          stream_url: string | null;
          air_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          media_id: string;
          season_id: string;
          season_number: number;
          episode_number: number;
          title: string;
          overview?: string | null;
          still_path?: string | null;
          runtime_minutes?: number | null;
          stream_url?: string | null;
          air_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          media_id?: string;
          season_id?: string;
          season_number?: number;
          episode_number?: number;
          title?: string;
          overview?: string | null;
          still_path?: string | null;
          runtime_minutes?: number | null;
          stream_url?: string | null;
          air_date?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      manga_chapters: {
        Row: {
          id: string;
          media_id: string;
          chapter_number: number;
          volume_number: string | null;
          title: string | null;
          language: string;
          pages_count: number;
          scanlation_group: string | null;
          published_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          media_id: string;
          chapter_number: number;
          volume_number?: string | null;
          title?: string | null;
          language?: string;
          pages_count?: number;
          scanlation_group?: string | null;
          published_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          media_id?: string;
          chapter_number?: number;
          volume_number?: string | null;
          title?: string | null;
          language?: string;
          pages_count?: number;
          scanlation_group?: string | null;
          published_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      manga_reading_progress: {
        Row: {
          id: string;
          profile_id: string;
          media_id: string;
          chapter_id: string | null;
          current_page: number;
          total_pages: number;
          is_completed: boolean;
          last_read: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          media_id: string;
          chapter_id?: string | null;
          current_page?: number;
          total_pages?: number;
          is_completed?: boolean;
          last_read?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          media_id?: string;
          chapter_id?: string | null;
          current_page?: number;
          total_pages?: number;
          is_completed?: boolean;
          last_read?: string;
        };
        Relationships: [];
      };
      watch_progress: {
        Row: {
          id: string;
          profile_id: string;
          media_id: string;
          season_number: number | null;
          episode_number: number | null;
          progress_seconds: number;
          total_seconds: number;
          is_completed: boolean;
          last_watched: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          media_id: string;
          season_number?: number | null;
          episode_number?: number | null;
          progress_seconds?: number;
          total_seconds?: number;
          is_completed?: boolean;
          last_watched?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          media_id?: string;
          season_number?: number | null;
          episode_number?: number | null;
          progress_seconds?: number;
          total_seconds?: number;
          is_completed?: boolean;
          last_watched?: string;
        };
        Relationships: [];
      };
      watch_history: {
        Row: {
          id: number;
          profile_id: string;
          media_id: string;
          season_number: number | null;
          episode_number: number | null;
          duration_watched_seconds: number;
          device_info: string | null;
          watched_at: string;
        };
        Insert: {
          id?: number;
          profile_id: string;
          media_id: string;
          season_number?: number | null;
          episode_number?: number | null;
          duration_watched_seconds?: number;
          device_info?: string | null;
          watched_at?: string;
        };
        Update: {
          id?: number;
          profile_id?: string;
          media_id?: string;
          season_number?: number | null;
          episode_number?: number | null;
          duration_watched_seconds?: number;
          device_info?: string | null;
          watched_at?: string;
        };
        Relationships: [];
      };
      watchlist: {
        Row: {
          id: string;
          profile_id: string;
          media_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          media_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          media_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      likes: {
        Row: {
          id: string;
          profile_id: string;
          media_id: string;
          is_like: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          media_id: string;
          is_like?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          media_id?: string;
          is_like?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      playlists: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          description: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          title: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          title?: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      playlist_items: {
        Row: {
          id: string;
          playlist_id: string;
          media_id: string;
          sort_order: number;
          added_at: string;
        };
        Insert: {
          id?: string;
          playlist_id: string;
          media_id: string;
          sort_order?: number;
          added_at?: string;
        };
        Update: {
          id?: string;
          playlist_id?: string;
          media_id?: string;
          sort_order?: number;
          added_at?: string;
        };
        Relationships: [];
      };
      watch_party_rooms: {
        Row: {
          room_code: string;
          host_profile_id: string;
          media_id: string;
          media_title: string;
          season_number: number | null;
          episode_number: number | null;
          playback_time: number;
          is_playing: boolean;
          last_sync_at: string;
          created_at: string;
        };
        Insert: {
          room_code: string;
          host_profile_id: string;
          media_id: string;
          media_title: string;
          season_number?: number | null;
          episode_number?: number | null;
          playback_time?: number;
          is_playing?: boolean;
          last_sync_at?: string;
          created_at?: string;
        };
        Update: {
          room_code?: string;
          host_profile_id?: string;
          media_id?: string;
          media_title?: string;
          season_number?: number | null;
          episode_number?: number | null;
          playback_time?: number;
          is_playing?: boolean;
          last_sync_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      watch_party_members: {
        Row: {
          id: string;
          room_code: string;
          profile_id: string;
          display_name: string;
          avatar_url: string | null;
          is_host: boolean;
          last_ping_at: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          room_code: string;
          profile_id: string;
          display_name: string;
          avatar_url?: string | null;
          is_host?: boolean;
          last_ping_at?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          room_code?: string;
          profile_id?: string;
          display_name?: string;
          avatar_url?: string | null;
          is_host?: boolean;
          last_ping_at?: string;
          joined_at?: string;
        };
        Relationships: [];
      };
      watch_party_messages: {
        Row: {
          id: string;
          room_code: string;
          profile_id: string;
          sender_name: string;
          sender_avatar: string | null;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_code: string;
          profile_id: string;
          sender_name: string;
          sender_avatar?: string | null;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_code?: string;
          profile_id?: string;
          sender_name?: string;
          sender_avatar?: string | null;
          message?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      media_reviews: {
        Row: {
          id: string;
          profile_id: string;
          media_id: string;
          rating: number;
          headline: string | null;
          content: string | null;
          contains_spoilers: boolean;
          helpful_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          media_id: string;
          rating: number;
          headline?: string | null;
          content?: string | null;
          contains_spoilers?: boolean;
          helpful_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          media_id?: string;
          rating?: number;
          headline?: string | null;
          content?: string | null;
          contains_spoilers?: boolean;
          helpful_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      provider_telemetry: {
        Row: {
          id: number;
          provider_name: string;
          media_type: string;
          latency_ms: number;
          is_successful: boolean;
          http_status: number | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          provider_name: string;
          media_type: string;
          latency_ms: number;
          is_successful: boolean;
          http_status?: number | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          provider_name?: string;
          media_type?: string;
          latency_ms?: number;
          is_successful?: boolean;
          http_status?: number | null;
          error_message?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      media_type: MediaType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
