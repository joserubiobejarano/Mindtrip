-- Create saved_places table for storing places saved from Explore tab
-- This table stores place data directly (not just references) for future itinerary generation
CREATE TABLE IF NOT EXISTS saved_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL, -- Google place_id
  name TEXT NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  photo_url TEXT,
  types TEXT[],
  source TEXT DEFAULT 'explore',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, place_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_saved_places_trip_id ON saved_places(trip_id);
CREATE INDEX IF NOT EXISTS idx_saved_places_place_id ON saved_places(place_id);

-- Enable Row Level Security
ALTER TABLE saved_places ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_places
-- Note: Since we're using Clerk (not Supabase Auth), handle authorization in your application layer.
-- Users can only access saved_places for trips they are members of (enforced in application code).
CREATE POLICY "Allow all operations on saved_places" ON saved_places
  FOR ALL USING (true) WITH CHECK (true);

