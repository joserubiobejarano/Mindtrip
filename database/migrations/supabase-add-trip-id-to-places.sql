-- Add trip_id column to places table
ALTER TABLE public.places
  ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES trips(id) ON DELETE CASCADE;

-- Update existing places to be nullable (or set a default if needed)
-- Note: Existing places won't have a trip_id, which is fine for now

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_places_trip_id ON places(trip_id);
CREATE INDEX IF NOT EXISTS idx_places_trip_external ON places(trip_id, external_id) WHERE trip_id IS NOT NULL AND external_id IS NOT NULL;

