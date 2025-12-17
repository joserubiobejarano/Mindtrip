-- Add Explore usage limit columns to trip_members table
-- These track per-user-per-trip usage for swipe, change, and search-add actions

ALTER TABLE trip_members
ADD COLUMN IF NOT EXISTS swipe_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS change_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS search_add_count INTEGER DEFAULT 0;

-- Add index for performance when querying usage limits
CREATE INDEX IF NOT EXISTS idx_trip_members_usage ON trip_members(trip_id, user_id);

-- Add comment explaining the columns
COMMENT ON COLUMN trip_members.swipe_count IS 'Number of swipe actions (like/dislike) performed by this user for this trip';
COMMENT ON COLUMN trip_members.change_count IS 'Number of activity change/replace actions performed by this user for this trip';
COMMENT ON COLUMN trip_members.search_add_count IS 'Number of places added to itinerary via search by this user for this trip';
