-- Migration to add trip-level Pro fields to trips table
-- This enables per-trip Pro unlocks ($6.99 one-time payment)

-- Add has_trip_pro column (defaults to false for existing trips)
ALTER TABLE trips
ADD COLUMN IF NOT EXISTS has_trip_pro BOOLEAN NOT NULL DEFAULT false;

-- Add stripe_trip_payment_id column (nullable, stores payment intent ID)
ALTER TABLE trips
ADD COLUMN IF NOT EXISTS stripe_trip_payment_id TEXT;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_trips_has_trip_pro ON trips(has_trip_pro) WHERE has_trip_pro = true;
CREATE INDEX IF NOT EXISTS idx_trips_stripe_trip_payment_id ON trips(stripe_trip_payment_id) WHERE stripe_trip_payment_id IS NOT NULL;

-- Add comments
COMMENT ON COLUMN trips.has_trip_pro IS 'Whether this trip has been unlocked with a one-time Pro payment';
COMMENT ON COLUMN trips.stripe_trip_payment_id IS 'Stripe payment intent ID for the trip unlock payment';
