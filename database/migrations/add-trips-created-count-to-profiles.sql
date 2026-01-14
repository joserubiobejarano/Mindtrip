-- Migration to add trips_created_count column to profiles table
-- This tracks the total number of trips ever created by a user to enforce free tier limits
-- Once a free user creates 2 trips, they cannot create more even if they delete existing trips

-- Add trips_created_count column (defaults to 0 for new users)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS trips_created_count INTEGER NOT NULL DEFAULT 0;

-- Initialize existing users: Set trips_created_count to their current trip count
-- This ensures existing users get credit for trips they've already created
-- Note: Cast both sides to TEXT to handle type mismatch (profiles.id may be UUID, trips.owner_id is TEXT)
UPDATE profiles
SET trips_created_count = (
  SELECT COUNT(*)
  FROM trips
  WHERE trips.owner_id::TEXT = profiles.id::TEXT
)
WHERE trips_created_count = 0;

-- Add index for faster lookups when checking trip limits
CREATE INDEX IF NOT EXISTS idx_profiles_trips_created_count ON profiles(trips_created_count);

-- Add comment
COMMENT ON COLUMN profiles.trips_created_count IS 'Total number of trips ever created by this user. Used to enforce free tier limit of 2 trips. Does not decrease when trips are deleted.';
