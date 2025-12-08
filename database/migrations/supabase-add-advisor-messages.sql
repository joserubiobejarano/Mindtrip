-- Create advisor_messages table for Travel Advisor chat history
-- This table stores chat messages between users and the advisor (pre-trip planning)
CREATE TABLE IF NOT EXISTS advisor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups and counting
CREATE INDEX IF NOT EXISTS idx_advisor_messages_user_created ON advisor_messages(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_advisor_messages_user_id ON advisor_messages(user_id);

-- Enable Row Level Security
ALTER TABLE advisor_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for advisor_messages
-- Note: Since we're using Clerk (not Supabase Auth), handle authorization in your application layer.
-- Users can only insert and select their own messages.
CREATE POLICY "Users can insert their own advisor messages" ON advisor_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can select their own advisor messages" ON advisor_messages
  FOR SELECT USING (true);

