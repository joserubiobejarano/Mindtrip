-- Add default_currency column to profiles table if it doesn't exist
ALTER TABLE IF EXISTS profiles 
ADD COLUMN IF NOT EXISTS default_currency TEXT NOT NULL DEFAULT 'USD';

