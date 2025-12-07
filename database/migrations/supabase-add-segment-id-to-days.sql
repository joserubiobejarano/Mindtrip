-- Add trip_segment_id column to days table
-- This links days to specific trip segments for multi-city trips
-- Existing days remain NULL (backward compatible with single-city trips)

ALTER TABLE days
ADD COLUMN IF NOT EXISTS trip_segment_id UUID REFERENCES trip_segments(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_days_segment_id ON days(trip_segment_id);

-- Add comment
COMMENT ON COLUMN days.trip_segment_id IS 'Links day to a specific trip segment (NULL for single-city trips)';

