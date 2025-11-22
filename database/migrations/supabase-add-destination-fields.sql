-- Add destination fields to trips table
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS destination_name TEXT,
  ADD COLUMN IF NOT EXISTS destination_country TEXT,
  ADD COLUMN IF NOT EXISTS destination_place_id TEXT;

