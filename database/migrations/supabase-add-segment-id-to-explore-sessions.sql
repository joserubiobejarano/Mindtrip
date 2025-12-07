-- Add trip_segment_id column to explore_sessions table
-- This allows per-segment explore sessions for multi-city trips
-- Existing sessions remain NULL (trip-level sessions)

-- First, drop the existing unique constraint
ALTER TABLE explore_sessions
DROP CONSTRAINT IF EXISTS explore_sessions_trip_id_user_id_key;

-- Add the new column
ALTER TABLE explore_sessions
ADD COLUMN IF NOT EXISTS trip_segment_id UUID REFERENCES trip_segments(id) ON DELETE SET NULL;

-- Create new unique constraint that includes trip_segment_id
-- This allows one session per trip+user+segment combination
-- NULL trip_segment_id represents trip-level session
CREATE UNIQUE INDEX IF NOT EXISTS idx_explore_sessions_trip_user_segment 
ON explore_sessions(trip_id, user_id, COALESCE(trip_segment_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_explore_sessions_segment_id ON explore_sessions(trip_segment_id);

-- Add comment
COMMENT ON COLUMN explore_sessions.trip_segment_id IS 'Links explore session to a specific trip segment (NULL for trip-level sessions)';

