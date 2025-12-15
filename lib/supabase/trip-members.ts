import { createClient } from "@/lib/supabase/client";
import type { User } from "@clerk/nextjs/server";

/**
 * Ensures the current user is a trip member with owner role.
 * If not found, inserts a row with role 'owner', email, and display_name from the user.
 * 
 * @param tripId - The trip ID
 * @param user - The Clerk user object (from useUser hook)
 * @returns Promise that resolves when the member is ensured
 */
export async function ensureOwnerMember(
  tripId: string,
  user: { id: string; primaryEmailAddress?: { emailAddress: string } | null; fullName?: string | null; firstName?: string | null } | null
): Promise<void> {
  if (!user?.id) {
    throw new Error("User must be authenticated");
  }

  const supabase = createClient();

  // Get user's email and display name
  const email = user.primaryEmailAddress?.emailAddress || null;
  const displayName = user.fullName || user.firstName || null;
  const profileId = user.id;

  // Use upsert to idempotently ensure owner member
  // This prevents 409 errors if the member already exists
  const { error } = await (supabase
    .from("trip_members") as any)
    .upsert({
      trip_id: tripId,
      user_id: profileId,
      email,
      display_name: displayName,
      role: "owner",
    }, {
      onConflict: 'trip_id,email'
    });

  if (error) {
    console.error('[trip-members]', { tripId, email, profileId, action: 'upsert_owner_member', error: error.message });
    throw new Error(`Failed to ensure owner member: ${error.message}`);
  }

  console.log('[trip-members]', { tripId, email, profileId, action: 'upsert_owner_member' });
}

