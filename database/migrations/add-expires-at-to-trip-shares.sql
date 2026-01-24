-- Add optional expires_at field to trip_shares table
-- This allows share links to have an optional expiration date

ALTER TABLE trip_shares
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Add index for efficient expiry checks
CREATE INDEX IF NOT EXISTS idx_trip_shares_expires_at ON trip_shares(expires_at)
WHERE expires_at IS NOT NULL;
