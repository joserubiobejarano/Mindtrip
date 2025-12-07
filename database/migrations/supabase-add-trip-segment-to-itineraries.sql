-- Add trip_segment_id column to smart_itineraries table
-- This links itineraries to specific trip segments for multi-city trips
-- Existing itineraries remain NULL (single-city trips)

ALTER TABLE smart_itineraries
ADD COLUMN IF NOT EXISTS trip_segment_id UUID REFERENCES trip_segments(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_smart_itineraries_segment_id ON smart_itineraries(trip_segment_id);

-- Add comment
COMMENT ON COLUMN smart_itineraries.trip_segment_id IS 'Links itinerary to a specific trip segment (NULL for single-city trips)';

