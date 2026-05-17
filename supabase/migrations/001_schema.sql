-- ============================================================
-- DJ ROOTS — PostgreSQL Schema (Supabase)
-- Run this in the Supabase SQL Editor to set up all tables.
-- ============================================================

-- ===================== 1. ROOMS =====================
CREATE TABLE IF NOT EXISTS rooms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(10) UNIQUE NOT NULL,
  name          VARCHAR(100) NOT NULL DEFAULT 'DJ Room',
  host_id       UUID,
  current_track_id UUID,                           -- FK to queue_items
  is_playing    BOOLEAN NOT NULL DEFAULT false,
  hype_mode     BOOLEAN NOT NULL DEFAULT false,
  dj_timer_seconds INT NOT NULL DEFAULT 300,       -- countdown for current DJ
  -- Settings
  crossfade     BOOLEAN NOT NULL DEFAULT true,
  auto_normalize BOOLEAN NOT NULL DEFAULT false,
  allow_guest_add BOOLEAN NOT NULL DEFAULT true,
  skip_threshold INT NOT NULL DEFAULT 15,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================== 2. PROFILES =====================
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(50) NOT NULL,
  username      VARCHAR(50) UNIQUE NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================== 3. ROOM MEMBERS =====================
CREATE TABLE IF NOT EXISTS room_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id       UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  profile_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role          VARCHAR(20) NOT NULL DEFAULT 'member',  -- 'host', 'dj_next', 'member'
  activity      VARCHAR(100) DEFAULT 'Joined the room',
  activity_type VARCHAR(30) DEFAULT 'joined',
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, profile_id)
);

-- ===================== 4. SONGS =====================
CREATE TABLE IF NOT EXISTS songs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         VARCHAR(200) NOT NULL,
  artist        VARCHAR(200) NOT NULL,
  duration      INT NOT NULL DEFAULT 200,             -- seconds
  bpm           INT DEFAULT 120,
  key           VARCHAR(20) DEFAULT 'C Maj',
  pitch         INT DEFAULT 260,
  img_url       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(title, artist)
);

-- ===================== 5. QUEUE ITEMS =====================
CREATE TABLE IF NOT EXISTS queue_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id       UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  song_id       UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  added_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  votes         INT NOT NULL DEFAULT 0,
  position      INT NOT NULL DEFAULT 0,               -- ordering hint
  played_at     TIMESTAMPTZ,                           -- null = not yet played
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================== 6. VOTES =====================
CREATE TABLE IF NOT EXISTS votes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_item_id UUID NOT NULL REFERENCES queue_items(id) ON DELETE CASCADE,
  profile_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value         INT NOT NULL CHECK (value IN (-1, 1)),  -- upvote or downvote
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(queue_item_id, profile_id)
);

-- ===================== INDEXES =====================
CREATE INDEX IF NOT EXISTS idx_queue_items_room ON queue_items(room_id);
CREATE INDEX IF NOT EXISTS idx_queue_items_votes ON queue_items(room_id, votes DESC);
CREATE INDEX IF NOT EXISTS idx_room_members_room ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_votes_queue_item ON votes(queue_item_id);

-- ===================== UPDATED_AT TRIGGER =====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rooms_updated_at ON rooms;
CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===================== VOTE COUNT TRIGGER =====================
-- Automatically recalculates queue_items.votes when a vote is inserted/updated/deleted
CREATE OR REPLACE FUNCTION recalculate_votes()
RETURNS TRIGGER AS $$
DECLARE
  target_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_id := OLD.queue_item_id;
  ELSE
    target_id := NEW.queue_item_id;
  END IF;
  
  UPDATE queue_items
  SET votes = COALESCE((SELECT SUM(value) FROM votes WHERE queue_item_id = target_id), 0)
  WHERE id = target_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS votes_recalculate ON votes;
CREATE TRIGGER votes_recalculate
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION recalculate_votes();

