-- Migration to add welcome_email_sent_at column to profiles table
-- This enables idempotency checking for welcome email sending

-- Add welcome_email_sent_at column (nullable, NULL means email not sent yet)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMP WITH TIME ZONE;

-- Add comment
COMMENT ON COLUMN profiles.welcome_email_sent_at IS 'Timestamp when the welcome email was sent to the user (NULL if not sent yet)';
