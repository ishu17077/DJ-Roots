-- ============================================================
-- Migration 004: Add YouTube fields to songs table
-- Run this in the Supabase SQL Editor
-- ============================================================

ALTER TABLE songs
  ADD COLUMN IF NOT EXISTS youtube_video_id VARCHAR(20),
  ADD COLUMN IF NOT EXISTS source           VARCHAR(30) NOT NULL DEFAULT 'catalog',
  ADD COLUMN IF NOT EXISTS embed_url        TEXT;

-- Partial unique index so two YouTube songs with the same title/artist can coexist
-- as long as they have different video IDs
CREATE UNIQUE INDEX IF NOT EXISTS idx_songs_youtube_id
  ON songs(youtube_video_id)
  WHERE youtube_video_id IS NOT NULL;
