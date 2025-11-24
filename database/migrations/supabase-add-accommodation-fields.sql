-- Add accommodation fields to trips table
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS accommodation_address TEXT,
  ADD COLUMN IF NOT EXISTS auto_accommodation JSONB;

