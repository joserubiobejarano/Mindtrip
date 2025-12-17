-- Migration: Document RLS Strategy for Clerk
-- 
-- This migration adds comments to RLS policies explaining that they are intentionally
-- permissive because Kruno uses Clerk for authentication (not Supabase Auth).
-- All authorization happens in the application layer.
--
-- IMPORTANT: Do not change these policies to be restrictive without implementing
-- a custom RLS function that works with Clerk user IDs.

-- Add comments to existing policies
COMMENT ON POLICY "Allow all operations on profiles" ON profiles IS 
'Intentionally permissive RLS policy. Kruno uses Clerk for authentication, not Supabase Auth, so auth.uid() is not available. All authorization is enforced in the application layer via requireAuth() and related helpers.';

COMMENT ON POLICY "Allow all operations on trips" ON trips IS 
'Intentionally permissive RLS policy. Kruno uses Clerk for authentication, not Supabase Auth, so auth.uid() is not available. All authorization is enforced in the application layer via requireTripAccess() and requireTripOwner() helpers.';

COMMENT ON POLICY "Allow all operations on trip_members" ON trip_members IS 
'Intentionally permissive RLS policy. Kruno uses Clerk for authentication, not Supabase Auth, so auth.uid() is not available. All authorization is enforced in the application layer via requireTripAccess() helper.';

COMMENT ON POLICY "Allow all operations on days" ON days IS 
'Intentionally permissive RLS policy. Kruno uses Clerk for authentication, not Supabase Auth, so auth.uid() is not available. All authorization is enforced in the application layer via requireTripAccess() helper.';

COMMENT ON POLICY "Allow all operations on activities" ON activities IS 
'Intentionally permissive RLS policy. Kruno uses Clerk for authentication, not Supabase Auth, so auth.uid() is not available. All authorization is enforced in the application layer via requireTripAccess() helper.';

COMMENT ON POLICY "Allow all operations on checklists" ON checklists IS 
'Intentionally permissive RLS policy. Kruno uses Clerk for authentication, not Supabase Auth, so auth.uid() is not available. All authorization is enforced in the application layer via requireTripAccess() helper.';

COMMENT ON POLICY "Allow all operations on checklist_items" ON checklist_items IS 
'Intentionally permissive RLS policy. Kruno uses Clerk for authentication, not Supabase Auth, so auth.uid() is not available. All authorization is enforced in the application layer via requireTripAccess() helper.';

COMMENT ON POLICY "Allow all operations on expenses" ON expenses IS 
'Intentionally permissive RLS policy. Kruno uses Clerk for authentication, not Supabase Auth, so auth.uid() is not available. All authorization is enforced in the application layer via requireTripAccess() helper.';

COMMENT ON POLICY "Allow all operations on expense_shares" ON expense_shares IS 
'Intentionally permissive RLS policy. Kruno uses Clerk for authentication, not Supabase Auth, so auth.uid() is not available. All authorization is enforced in the application layer via requireTripAccess() helper.';

-- Note: The places table is intentionally public (anyone can view places)
-- This is by design for the Places API integration.

COMMENT ON POLICY "Anyone can view places" ON places IS 
'Public read access is intentional - places are shared data from Google Places API.';

COMMENT ON POLICY "Allow all operations on places" ON places IS 
'Intentionally permissive RLS policy. Kruno uses Clerk for authentication, not Supabase Auth, so auth.uid() is not available. All authorization is enforced in the application layer.';

COMMENT ON POLICY "Anyone can view public trip shares" ON trip_shares IS 
'Public read access is intentional - allows viewing public trip shares via /p/[slug] routes.';

COMMENT ON POLICY "Allow all operations on trip_shares" ON trip_shares IS 
'Intentionally permissive RLS policy. Kruno uses Clerk for authentication, not Supabase Auth, so auth.uid() is not available. All authorization is enforced in the application layer.';
