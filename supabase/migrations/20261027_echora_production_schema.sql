-- ==============================================================================
-- ECHORA PRODUCTION DATABASE SCHEMA
-- Version: 2.0.0
-- Dialect: PostgreSQL 15+ (Supabase Architecture)
-- Description: Full-featured database schema for Echora streaming platform.
--              Includes User Profiles, Media Catalog (Movies, TV, Anime, Manga,
--              IPTV, Radio), Seasons/Episodes, Manga Chapter Progress,
--              Video Watch Progress, Watchlist & Collections, Watch Party Realtime
--              Synchronization, Community Reviews, and Streaming Telemetry.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HELPER FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 3. PROFILES & USER ACCOUNTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(60) NOT NULL,
  avatar_url TEXT,
  is_kids BOOLEAN NOT NULL DEFAULT FALSE,
  pin_code VARCHAR(6) NULL,
  preferred_language VARCHAR(10) DEFAULT 'en',
  preferred_quality VARCHAR(10) DEFAULT 'auto',
  autoplay_next BOOLEAN DEFAULT TRUE,
  accent_color VARCHAR(16) DEFAULT '#2185D5',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 4. MEDIA CATALOG
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.media_items (
  id TEXT PRIMARY KEY,
  tmdb_id BIGINT NULL,
  imdb_id VARCHAR(32) NULL,
  title TEXT NOT NULL,
  original_title TEXT NULL,
  overview TEXT NULL,
  poster_path TEXT NULL,
  backdrop_path TEXT NULL,
  logo_path TEXT NULL,
  media_type VARCHAR(32) NOT NULL CHECK (media_type IN ('movie', 'tv', 'anime', 'manga', 'live_tv', 'sports', 'radio', 'asian_drama')),
  release_date DATE NULL,
  first_air_date DATE NULL,
  vote_average NUMERIC(3,1) DEFAULT 0.0,
  vote_count INTEGER DEFAULT 0,
  popularity NUMERIC(10,3) DEFAULT 0.0,
  genre_ids INTEGER[] DEFAULT '{}',
  genres TEXT[] DEFAULT '{}',
  adult BOOLEAN DEFAULT FALSE,
  stream_url TEXT NULL,
  trailer_url TEXT NULL,
  status VARCHAR(32) DEFAULT 'released',
  extra_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_media_items_updated_at ON public.media_items;
CREATE TRIGGER set_media_items_updated_at
  BEFORE UPDATE ON public.media_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. SEASONS & EPISODES (TV, ANIME, ASIAN DRAMA)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id TEXT NOT NULL REFERENCES public.media_items(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  overview TEXT NULL,
  poster_path TEXT NULL,
  episode_count INTEGER DEFAULT 0,
  air_date DATE NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(media_id, season_number)
);

CREATE TABLE IF NOT EXISTS public.episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id TEXT NOT NULL REFERENCES public.media_items(id) ON DELETE CASCADE,
  season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  overview TEXT NULL,
  still_path TEXT NULL,
  runtime_minutes INTEGER NULL,
  stream_url TEXT NULL,
  air_date DATE NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(media_id, season_number, episode_number)
);

-- ==============================================================================
-- 6. MANGA CHAPTERS & READING PROGRESS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.manga_chapters (
  id TEXT PRIMARY KEY,
  media_id TEXT NOT NULL REFERENCES public.media_items(id) ON DELETE CASCADE,
  chapter_number NUMERIC(8,2) NOT NULL,
  volume_number VARCHAR(16) NULL,
  title TEXT NULL,
  language VARCHAR(10) DEFAULT 'en',
  pages_count INTEGER DEFAULT 0,
  scanlation_group TEXT NULL,
  published_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.manga_reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL REFERENCES public.media_items(id) ON DELETE CASCADE,
  chapter_id TEXT REFERENCES public.manga_chapters(id) ON DELETE SET NULL,
  current_page INTEGER NOT NULL DEFAULT 1,
  total_pages INTEGER NOT NULL DEFAULT 1,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  last_read TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, media_id)
);

-- ==============================================================================
-- 7. VIDEO & AUDIO WATCH PROGRESS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.watch_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL,
  season_number INTEGER NULL,
  episode_number INTEGER NULL,
  progress_seconds INTEGER NOT NULL DEFAULT 0,
  total_seconds INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  last_watched TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, media_id)
);

CREATE TABLE IF NOT EXISTS public.watch_history (
  id BIGSERIAL PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL,
  season_number INTEGER NULL,
  episode_number INTEGER NULL,
  duration_watched_seconds INTEGER NOT NULL DEFAULT 0,
  device_info TEXT NULL,
  watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. WATCHLIST, LIKES & CUSTOM PLAYLISTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, media_id)
);

CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL,
  is_like BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, media_id)
);

CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(120) NOT NULL,
  description TEXT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_playlists_updated_at ON public.playlists;
CREATE TRIGGER set_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(playlist_id, media_id)
);

