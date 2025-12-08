-- Add trip personalization fields to trips table
ALTER TABLE public.trips
  -- Use travelers (if number_of_people exists, we'll keep both for now or migrate later)
  ADD COLUMN IF NOT EXISTS travelers INTEGER DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS origin_city_place_id TEXT,
  ADD COLUMN IF NOT EXISTS origin_city_name TEXT,
  ADD COLUMN IF NOT EXISTS has_accommodation BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS accommodation_place_id TEXT,
  ADD COLUMN IF NOT EXISTS accommodation_name TEXT,
  ADD COLUMN IF NOT EXISTS accommodation_address TEXT,
  ADD COLUMN IF NOT EXISTS arrival_transport_mode TEXT, -- plane/train/bus/car/unknown
  ADD COLUMN IF NOT EXISTS arrival_time_local TIME,
  ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- If number_of_people exists and travelers doesn't have data, migrate it
-- Note: This assumes number_of_people might have existing data
-- We'll keep both columns for backward compatibility

