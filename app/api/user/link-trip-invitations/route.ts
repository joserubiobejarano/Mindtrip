import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Links the current user's email to any trip_members entries that have matching email but null user_id.
 * This allows invited users to see trips in their "My Trips" section after signing up.
 */
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's email from Clerk
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Normalize email to lowercase for case-insensitive matching
    const normalizedEmail = userEmail.toLowerCase().trim();

    // Use admin client to bypass RLS when updating trip_members with null user_id
    const supabase = createSupabaseAdmin();

    // Find all trip_members entries where email matches (case-insensitive) and user_id is null
    const { data: pendingInvites, error: findError } = await supabase
      .from("trip_members")
      .select("id, trip_id, email")
      .ilike("email", normalizedEmail)
      .is("user_id", null);

    if (findError) {
      console.error("Error finding pending trip invitations:", findError);
      return NextResponse.json(
        { error: "Failed to find trip invitations" },
        { status: 500 }
      );
    }

    if (!pendingInvites || pendingInvites.length === 0) {
      return NextResponse.json({
        success: true,
        linkedTripIds: [],
        linkedCount: 0,
      });
    }

    // Extract trip IDs before updating
    type PendingInvite = { id: string; trip_id: string; email: string | null };
    const tripIds = ((pendingInvites || []) as PendingInvite[]).map((invite) => invite.trip_id);

    // Update all matching trip_members entries to set user_id
    const { data: updatedMembers, error: updateError } = await (supabase
      .from("trip_members") as any)
      .update({ user_id: userId })
      .in("id", ((pendingInvites || []) as PendingInvite[]).map((invite) => invite.id))
      .select("trip_id");

    if (updateError) {
      console.error("Error linking trip invitations:", updateError);
      return NextResponse.json(
        { error: "Failed to link trip invitations" },
        { status: 500 }
      );
    }

    // Extract unique trip IDs from updated members
    type UpdatedMember = { trip_id: string };
    const linkedTripIds = Array.from(
      new Set(((updatedMembers || []) as UpdatedMember[]).map((member) => member.trip_id))
    );

    return NextResponse.json({
      success: true,
      linkedTripIds,
      linkedCount: linkedTripIds.length,
    });
  } catch (error) {
    console.error("Error in link-trip-invitations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

