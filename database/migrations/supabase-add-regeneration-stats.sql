-- Create trip_regeneration_stats table to track Smart Itinerary regenerations per trip per day
-- This allows us to limit regeneration attempts based on user subscription tier

CREATE TABLE IF NOT EXISTS trip_regeneration_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id, date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trip_regeneration_stats_trip_id ON trip_regeneration_stats(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_regeneration_stats_date ON trip_regeneration_stats(date);
CREATE INDEX IF NOT EXISTS idx_trip_regeneration_stats_trip_date ON trip_regeneration_stats(trip_id, date);

-- Enable Row Level Security
ALTER TABLE trip_regeneration_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trip_regeneration_stats
-- Note: Since we're using Clerk (not Supabase Auth), handle authorization in your application layer.
CREATE POLICY "Allow all operations on trip_regeneration_stats" ON trip_regeneration_stats
  FOR ALL USING (true) WITH CHECK (true);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_trip_regeneration_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trip_regeneration_stats_updated_at
  BEFORE UPDATE ON trip_regeneration_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_trip_regeneration_stats_updated_at();