-- ==============================================================================
-- 9. WATCH PARTY ROOMS & REALTIME BROADCAST
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.watch_party_rooms (
  room_code VARCHAR(32) PRIMARY KEY,
  host_profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL,
  media_title TEXT NOT NULL,
  season_number INTEGER NULL,
  episode_number INTEGER NULL,
  playback_time NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  is_playing BOOLEAN NOT NULL DEFAULT FALSE,
  last_sync_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.watch_party_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(32) NOT NULL REFERENCES public.watch_party_rooms(room_code) ON DELETE CASCADE,
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT NULL,
  is_host BOOLEAN NOT NULL DEFAULT FALSE,
  last_ping_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_code, profile_id)
);

CREATE TABLE IF NOT EXISTS public.watch_party_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(32) NOT NULL REFERENCES public.watch_party_rooms(room_code) ON DELETE CASCADE,
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 10. REVIEWS & RATINGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.media_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 10.0),
  headline VARCHAR(255) NULL,
  content TEXT NULL,
  contains_spoilers BOOLEAN NOT NULL DEFAULT FALSE,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, media_id)
);

DROP TRIGGER IF EXISTS set_media_reviews_updated_at ON public.media_reviews;
CREATE TRIGGER set_media_reviews_updated_at
  BEFORE UPDATE ON public.media_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 11. STREAM PROVIDER TELEMETRY & HEALTH
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.provider_telemetry (
  id BIGSERIAL PRIMARY KEY,
  provider_name VARCHAR(64) NOT NULL,
  media_type VARCHAR(32) NOT NULL,
  latency_ms INTEGER NOT NULL,
  is_successful BOOLEAN NOT NULL,
  http_status INTEGER NULL,
  error_message TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 12. HIGH-PERFORMANCE INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_media_type_popularity ON public.media_items(media_type, popularity DESC);
CREATE INDEX IF NOT EXISTS idx_media_tmdb_id ON public.media_items(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_media_release_date ON public.media_items(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_episodes_media_season ON public.episodes(media_id, season_number, episode_number);
CREATE INDEX IF NOT EXISTS idx_manga_chapters_media ON public.manga_chapters(media_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_watch_progress_profile ON public.watch_progress(profile_id, last_watched DESC);
CREATE INDEX IF NOT EXISTS idx_watch_history_profile ON public.watch_history(profile_id, watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_watchlist_profile ON public.watchlist(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_profile ON public.likes(profile_id);
CREATE INDEX IF NOT EXISTS idx_party_messages_room ON public.watch_party_messages(room_code, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_party_members_ping ON public.watch_party_members(room_code, last_ping_at);
CREATE INDEX IF NOT EXISTS idx_reviews_media ON public.media_reviews(media_id, rating DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_provider ON public.provider_telemetry(provider_name, created_at DESC);

-- ==============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_party_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_party_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_party_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_telemetry ENABLE ROW LEVEL SECURITY;

-- Catalog tables: Public read access
CREATE POLICY "Public read media_items" ON public.media_items FOR SELECT USING (true);
CREATE POLICY "Public read seasons" ON public.seasons FOR SELECT USING (true);
CREATE POLICY "Public read episodes" ON public.episodes FOR SELECT USING (true);
CREATE POLICY "Public read manga_chapters" ON public.manga_chapters FOR SELECT USING (true);
CREATE POLICY "Public read playlists" ON public.playlists FOR SELECT USING (is_public = true OR true);
CREATE POLICY "Public read reviews" ON public.media_reviews FOR SELECT USING (true);

-- User Profiles: Unrestricted select/insert/update for active client profile workflow
CREATE POLICY "Allow all profile access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all watchlist access" ON public.watchlist FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all likes access" ON public.likes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all watch_progress access" ON public.watch_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all watch_history access" ON public.watch_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all manga_reading_progress access" ON public.manga_reading_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all playlist access" ON public.playlists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all playlist_items access" ON public.playlist_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all party rooms access" ON public.watch_party_rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all party members access" ON public.watch_party_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all party messages access" ON public.watch_party_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all reviews access" ON public.media_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow telemetry inserts" ON public.provider_telemetry FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow telemetry read" ON public.provider_telemetry FOR SELECT USING (true);

-- ==============================================================================
-- 14. REALTIME PUBLICATION
-- ==============================================================================

-- Enable Supabase Realtime subscriptions on watch parties and user progress
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_party_rooms;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_party_members;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_party_messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_progress;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- 15. SEED DATA (DEFAULT ECHORA PROFILES & INITIAL RECORDS)
-- ==============================================================================

INSERT INTO public.profiles (id, name, avatar_url, is_kids, accent_color)
VALUES 
  ('prof-1', 'Echora Member', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', false, '#2185D5'),
  ('prof-2', 'Guest Watcher', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', false, '#2185D5'),
  ('prof-3', 'Kids Club', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=200&q=80', true, '#2185D5')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    accent_color = EXCLUDED.accent_color;
