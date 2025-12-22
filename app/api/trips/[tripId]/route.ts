import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireTripOwner, tripOwnerErrorResponse } from "@/lib/auth/require-trip-owner";
import { validateParams } from "@/lib/validation/validate-request";
import { TripIdParamsSchema } from "@/lib/validation/api-schemas";
import { getProfileId } from "@/lib/auth/getProfileId";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    // Validate params
    const { tripId } = await validateParams(params, TripIdParamsSchema);
    const supabase = await createClient();

    // Verify user owns trip
    const ownerResult = await requireTripOwner(tripId, supabase);
    const profileId = ownerResult.profileId;

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
  } catch (error: unknown) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error('[Trips API]', {
      path: '/api/trips/[tripId]',
      method: 'DELETE',
      error: error instanceof Error ? error.message : 'Internal server error',
    });
    return tripOwnerErrorResponse(error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  let profileId: string | undefined;

  try {
    // Validate params
    const { tripId } = await validateParams(params, TripIdParamsSchema);
    const supabase = await createClient();

    // Get profile ID for authorization
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
    } catch (authError: any) {
      console.error('[Trips API]', {
        path: `/api/trips/${tripId}`,
        method: 'GET',
        error: authError?.message || 'Failed to get profile',
      });
      return NextResponse.json(
        { error: authError?.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if trip exists
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .single();

    if (tripError || !tripData) {
      console.error('[Trips API]', {
        path: `/api/trips/${tripId}`,
        method: 'GET',
        error: tripError?.message || 'Trip not found',
        profileId,
      });
      return NextResponse.json(
        { error: tripError?.message || 'Trip not found' },
        { status: 404 }
      );
    }

    // Check if user is owner
    type Trip = { owner_id: string; [key: string]: any };
    const isOwner = (tripData as Trip).owner_id === profileId;

    // Check if user is a member
    const { data: isMember } = await supabase
      .from("trip_members")
      .select("id")
      .eq("trip_id", tripId)
      .eq("user_id", profileId)
      .single();

    const hasAccess = isOwner || !!isMember;

    if (!hasAccess) {
      console.error('[Trips API]', {
        path: `/api/trips/${tripId}`,
        method: 'GET',
        error: 'User does not have access to this trip',
        profileId,
      });
      return NextResponse.json(
        { error: 'Unauthorized: You do not have access to this trip' },
        { status: 403 }
      );
    }

    console.log('[trips-get] tripId=', tripId, 'profileId=', profileId, 'access=', isOwner ? 'owner' : 'member');

    return NextResponse.json({
      trip: tripData,
    });
  } catch (error: unknown) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error('[Trips API]', {
      path: '/api/trips/[tripId]',
      method: 'GET',
      error: error instanceof Error ? error.message : 'Internal server error',
      profileId: profileId || 'unknown',
    });
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
