-- Add center_lat and center_lng columns to trips table
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS center_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS center_lng DOUBLE PRECISION;

