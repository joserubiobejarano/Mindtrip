-- Migration to fix Clerk user ID compatibility
-- This changes UUID columns to TEXT to support Clerk user IDs (e.g., "user_35oLHG0nQ6kzb4SqR8")

-- Step 1: Drop foreign key constraints
ALTER TABLE IF EXISTS trip_members DROP CONSTRAINT IF EXISTS trip_members_user_id_fkey;
ALTER TABLE IF EXISTS trips DROP CONSTRAINT IF EXISTS trips_owner_id_fkey;
ALTER TABLE IF EXISTS profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 2: Drop all existing policies FIRST (before altering columns)
-- Policies must be dropped before we can alter column types
-- Since auth.uid() won't work with Clerk, we'll need to handle auth in the app layer
-- IMPORTANT: Handle all authorization in your application code using Clerk's auth checks!

-- Drop all existing policies that use auth.uid()
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view own trips" ON trips;
DROP POLICY IF EXISTS "Trip members can view trips" ON trips;
DROP POLICY IF EXISTS "Users can create trips" ON trips;
DROP POLICY IF EXISTS "Owners can update trips" ON trips;
DROP POLICY IF EXISTS "Owners can delete trips" ON trips;

DROP POLICY IF EXISTS "Users can view trip members of their trips" ON trip_members;
DROP POLICY IF EXISTS "Trip owners can manage members" ON trip_members;

DROP POLICY IF EXISTS "Users can view days of accessible trips" ON days;
DROP POLICY IF EXISTS "Users can manage days of owned trips" ON days;

DROP POLICY IF EXISTS "Authenticated users can insert places" ON places;

DROP POLICY IF EXISTS "Users can view activities of accessible trips" ON activities;
DROP POLICY IF EXISTS "Editors can manage activities" ON activities;

DROP POLICY IF EXISTS "Users can view checklists of accessible trips" ON checklists;
DROP POLICY IF EXISTS "Editors can manage checklists" ON checklists;

DROP POLICY IF EXISTS "Users can view checklist items of accessible checklists" ON checklist_items;
DROP POLICY IF EXISTS "Editors can manage checklist items" ON checklist_items;

DROP POLICY IF EXISTS "Users can view expenses of accessible trips" ON expenses;
DROP POLICY IF EXISTS "Editors can manage expenses" ON expenses;

DROP POLICY IF EXISTS "Users can view expense shares of accessible expenses" ON expense_shares;
DROP POLICY IF EXISTS "Editors can manage expense shares" ON expense_shares;

DROP POLICY IF EXISTS "Trip owners can manage shares" ON trip_shares;

-- Step 3: Now we can safely alter column types (policies are dropped)
-- Change owner_id in trips table from UUID to TEXT
ALTER TABLE IF EXISTS trips 
  ALTER COLUMN owner_id TYPE TEXT USING owner_id::TEXT;

-- Step 4: Change user_id in trip_members table from UUID to TEXT
ALTER TABLE IF EXISTS trip_members 
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Step 5: Change id in profiles table from UUID to TEXT (if it exists and needs to store Clerk IDs)
-- Note: This might break if profiles are still using UUIDs, so we'll keep it as UUID for now
-- but remove the foreign key constraint. If you need to store Clerk IDs in profiles, uncomment:
-- ALTER TABLE IF EXISTS profiles 
--   ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- Step 6: Recreate permissive policies (handle auth in app layer with Clerk)
-- IMPORTANT: Always verify user permissions in your application code before allowing operations!
CREATE POLICY "Allow all operations on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on trips" ON trips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on trip_members" ON trip_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on days" ON days FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on places" ON places FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on activities" ON activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on checklists" ON checklists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on checklist_items" ON checklist_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on expense_shares" ON expense_shares FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on trip_shares" ON trip_shares FOR ALL USING (true) WITH CHECK (true);

-- Step 7: Drop the trigger and function for Supabase Auth (not needed with Clerk)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

