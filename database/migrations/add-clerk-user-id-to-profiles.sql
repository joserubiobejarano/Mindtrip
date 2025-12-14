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

-- Backfill: If any existing profiles.id values look like Clerk IDs (start with "user_"),
-- copy them to clerk_user_id and generate new UUIDs for id
-- This handles the case where profiles were created with Clerk IDs in the id column
DO $$
DECLARE
  profile_record RECORD;
  new_uuid UUID;
BEGIN
  FOR profile_record IN 
    SELECT id, email, full_name, avatar_url, created_at, welcome_email_sent_at, is_pro, default_currency, stripe_customer_id
    FROM profiles
    WHERE id::text LIKE 'user_%' AND clerk_user_id IS NULL
  LOOP
    -- Generate new UUID for id
    new_uuid := gen_random_uuid();
    
    -- Update the profile: set clerk_user_id to the old id, and id to new UUID
    UPDATE profiles
    SET 
      id = new_uuid,
      clerk_user_id = profile_record.id
    WHERE id = profile_record.id;
    
    RAISE NOTICE 'Migrated profile: old_id=%, new_id=%, clerk_user_id=%', 
      profile_record.id, new_uuid, profile_record.id;
  END LOOP;
END $$;
