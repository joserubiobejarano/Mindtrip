-- Create trip_chat_messages table for Trip Assistant chat history
-- This table stores chat messages between users and the assistant for each trip
CREATE TABLE IF NOT EXISTS trip_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID or 'assistant'
  role TEXT NOT NULL, -- 'user' | 'assistant'
  content TEXT NOT NULL, -- plain text message
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_trip_chat_messages_trip_created ON trip_chat_messages(trip_id, created_at);
CREATE INDEX IF NOT EXISTS idx_trip_chat_messages_trip_id ON trip_chat_messages(trip_id);

-- Enable Row Level Security
ALTER TABLE trip_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trip_chat_messages
-- Note: Since we're using Clerk (not Supabase Auth), handle authorization in your application layer.
-- Only trip owner and members can read/write messages for that trip.
CREATE POLICY "Allow all operations on trip_chat_messages" ON trip_chat_messages
  FOR ALL USING (true) WITH CHECK (true);

