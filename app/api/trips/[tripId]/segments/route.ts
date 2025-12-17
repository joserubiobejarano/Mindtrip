import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireTripAccess, tripAccessErrorResponse } from "@/lib/auth/require-trip-access";
import { requireTripPro, tripProErrorResponse } from "@/lib/auth/require-trip-pro";
import {
  getTripSegments,
  createTripSegment,
  updateTripSegment,
  deleteTripSegment,
} from "@/lib/supabase/trip-segments";
import { validateParams, validateBody } from "@/lib/validation/validate-request";
import { TripIdParamsSchema, CreateSegmentSchema, UpdateSegmentSchema } from "@/lib/validation/api-schemas";
import { z } from "zod";
import { addDays, format } from "date-fns";

// GET - Fetch all segments for a trip
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

    const { data: segments, error } = await getTripSegments(tripId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ segments: segments || [] });
  } catch (error: unknown) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error('[Segments API]', {
      path: '/api/trips/[tripId]/segments',
      method: 'GET',
      error: error instanceof Error ? error.message : 'Internal server error',
    });
    return tripAccessErrorResponse(error);
  }
}

// POST - Create new segment (Pro-only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    // Validate params and body
    const { tripId } = await validateParams(params, TripIdParamsSchema);
    const body = await validateBody(request, CreateSegmentSchema);
    const supabase = await createClient();

    // Verify user owns trip and has Pro (account or trip-level)
    const proUser = await requireTripPro(tripId, supabase);
    const trip = proUser.trip;

    // Get existing segments to determine order_index
    const { data: existingSegments } = await getTripSegments(tripId);
    const orderIndex = existingSegments?.length || 0;

    // Calculate dates from nights
    // Find the last segment's end date, or use trip start date
    let segmentStartDate: Date;
    if (existingSegments && existingSegments.length > 0) {
      const lastSegment = existingSegments[existingSegments.length - 1];
      segmentStartDate = addDays(new Date(lastSegment.end_date), 1);
    } else {
      segmentStartDate = new Date(trip.start_date);
    }

    const segmentEndDate = addDays(segmentStartDate, body.nights - 1);

    // Create segment
    const { data: segment, error } = await createTripSegment(
      tripId,
      {
        cityPlaceId: body.cityPlaceId,
        cityName: body.cityName,
        startDate: format(segmentStartDate, "yyyy-MM-dd"),
        endDate: format(segmentEndDate, "yyyy-MM-dd"),
        transportType: body.transportType,
        notes: body.notes,
      },
      orderIndex
    );

    if (error || !segment) {
      return NextResponse.json(
        { error: error?.message || "Failed to create segment" },
        { status: 500 }
      );
    }

    // Create days for this segment
    const days = [];
    let currentDate = segmentStartDate;
    const tripStart = new Date(trip.start_date);

    for (let i = 0; i < body.nights; i++) {
      const daysSinceTripStart = Math.floor(
        (currentDate.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      days.push({
        trip_id: tripId,
        trip_segment_id: segment.id,
        date: format(currentDate, "yyyy-MM-dd"),
        day_number: daysSinceTripStart + 1,
      });

      currentDate = addDays(currentDate, 1);
    }

    const { error: daysError } = await (supabase.from("days") as any).insert(days);

    if (daysError) {
      // Rollback: delete segment
      await deleteTripSegment(segment.id);
      return NextResponse.json(
        { error: daysError.message || "Failed to create days" },
        { status: 500 }
      );
    }

    return NextResponse.json({ segment });
  } catch (error: unknown) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error('[Segments API]', {
      path: '/api/trips/[tripId]/segments',
      method: 'POST',
      error: error instanceof Error ? error.message : 'Internal server error',
    });
    return tripProErrorResponse(error);
  }
}

// PATCH - Update segment (Pro-only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    // Validate params and body
    const { tripId } = await validateParams(params, TripIdParamsSchema);
    const body = await validateBody(request, UpdateSegmentSchema.extend({ 
      segmentId: z.string().uuid('Invalid segment ID format')
    }));
    const { segmentId, ...updates } = body;
    const supabase = await createClient();

    // Verify user owns trip and has Pro
    await requireTripPro(tripId, supabase);

    // Verify segment belongs to trip
    const { data: segment } = await supabase
      .from("trip_segments")
      .select("id")
      .eq("id", segmentId)
      .eq("trip_id", tripId)
      .single();

    if (!segment) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    }

    const { data: updatedSegment, error } = await updateTripSegment(
      segmentId,
      updates
    );

    if (error || !updatedSegment) {
      return NextResponse.json(
        { error: error?.message || "Failed to update segment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ segment: updatedSegment });
  } catch (error: unknown) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error('[Segments API]', {
      path: '/api/trips/[tripId]/segments',
      method: 'PATCH',
      error: error instanceof Error ? error.message : 'Internal server error',
    });
    return tripProErrorResponse(error);
  }
}

// DELETE - Delete segment (Pro-only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    // Validate params
    const { tripId } = await validateParams(params, TripIdParamsSchema);
    const { searchParams } = new URL(request.url);
    const segmentId = searchParams.get("segmentId");

    if (!segmentId || !z.string().uuid().safeParse(segmentId).success) {
      return NextResponse.json(
        { error: "Valid segmentId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user owns trip and has Pro
    await requireTripPro(tripId, supabase);

    // Verify segment belongs to trip
    const { data: segment } = await supabase
      .from("trip_segments")
      .select("id")
      .eq("id", segmentId)
      .eq("trip_id", tripId)
      .single();

    if (!segment) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    }

    const { error } = await deleteTripSegment(segmentId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error('[Segments API]', {
      path: '/api/trips/[tripId]/segments',
      method: 'DELETE',
      error: error instanceof Error ? error.message : 'Internal server error',
    });
    return tripProErrorResponse(error);
  }
}

