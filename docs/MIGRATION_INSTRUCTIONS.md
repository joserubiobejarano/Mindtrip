# Migration Instructions: Fix Clerk User ID Compatibility

## Problem
The database schema was designed for Supabase Auth (using UUIDs), but the application uses Clerk for authentication (which provides string IDs like "user_35oLHG0nQ6kzb4SqR8"). This caused errors when trying to:
- Fetch trips: `invalid input syntax for type uuid: 'user_35oLHG0nQ6kzb4SqR8'`
- Create trips: `invalid input syntax for type uuid: 'user_35oLHG0nQ6kzb4SqR8n33aVPORu'`

## Solution
The database schema has been updated to use TEXT for user IDs instead of UUIDs, and RLS policies have been updated to work with Clerk.

## Steps to Apply the Fix

### 1. Run the Migration SQL
Execute the migration SQL file in your Supabase SQL Editor:

**File:** `database/migrations/supabase-migration-fix-clerk-ids.sql`

This migration will:
- Change `owner_id` in `trips` table from UUID to TEXT
- Change `user_id` in `trip_members` table from UUID to TEXT
- Remove foreign key constraints to `auth.users(id)`
- Update all RLS policies to work with Clerk (permissive policies)
- Remove Supabase Auth triggers and functions

### 2. Verify the Changes
After running the migration, verify that:
- Trips can be fetched without errors
- New trips can be created successfully
- User IDs are stored as TEXT (Clerk IDs)

## Important Security Note

**⚠️ IMPORTANT:** Since we're using Clerk instead of Supabase Auth, Row Level Security (RLS) policies have been set to permissive (allow all operations). This means:

1. **You MUST handle all authorization in your application code** using Clerk's authentication checks
2. Always verify user permissions before allowing database operations
3. Never trust client-side data - always validate on the server side

### Example Authorization Pattern

```typescript
// Server-side: Always check Clerk auth before database operations
import { auth } from "@clerk/nextjs/server";

export async function createTrip(data: TripData) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Only proceed if user is authenticated
  const supabase = await createClient();
  return await supabase.from("trips").insert({
    ...data,
    owner_id: userId, // Clerk user ID (TEXT)
  });
}
```

## Files Changed

1. **database/migrations/supabase-migration-fix-clerk-ids.sql** - Migration script to update existing database
2. **database/supabase-schema.sql** - Updated schema for future deployments (uses TEXT for user IDs)

## Testing

After applying the migration:
1. Try loading the trips page - should work without errors
2. Try creating a new trip - should work without errors
3. Verify that user IDs in the database are Clerk IDs (strings starting with "user_")

## Rollback (if needed)

If you need to rollback, you would need to:
1. Convert existing TEXT user IDs back to UUIDs (if you have a mapping)
2. Restore the original schema with UUID columns
3. Restore the original RLS policies

However, this is complex and not recommended unless absolutely necessary.

