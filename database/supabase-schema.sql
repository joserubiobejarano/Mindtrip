-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
-- Note: Using TEXT for id to support Clerk user IDs (e.g., "user_35oLHG0nQ6kzb4SqR8")
-- If you're using Supabase Auth, change this back to UUID REFERENCES auth.users(id)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trips table
-- Note: owner_id is TEXT to support Clerk user IDs
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  default_currency TEXT NOT NULL DEFAULT 'USD',
  owner_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trip_members table
-- Note: user_id is TEXT to support Clerk user IDs
CREATE TABLE IF NOT EXISTS trip_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'editor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id, user_id),
  UNIQUE(trip_id, email)
);

-- Create days table
CREATE TABLE IF NOT EXISTS days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id, date)
);

-- Create places table
CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  category TEXT,
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_id UUID NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  start_time TIME,
  end_time TIME,
  notes TEXT,
  order_number INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create checklists table
CREATE TABLE IF NOT EXISTS checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create checklist_items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  order_number INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL,
  category TEXT,
  paid_by_member_id UUID NOT NULL REFERENCES trip_members(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expense_shares table
CREATE TABLE IF NOT EXISTS expense_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES trip_members(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(expense_id, member_id)
);

-- Create trip_shares table
CREATE TABLE IF NOT EXISTS trip_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  public_slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trips_owner_id ON trips(owner_id);
CREATE INDEX IF NOT EXISTS idx_trip_members_trip_id ON trip_members(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_members_user_id ON trip_members(user_id);
CREATE INDEX IF NOT EXISTS idx_days_trip_id ON days(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_day_id ON activities(day_id);
CREATE INDEX IF NOT EXISTS idx_activities_place_id ON activities(place_id);
CREATE INDEX IF NOT EXISTS idx_checklists_trip_id ON checklists(trip_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_id ON checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expense_shares_expense_id ON expense_shares(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_shares_member_id ON expense_shares(member_id);
CREATE INDEX IF NOT EXISTS idx_trip_shares_public_slug ON trip_shares(public_slug);
CREATE INDEX IF NOT EXISTS idx_trip_shares_trip_id ON trip_shares(trip_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE days ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Note: Since we're using Clerk (not Supabase Auth), auth.uid() won't work.
-- These policies allow all operations - handle authorization in your application layer using Clerk.
-- If you switch to Supabase Auth, update these policies to use auth.uid().
CREATE POLICY "Allow all operations on profiles" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for trips
-- Note: Since we're using Clerk (not Supabase Auth), auth.uid() won't work.
-- These policies allow all operations - handle authorization in your application layer using Clerk.
-- IMPORTANT: Always verify user permissions in your application code before allowing operations.
CREATE POLICY "Allow all operations on trips" ON trips
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for trip_members
-- Note: Since we're using Clerk (not Supabase Auth), auth.uid() won't work.
-- These policies allow all operations - handle authorization in your application layer using Clerk.
-- IMPORTANT: Always verify user permissions in your application code before allowing operations.
CREATE POLICY "Allow all operations on trip_members" ON trip_members
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for days
-- Note: Since we're using Clerk (not Supabase Auth), handle authorization in your application layer.
CREATE POLICY "Allow all operations on days" ON days
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for places
CREATE POLICY "Anyone can view places" ON places
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations on places" ON places
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for activities
-- Note: Since we're using Clerk (not Supabase Auth), handle authorization in your application layer.
CREATE POLICY "Allow all operations on activities" ON activities
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for checklists
-- Note: Since we're using Clerk (not Supabase Auth), handle authorization in your application layer.
CREATE POLICY "Allow all operations on checklists" ON checklists
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for checklist_items
-- Note: Since we're using Clerk (not Supabase Auth), handle authorization in your application layer.
CREATE POLICY "Allow all operations on checklist_items" ON checklist_items
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for expenses
-- Note: Since we're using Clerk (not Supabase Auth), handle authorization in your application layer.
CREATE POLICY "Allow all operations on expenses" ON expenses
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for expense_shares
-- Note: Since we're using Clerk (not Supabase Auth), handle authorization in your application layer.
CREATE POLICY "Allow all operations on expense_shares" ON expense_shares
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for trip_shares
CREATE POLICY "Anyone can view public trip shares" ON trip_shares
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations on trip_shares" ON trip_shares
  FOR ALL USING (true) WITH CHECK (true);

-- Note: The handle_new_user function and trigger are removed since we're using Clerk, not Supabase Auth.
-- You should create profiles manually in your application code when a user signs up with Clerk.
-- Example: When a user signs up, create a profile record with their Clerk user ID.

