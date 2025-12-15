import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfileId } from "@/lib/auth/getProfileId";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  let profileId: string | undefined;

  try {
    const { tripId } = await params;
    const supabase = await createClient();

    // Get profile ID for authorization
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
    } catch (authError: any) {
      console.error('[Trips API]', {
        path: `/api/trips/${tripId}`,
        method: 'DELETE',
        error: authError?.message || 'Failed to get profile',
      });
      return NextResponse.json(
        { error: authError?.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch trip to verify ownership
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select("id, owner_id")
      .eq("id", tripId)
      .single();

    if (tripError || !tripData) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    type TripQueryResult = {
      id: string
      owner_id: string
    }

    const trip = tripData as TripQueryResult;

    // Verify ownership
    if (trip.owner_id !== profileId) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own trips" },
        { status: 403 }
      );
    }

    // Delete trip (cascade will handle dependent records via ON DELETE CASCADE)
    const { error: deleteError } = await supabase
      .from("trips")
      .delete()
      .eq("id", tripId);

    if (deleteError) {
      console.error('[Trips API]', {
        path: `/api/trips/${tripId}`,
        method: 'DELETE',
        error: deleteError.message,
        profileId,
      });
      return NextResponse.json(
        { error: deleteError.message || "Failed to delete trip" },
        { status: 500 }
      );
    }

    console.log('[trip-delete] deleted trip', { tripId, profileId });

    return NextResponse.json({
      ok: true,
    });
  } catch (error: any) {
    console.error('[Trips API]', {
      path: `/api/trips/${params ? (await params).tripId : 'unknown'}`,
      method: 'DELETE',
      profileId: profileId || 'unknown',
      error: error?.message || 'Internal server error',
      errorCode: error?.code,
    });
    return NextResponse.json(
      {
        error: error?.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