-- ===================== ROW LEVEL SECURITY =====================
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated and anonymous users
CREATE POLICY "Allow public read on rooms"      ON rooms       FOR SELECT USING (true);
CREATE POLICY "Allow public read on profiles"    ON profiles    FOR SELECT USING (true);
CREATE POLICY "Allow public read on members"     ON room_members FOR SELECT USING (true);
CREATE POLICY "Allow public read on songs"       ON songs       FOR SELECT USING (true);
CREATE POLICY "Allow public read on queue"       ON queue_items FOR SELECT USING (true);
CREATE POLICY "Allow public read on votes"       ON votes       FOR SELECT USING (true);

-- Allow insert/update/delete for all (for demo — tighten for production)
CREATE POLICY "Allow public insert on rooms"     ON rooms       FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on rooms"     ON rooms       FOR UPDATE USING (true);
CREATE POLICY "Allow public insert on profiles"  ON profiles    FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on profiles"  ON profiles    FOR UPDATE USING (true);
CREATE POLICY "Allow public insert on members"   ON room_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on members"   ON room_members FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on members"   ON room_members FOR DELETE USING (true);
CREATE POLICY "Allow public insert on songs"     ON songs       FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on queue"     ON queue_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on queue"     ON queue_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on queue"     ON queue_items FOR DELETE USING (true);
CREATE POLICY "Allow public insert on votes"     ON votes       FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on votes"     ON votes       FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on votes"     ON votes       FOR DELETE USING (true);

-- ===================== ENABLE REALTIME =====================
-- In Supabase Dashboard, go to Database > Replication and enable the following tables:
-- rooms, queue_items, room_members, votes

-- ===================== SEED DATA =====================

