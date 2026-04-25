-- Fruit Forecast — Supabase database schema
--
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- to set up the profiles table and Row Level Security policies.
--
-- The profiles table stores user preferences, favorites, and journal
-- entries so they sync across devices. Each row is owned by a single
-- auth user and protected by RLS.

-- ── Profiles table ──────────────────────────────────────────────
-- One row per authenticated user. Created on first sign-in via the
-- profileSync module, not by a database trigger, so we have full
-- control over the initial data.
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT DEFAULT '',
  avatar_emoji TEXT DEFAULT '🍎',
  preferred_region JSONB DEFAULT NULL,
  -- Favorites stored as a JSON array of produce IDs: ["strawberries", "corn"]
  favorites JSONB DEFAULT '[]'::jsonb,
  -- Journal stored as a JSON array of entry objects
  journal JSONB DEFAULT '[]'::jsonb,
  -- Preferences object (notification toggle, distance unit, etc.)
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- Each user gets exactly one profile row
  CONSTRAINT unique_user_id UNIQUE (user_id)
);

-- Index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- ── Row Level Security ──────────────────────────────────────────
-- Only the profile owner can read, insert, or update their own row.
-- No one can read other users' profiles.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile (one row on first sign-in)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own profile (account deletion)
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- ── Auto-update updated_at timestamp ────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
