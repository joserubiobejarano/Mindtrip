-- Add image_url column to activities table
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS image_url TEXT;
