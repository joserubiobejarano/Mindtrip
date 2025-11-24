-- Add trip details fields to trips table
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS number_of_people INTEGER,
  ADD COLUMN IF NOT EXISTS hotel_address TEXT,
  ADD COLUMN IF NOT EXISTS find_accommodation BOOLEAN DEFAULT FALSE;

