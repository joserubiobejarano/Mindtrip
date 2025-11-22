-- Add budget and interests columns to trips table
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS budget_level TEXT,
  ADD COLUMN IF NOT EXISTS daily_budget NUMERIC,
  ADD COLUMN IF NOT EXISTS interests TEXT[];

