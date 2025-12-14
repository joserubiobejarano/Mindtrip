import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const supabase = await createClient();

    // Update trip_members entries where email matches and user_id is null
    const { data, error } = await (supabase
      .from("trip_members") as any)
      .update({ user_id: userId })
      .eq("email", userEmail.toLowerCase())
      .is("user_id", null)
      .select();

    if (error) {
      console.error("Error linking trip invitations:", error);
      return NextResponse.json(
        { error: "Failed to link trip invitations" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      linkedCount: data?.length || 0,
    });
  } catch (error) {
    console.error("Error in link-trip-invitations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

