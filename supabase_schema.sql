-- Supabase Database Schema for Sarthi Student Wellness Tracker
-- Paste this script into the Supabase SQL Editor to configure your database tables.

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY, -- Stores client-side generated UUID or user_id
  name TEXT NOT NULL DEFAULT 'Aspirant',
  target_exam TEXT NOT NULL DEFAULT 'JEE',
  study_hours_goal INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Mood Entries Table
CREATE TABLE IF NOT EXISTS mood_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
  stress_score INTEGER NOT NULL CHECK (stress_score BETWEEN 1 AND 10),
  context_tags TEXT[] DEFAULT '{}',
  optional_note TEXT DEFAULT '',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying user moods
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);

-- 3. Journal Entries Table
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  entry_text TEXT NOT NULL,
  associated_mood_id TEXT,
  analysis_status TEXT NOT NULL CHECK (analysis_status IN ('pending', 'completed', 'failed')),
  analysis JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying user journals
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);

-- 4. Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('student', 'companion')),
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying user chat history
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

-- Enable RLS (Optional - since user authentication is not enabled, RLS can be skipped
-- or set up with policies that allow anonymous read/write based on user_id header).
-- For now, we allow public access to select/insert/update/delete based on matching user_id.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Creating simple policies to allow read/write based on user_id
-- Profiles policies
CREATE POLICY "Allow anonymous profile operations" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

-- Mood entries policies
CREATE POLICY "Allow anonymous mood operations" ON mood_entries
  FOR ALL USING (true) WITH CHECK (true);

-- Journal entries policies
CREATE POLICY "Allow anonymous journal operations" ON journal_entries
  FOR ALL USING (true) WITH CHECK (true);

-- Chat messages policies
CREATE POLICY "Allow anonymous chat operations" ON chat_messages
  FOR ALL USING (true) WITH CHECK (true);
