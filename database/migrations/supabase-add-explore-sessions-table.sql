-- Create explore_sessions table for storing swipe session data
-- This table tracks user swipe actions for the Explore feature (Tinder-style place discovery)
CREATE TABLE IF NOT EXISTS explore_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID
  liked_place_ids TEXT[] NOT NULL DEFAULT '{}', -- Array of Google place_ids that user liked
  discarded_place_ids TEXT[] NOT NULL DEFAULT '{}', -- Array of Google place_ids that user discarded
  swipe_count INTEGER NOT NULL DEFAULT 0, -- Total swipes today (resets daily)
  last_swipe_at TIMESTAMPTZ, -- Used for daily reset logic
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_explore_sessions_trip_user ON explore_sessions(trip_id, user_id);
CREATE INDEX IF NOT EXISTS idx_explore_sessions_user_id ON explore_sessions(user_id);

-- Enable Row Level Security
ALTER TABLE explore_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for explore_sessions
-- Note: Since we're using Clerk (not Supabase Auth), handle authorization in your application layer.
-- Users can only access their own explore_sessions (enforced in application code).
CREATE POLICY "Allow all operations on explore_sessions" ON explore_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_explore_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_explore_sessions_updated_at
  BEFORE UPDATE ON explore_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_explore_sessions_updated_at();

