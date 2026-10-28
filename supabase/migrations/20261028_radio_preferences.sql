-- ==============================================================================
-- ECHORA DATABASE MIGRATION: RADIO PREFERENCES
-- File: supabase/migrations/20261028_radio_preferences.sql
-- Description: Stores all user radio preferences (country, favorite genres,
-- onboarding status, volume, mute, screensaver theme, last played station,
-- and favorite/recent stations) in the database per profile.
-- Note: Local stream recordings (.mp3 audio clips) remain stored locally on
-- the user device and are intentionally excluded from the database.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.radio_preferences (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  country_code VARCHAR(8) NOT NULL DEFAULT 'US',
  country_name VARCHAR(100) NOT NULL DEFAULT 'United States',
  favorite_genres JSONB NOT NULL DEFAULT '["lofi", "chillout", "electronic"]'::jsonb,
  is_onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  volume NUMERIC(3, 2) NOT NULL DEFAULT 0.85,
  is_muted BOOLEAN NOT NULL DEFAULT FALSE,
  screensaver_theme VARCHAR(40) NOT NULL DEFAULT 'waviz-bars',
  last_station JSONB NULL,
  favorite_stations JSONB NOT NULL DEFAULT '[]'::jsonb,
  recent_stations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_radio_preferences_profile UNIQUE (profile_id)
);

-- Auto-update updated_at timestamp trigger
DROP TRIGGER IF EXISTS set_radio_preferences_updated_at ON public.radio_preferences;
CREATE TRIGGER set_radio_preferences_updated_at
  BEFORE UPDATE ON public.radio_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- High-performance query index by profile
CREATE INDEX IF NOT EXISTS idx_radio_preferences_profile ON public.radio_preferences(profile_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.radio_preferences ENABLE ROW LEVEL SECURITY;

-- Allow unrestricted profile-driven select/insert/update/delete
DROP POLICY IF EXISTS "Allow all radio_preferences access" ON public.radio_preferences;
CREATE POLICY "Allow all radio_preferences access" ON public.radio_preferences 
  FOR ALL USING (true) WITH CHECK (true);

-- Enable Supabase Realtime for radio preferences sync
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.radio_preferences;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Initial default seed preferences for standard profiles
INSERT INTO public.radio_preferences (profile_id, country_code, country_name, favorite_genres, is_onboarding_completed, volume, is_muted, screensaver_theme)
VALUES 
  ('prof-1', 'US', 'United States', '["lofi", "chillout", "electronic"]'::jsonb, true, 0.85, false, 'waviz-bars'),
  ('prof-2', 'US', 'United States', '["lofi", "chillout"]'::jsonb, true, 0.85, false, 'waviz-bars'),
  ('prof-3', 'US', 'United States', '["animation", "soundtrack"]'::jsonb, true, 0.70, false, 'waviz-bars')
ON CONFLICT (profile_id) DO NOTHING;
