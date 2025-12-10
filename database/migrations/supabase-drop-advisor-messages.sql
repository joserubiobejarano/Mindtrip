-- SQL script to drop advisor_messages table and related objects
-- Run this manually in Supabase SQL editor to clean up the live database
-- This script is safe to run multiple times (uses IF EXISTS)

-- Drop RLS policies on advisor_messages
DROP POLICY IF EXISTS "Users can insert their own advisor messages" ON advisor_messages;
DROP POLICY IF EXISTS "Users can select their own advisor messages" ON advisor_messages;

-- Disable RLS (optional but safe)
ALTER TABLE IF EXISTS advisor_messages DISABLE ROW LEVEL SECURITY;

-- Drop indexes
DROP INDEX IF EXISTS idx_advisor_messages_user_created;
DROP INDEX IF EXISTS idx_advisor_messages_user_id;

-- Drop the table
DROP TABLE IF EXISTS advisor_messages;

