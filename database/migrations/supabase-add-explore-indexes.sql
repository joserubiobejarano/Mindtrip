-- Add indexes for Explore feature performance
-- Run this migration after creating the explore_sessions table

-- Index for explore_sessions lookups (trip_id + user_id is already unique, but add index for faster queries)
CREATE INDEX IF NOT EXISTS idx_explore_sessions_trip_user 
ON explore_sessions(trip_id, user_id);

-- Index for explore_sessions by user_id (for user-level queries)
CREATE INDEX IF NOT EXISTS idx_explore_sessions_user 
ON explore_sessions(user_id);

-- Index for explore_sessions by last_swipe_at (for daily reset queries)
CREATE INDEX IF NOT EXISTS idx_explore_sessions_last_swipe 
ON explore_sessions(last_swipe_at);

-- Index for smart_itineraries by trip_id (for itinerary lookups)
CREATE INDEX IF NOT EXISTS idx_smart_itineraries_trip 
ON smart_itineraries(trip_id);

-- Index for trips by center coordinates (for location-based queries)
CREATE INDEX IF NOT EXISTS idx_trips_center_coords 
ON trips(center_lat, center_lng) 
WHERE center_lat IS NOT NULL AND center_lng IS NOT NULL;

-- Index for activities by day_id (for day-level queries)
CREATE INDEX IF NOT EXISTS idx_activities_day 
ON activities(day_id);

-- Note: places table uses external_id (Google place_id), not place_id
-- Index for places by external_id (for place lookups by Google place_id)
CREATE INDEX IF NOT EXISTS idx_places_external_id 
ON places(external_id) 
WHERE external_id IS NOT NULL;

