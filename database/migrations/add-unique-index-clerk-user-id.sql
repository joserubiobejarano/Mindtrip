-- Add unique index on clerk_user_id to prevent duplicate profiles
-- Postgres allows multiple NULLs in unique indexes, so this enforces uniqueness only for non-NULL values
CREATE UNIQUE INDEX IF NOT EXISTS profiles_clerk_user_id_key ON profiles (clerk_user_id);
