-- Add itinerary column to trips table to store the AI generated story/plan
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS itinerary JSONB;

