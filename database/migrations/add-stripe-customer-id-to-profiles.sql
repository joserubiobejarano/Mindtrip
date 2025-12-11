-- Migration to add stripe_customer_id column to profiles table
-- This enables Stripe customer tracking for billing

-- Add stripe_customer_id column (nullable, as users may not have Stripe customer yet)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for billing and subscription management';
