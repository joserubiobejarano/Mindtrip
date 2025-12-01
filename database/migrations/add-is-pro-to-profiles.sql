-- Migration to add is_pro column to profiles table
-- This enables Pro subscription status checking

-- Add is_pro column (defaults to false for existing users)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN NOT NULL DEFAULT false;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_pro ON profiles(is_pro) WHERE is_pro = true;

-- Add comment
COMMENT ON COLUMN profiles.is_pro IS 'Whether the user has a Pro subscription';

