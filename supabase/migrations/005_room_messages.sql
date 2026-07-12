-- ============================================================
-- DJ ROOTS — Migration 005: Live Chat
-- Run in Supabase SQL Editor (or apply via supabase db push)
-- ============================================================

-- ===================== TABLE =====================
CREATE TABLE IF NOT EXISTS room_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL,         -- profile id of the sender
  username    VARCHAR(50) NOT NULL,  -- denormalised so we don't need a JOIN on read
  avatar_url  TEXT,                  -- nullable
  message     TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 250),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================== INDEXES =====================
-- Primary read pattern: fetch recent messages for a room ordered by time
CREATE INDEX IF NOT EXISTS idx_room_messages_room_created
  ON room_messages(room_id, created_at DESC);

-- ===================== ROW LEVEL SECURITY =====================
ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;

-- Consistent with existing policies: public read/insert for demo
-- (Tighten to room membership check for production.)
CREATE POLICY "Allow public read on room_messages"
  ON room_messages FOR SELECT USING (true);

CREATE POLICY "Allow public insert on room_messages"
  ON room_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete own room_messages"
  ON room_messages FOR DELETE USING (true);

-- ===================== ENABLE REALTIME =====================
-- In Supabase Dashboard → Database → Replication, enable the room_messages table.
-- Or run:
ALTER PUBLICATION supabase_realtime ADD TABLE room_messages;
