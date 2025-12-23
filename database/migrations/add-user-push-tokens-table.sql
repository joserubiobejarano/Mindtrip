-- Migration to create user_push_tokens table
-- Stores Expo push notification tokens for mobile devices
-- Supports multiple devices per user

-- Create user_push_tokens table
CREATE TABLE IF NOT EXISTS user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT CHECK (platform IN ('ios', 'android')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on user_id for fast lookups when sending notifications
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_id ON user_push_tokens(user_id);

-- Add index on token for fast upsert lookups
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_token ON user_push_tokens(token);

-- Enable Row Level Security (RLS)
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow all operations (auth handled in application layer using Clerk)
-- Consistent with other tables in the schema
CREATE POLICY "Allow all operations on user_push_tokens" ON user_push_tokens
  FOR ALL USING (true) WITH CHECK (true);

-- Add comment
COMMENT ON TABLE user_push_tokens IS 'Stores Expo push notification tokens for mobile devices. Each user can have multiple tokens (multiple devices).';

