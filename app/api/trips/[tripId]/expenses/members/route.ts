import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireTripAccess, tripAccessErrorResponse } from "@/lib/auth/require-trip-access";
import { validateParams } from "@/lib/validation/validate-request";
import { TripIdParamsSchema } from "@/lib/validation/api-schemas";

// GET /api/trips/[tripId]/expenses/members - Returns trip members for expense forms
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    // Validate params
    const { tripId } = await validateParams(params, TripIdParamsSchema);

    const supabase = await createClient();

    // Verify user has access to trip
    await requireTripAccess(tripId, supabase);

    // Fetch trip members
    const { data: members, error: membersError } = await supabase
      .from("trip_members")
      .select("id, email, display_name, user_id, role")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: true });

    if (membersError) {
      console.error("[Expenses Members API] Error fetching members:", membersError);
      return NextResponse.json(
        { error: "Failed to load trip members" },
        { status: 500 }
      );
    }

    // Sort by display_name if available, otherwise by email (same as web)
    const sortedMembers = (members || []).sort((a, b) => {
      const aName = a.display_name || a.email || "";
      const bName = b.display_name || b.email || "";
      return aName.localeCompare(bName);
    });

    return NextResponse.json({
      members: sortedMembers,
    });
  } catch (error: unknown) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("[Expenses Members API]", {
      path: "/api/trips/[tripId]/expenses/members",
      method: "GET",
      error: error instanceof Error ? error.message : "Internal server error",
    });
    return tripAccessErrorResponse(error);
  }
}

