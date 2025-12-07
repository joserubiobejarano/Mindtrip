-- Create trip_segments table for multi-city trips
-- Each segment represents a city/portion of a trip with its own date range
CREATE TABLE IF NOT EXISTS trip_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL, -- 0-based or 1-based, but consistent
  city_place_id TEXT NOT NULL, -- Google Places ID for the city
  city_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  transport_type TEXT, -- optional, e.g. 'train', 'flight'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_trip_segments_trip_order ON trip_segments(trip_id, order_index);
CREATE INDEX IF NOT EXISTS idx_trip_segments_trip_id ON trip_segments(trip_id);

-- Enable Row Level Security
ALTER TABLE trip_segments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trip_segments
-- Note: Since we're using Clerk (not Supabase Auth), handle authorization in your application layer.
-- Mirror the trips table policies - only trip owner and members can access segments.
CREATE POLICY "Allow all operations on trip_segments" ON trip_segments
  FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_trip_segments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_trip_segments_updated_at
  BEFORE UPDATE ON trip_segments
  FOR EACH ROW
  EXECUTE FUNCTION update_trip_segments_updated_at();

