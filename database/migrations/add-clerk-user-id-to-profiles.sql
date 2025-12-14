-- Migration to add clerk_user_id column to profiles table
-- This enables proper lookup of profiles by Clerk user ID without UUID conflicts
-- Clerk user IDs are strings like "user_35oLHG0nQ6kzb4SqR8", not UUIDs

-- Add clerk_user_id column (nullable initially for existing records)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

-- Add unique index on clerk_user_id to ensure one profile per Clerk user
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON profiles(clerk_user_id) WHERE clerk_user_id IS NOT NULL;

-- Add regular index for performance on lookups
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id_lookup ON profiles(clerk_user_id);

-- Add comment
COMMENT ON COLUMN profiles.clerk_user_id IS 'Clerk user ID (e.g., "user_35oLHG0nQ6kzb4SqR8") - used for lookups instead of profiles.id to avoid UUID type conflicts';