-- Profiles
INSERT INTO profiles (id, name, username, avatar_url) VALUES
  ('a1a1a1a1-0001-4000-8000-000000000001', 'Aarav',  '@aarav_music',  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&q=80'),
  ('a1a1a1a1-0002-4000-8000-000000000002', 'Riya',   '@riya_23',      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80'),
  ('a1a1a1a1-0003-4000-8000-000000000003', 'Kabir',  '@kabir7',       'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80'),
  ('a1a1a1a1-0004-4000-8000-000000000004', 'Meera',  '@meera_vibes',  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80'),
  ('a1a1a1a1-0005-4000-8000-000000000005', 'Rohan',  '@rohan_18',     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80'),
  ('a1a1a1a1-0006-4000-8000-000000000006', 'Ishita', '@ishita_here',  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80'),
  ('a1a1a1a1-0007-4000-8000-000000000007', 'Aman',   '@aman_music',   'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80'),
  ('a1a1a1a1-0008-4000-8000-000000000008', 'Neha',   '@neha_04',      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&q=80')
ON CONFLICT (username) DO NOTHING;

-- Songs
INSERT INTO songs (id, title, artist, duration, bpm, key, pitch, img_url) VALUES
  ('b2b2b2b2-0001-4000-8000-000000000001', 'Die For You',      'The Weeknd',     234, 134, 'C# Min', 220, 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=120&q=80'),
  ('b2b2b2b2-0002-4000-8000-000000000002', 'Blinding Lights',  'The Weeknd',     200, 128, 'E Min',  293, 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&q=80'),
  ('b2b2b2b2-0003-4000-8000-000000000003', 'Levitating',       'Dua Lipa',       203, 103, 'F# Maj', 330, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&q=80'),
  ('b2b2b2b2-0004-4000-8000-000000000004', 'Heat Waves',       'Glass Animals',  235, 81,  'B Maj',  180, 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=120&q=80'),
  ('b2b2b2b2-0005-4000-8000-000000000005', 'Save Your Tears',  'The Weeknd',     215, 118, 'G Maj',  261, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&q=80'),
  ('b2b2b2b2-0006-4000-8000-000000000006', 'Peaches',          'Justin Bieber',  198, 90,  'C Maj',  311, 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=120&q=80'),
  ('b2b2b2b2-0007-4000-8000-000000000007', 'Calm Down',        'Rema',           239, 107, 'B Maj',  311, 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=120&q=80'),
  ('b2b2b2b2-0008-4000-8000-000000000008', 'Flowers',          'Miley Cyrus',    200, 118, 'A Min',  261, 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=120&q=80')
ON CONFLICT (title, artist) DO NOTHING;

-- Room
INSERT INTO rooms (id, code, name, host_id, dj_timer_seconds) VALUES
  ('c3c3c3c3-0001-4000-8000-000000000001', 'ROOTS26', 'DJ Roots Main Stage', 'a1a1a1a1-0001-4000-8000-000000000001', 165)
ON CONFLICT (code) DO NOTHING;

-- Room Members
INSERT INTO room_members (room_id, profile_id, role, activity, activity_type) VALUES
  ('c3c3c3c3-0001-4000-8000-000000000001', 'a1a1a1a1-0001-4000-8000-000000000001', 'host',    'DJing Live',        'dj'),
  ('c3c3c3c3-0001-4000-8000-000000000001', 'a1a1a1a1-0002-4000-8000-000000000002', 'dj_next', 'Added 2 songs',     'added_songs'),
  ('c3c3c3c3-0001-4000-8000-000000000001', 'a1a1a1a1-0003-4000-8000-000000000003', 'member',  'Voted',             'voted'),
  ('c3c3c3c3-0001-4000-8000-000000000001', 'a1a1a1a1-0004-4000-8000-000000000004', 'member',  'Reacted',           'reacted_fire'),
  ('c3c3c3c3-0001-4000-8000-000000000001', 'a1a1a1a1-0005-4000-8000-000000000005', 'member',  'Added 1 song',      'added_song'),
  ('c3c3c3c3-0001-4000-8000-000000000001', 'a1a1a1a1-0006-4000-8000-000000000006', 'member',  'Voted',             'voted'),
  ('c3c3c3c3-0001-4000-8000-000000000001', 'a1a1a1a1-0007-4000-8000-000000000007', 'member',  'Reacted',           'reacted_cool'),
  ('c3c3c3c3-0001-4000-8000-000000000001', 'a1a1a1a1-0008-4000-8000-000000000008', 'member',  'Joined the room',   'joined')
ON CONFLICT (room_id, profile_id) DO NOTHING;

-- Queue Items
INSERT INTO queue_items (id, room_id, song_id, added_by, votes, position) VALUES
  ('d4d4d4d4-0001-4000-8000-000000000001', 'c3c3c3c3-0001-4000-8000-000000000001', 'b2b2b2b2-0001-4000-8000-000000000001', 'a1a1a1a1-0003-4000-8000-000000000003', 24, 1),
  ('d4d4d4d4-0002-4000-8000-000000000002', 'c3c3c3c3-0001-4000-8000-000000000001', 'b2b2b2b2-0002-4000-8000-000000000002', 'a1a1a1a1-0002-4000-8000-000000000002', 18, 2),
  ('d4d4d4d4-0003-4000-8000-000000000003', 'c3c3c3c3-0001-4000-8000-000000000001', 'b2b2b2b2-0003-4000-8000-000000000003', 'a1a1a1a1-0004-4000-8000-000000000004', 10, 3),
  ('d4d4d4d4-0004-4000-8000-000000000004', 'c3c3c3c3-0001-4000-8000-000000000001', 'b2b2b2b2-0004-4000-8000-000000000004', 'a1a1a1a1-0005-4000-8000-000000000005', -2, 4),
  ('d4d4d4d4-0005-4000-8000-000000000005', 'c3c3c3c3-0001-4000-8000-000000000001', 'b2b2b2b2-0005-4000-8000-000000000005', 'a1a1a1a1-0007-4000-8000-000000000007', -5, 5),
  ('d4d4d4d4-0006-4000-8000-000000000006', 'c3c3c3c3-0001-4000-8000-000000000001', 'b2b2b2b2-0006-4000-8000-000000000006', 'a1a1a1a1-0006-4000-8000-000000000006', -8, 6)
ON CONFLICT DO NOTHING;

-- Set current track to the first queue item
UPDATE rooms
SET current_track_id = 'd4d4d4d4-0001-4000-8000-000000000001'
WHERE id = 'c3c3c3c3-0001-4000-8000-000000000001';
