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

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from("trip_members")
    .select("id")
    .eq("trip_id", tripId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMember) {
    // Already a member, no need to insert
    return;
  }

  // Get user's email and display name
  const email = user.primaryEmailAddress?.emailAddress || null;
  const displayName = user.fullName || user.firstName || null;

  // Insert owner as member
  const { error } = await (supabase
    .from("trip_members") as any)
    .insert({
      trip_id: tripId,
      user_id: user.id,
      email,
      display_name: displayName,
      role: "owner",
    });

  if (error) {
    throw new Error(`Failed to ensure owner member: ${error.message}`);
  }
}

