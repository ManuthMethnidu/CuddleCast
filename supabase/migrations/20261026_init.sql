-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  is_kids BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Watchlist Table
CREATE TABLE IF NOT EXISTS public.watchlist (
  id BIGSERIAL PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, media_id)
);

-- 3. Likes Table
CREATE TABLE IF NOT EXISTS public.likes (
  id BIGSERIAL PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, media_id)
);

-- 4. Watch Progress Table
CREATE TABLE IF NOT EXISTS public.watch_progress (
  id BIGSERIAL PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_id BIGINT NOT NULL,
  progress_seconds INTEGER NOT NULL DEFAULT 0,
  total_seconds INTEGER NOT NULL DEFAULT 0,
  last_watched TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, media_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_progress ENABLE ROW LEVEL SECURITY;

-- Allow anon and authenticated full access for profile-driven app usage
DROP POLICY IF EXISTS "Public access for profiles" ON public.profiles;
CREATE POLICY "Public access for profiles" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for watchlist" ON public.watchlist;
CREATE POLICY "Public access for watchlist" ON public.watchlist
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for likes" ON public.likes;
CREATE POLICY "Public access for likes" ON public.likes
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for watch_progress" ON public.watch_progress;
CREATE POLICY "Public access for watch_progress" ON public.watch_progress
  FOR ALL USING (true) WITH CHECK (true);

-- Insert Default Profiles if none exist
INSERT INTO public.profiles (id, name, avatar_url, is_kids)
VALUES 
  ('prof-1', 'CuddleCast Member', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', false),
  ('prof-2', 'Guest Watcher', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', false),
  ('prof-3', 'Kids Club', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=200&q=80', true)
ON CONFLICT (id) DO NOTHING;
