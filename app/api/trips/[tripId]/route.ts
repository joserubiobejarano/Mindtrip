import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireTripOwner, tripOwnerErrorResponse } from "@/lib/auth/require-trip-owner";
import { validateParams } from "@/lib/validation/validate-request";
import { TripIdParamsSchema } from "@/lib/validation/api-schemas";

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
