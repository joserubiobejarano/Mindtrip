import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfileId } from "@/lib/auth/getProfileId";
import { getTripProStatus } from "@/lib/supabase/pro-status";
import {
  getTripSegments,
  createTripSegment,
  updateTripSegment,
  deleteTripSegment,
} from "@/lib/supabase/trip-segments";
import type { CreateSegmentPayload, UpdateSegmentPayload } from "@/types/trip-segments";
import { addDays, format } from "date-fns";

// GET - Fetch all segments for a trip
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  let profileId: string | undefined;
  let tripId: string | undefined;
  
  try {
    tripId = (await params).tripId;
    const supabase = await createClient();

    // Get profile ID for authorization
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
    } catch (authError: any) {
      console.error('[Segments API]', {
        path: '/api/trips/[tripId]/segments',
        method: 'GET',
        error: authError?.message || 'Failed to get profile',
        tripId,
      });
      return NextResponse.json(
        { error: authError?.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has access to trip
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select("id, owner_id")
      .eq("id", tripId)
      .single();

    if (tripError || !tripData) {
      console.error('[Segments API]', {
        path: '/api/trips/[tripId]/segments',
        method: 'GET',
        tripId,
        profileId,
        error: tripError?.message || 'Trip not found',
        errorCode: tripError?.code,
        context: 'trip_lookup',
      });
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    type TripQueryResult = {
      id: string
      owner_id: string
    }

    const trip = tripData as TripQueryResult;

    // Check if user is owner or member
    const { data: member } = await supabase
      .from("trip_members")
      .select("id")
      .eq("trip_id", tripId)
      .eq("user_id", profileId)
      .single();

    if (trip.owner_id !== profileId && !member) {
      console.error('[Segments API]', {
        path: '/api/trips/[tripId]/segments',
        method: 'GET',
        tripId,
        profileId,
        error: 'Forbidden: User does not have access to this trip',
        context: 'authorization_check',
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: segments, error } = await getTripSegments(tripId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ segments: segments || [] });
  } catch (error: any) {
    console.error('[Segments API]', {
      path: '/api/trips/[tripId]/segments',
      method: 'GET',
      tripId: tripId || 'unknown',
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

// POST - Create new segment (Pro-only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  let profileId: string | undefined;
  let tripId: string | undefined;
  
  try {
    tripId = (await params).tripId;
    const body: CreateSegmentPayload = await request.json();
    const supabase = await createClient();

    // Get profile ID for authorization
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
    } catch (authError: any) {
      console.error('[Segments API]', {
        path: '/api/trips/[tripId]/segments',
        method: 'POST',
        error: authError?.message || 'Failed to get profile',
        tripId,
      });
      return NextResponse.json(
        { error: authError?.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user owns trip first (needed for Pro status check)
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select("id, owner_id, start_date, end_date")
      .eq("id", tripId)
      .single();

    if (tripError || !tripData) {
      console.error('[Segments API]', {
        path: '/api/trips/[tripId]/segments',
        method: 'POST',
        tripId,
        profileId,
        error: tripError?.message || 'Trip not found',
        errorCode: tripError?.code,
        context: 'trip_lookup',
      });
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    type TripQueryResult = {
      id: string
      owner_id: string
      start_date: string
      end_date: string
    }

    const trip = tripData as TripQueryResult;

    if (trip.owner_id !== profileId) {
      console.error('[Segments API]', {
        path: '/api/trips/[tripId]/segments',
        method: 'POST',
        tripId,
        profileId,
        error: 'Forbidden: User does not own this trip',
        context: 'authorization_check',
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check trip Pro status (account Pro OR trip Pro)
    // Note: getTripProStatus expects clerkUserId
    const authResult = await getProfileId(supabase);
    const { isProForThisTrip } = await getTripProStatus(supabase, authResult.clerkUserId, tripId);
    if (!isProForThisTrip) {
      return NextResponse.json(
        { 
          error: "Pro subscription or trip unlock required for multi-city trips",
          plan_required: 'pro_or_trip_unlock'
        },
        { status: 403 }
      );
    }

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
  } catch (error: any) {
    console.error('[Segments API]', {
      path: '/api/trips/[tripId]/segments',
      method: 'POST',
      tripId: tripId || 'unknown',
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

// PATCH - Update segment (Pro-only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  let profileId: string | undefined;
  let tripId: string | undefined;
  
  try {
    tripId = (await params).tripId;
    const body: UpdateSegmentPayload & { segmentId: string } = await request.json();
    const { segmentId, ...updates } = body;
    const supabase = await createClient();

    // Get profile ID for authorization
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
    } catch (authError: any) {
      console.error('[Segments API]', {
        path: '/api/trips/[tripId]/segments',
        method: 'PATCH',
        error: authError?.message || 'Failed to get profile',
        tripId,
      });
      return NextResponse.json(
        { error: authError?.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user owns trip first
    const { data: tripData } = await supabase
      .from("trips")
      .select("owner_id")
      .eq("id", tripId)
      .single();

    type TripQueryResult = {
      owner_id: string
    }

    const trip = tripData as TripQueryResult | null;

    if (!trip || trip.owner_id !== profileId) {
      console.error('[Segments API]', {
        path: '/api/trips/[tripId]/segments',
        method: 'PATCH',
        tripId,
        profileId,
        error: 'Forbidden: User does not own this trip',
        context: 'authorization_check',
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check trip Pro status (account Pro OR trip Pro)
    // Note: getTripProStatus expects clerkUserId
    const authResult = await getProfileId(supabase);
    const { isProForThisTrip } = await getTripProStatus(supabase, authResult.clerkUserId, tripId);
    if (!isProForThisTrip) {
      return NextResponse.json(
        { 
          error: "Pro subscription or trip unlock required",
          plan_required: 'pro_or_trip_unlock'
        },
        { status: 403 }
      );
    }

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
  } catch (error: any) {
    console.error('[Segments API]', {
      path: '/api/trips/[tripId]/segments',
      method: 'PATCH',
      tripId: tripId || 'unknown',
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

// DELETE - Delete segment (Pro-only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  let profileId: string | undefined;
  let tripId: string | undefined;
  
  try {
    tripId = (await params).tripId;
    const { searchParams } = new URL(request.url);
    const segmentId = searchParams.get("segmentId");

    if (!segmentId) {
      return NextResponse.json(
        { error: "segmentId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get profile ID for authorization
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
    } catch (authError: any) {
      console.error('[Segments API]', {
        path: '/api/trips/[tripId]/segments',
        method: 'DELETE',
        error: authError?.message || 'Failed to get profile',
        tripId,
      });
      return NextResponse.json(
        { error: authError?.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user owns trip first
    const { data: tripData } = await supabase
      .from("trips")
      .select("owner_id")
      .eq("id", tripId)
      .single();

    type TripQueryResult = {
      owner_id: string
    }

    const trip = tripData as TripQueryResult | null;

    if (!trip || trip.owner_id !== profileId) {
      console.error('[Segments API]', {
        path: '/api/trips/[tripId]/segments',
        method: 'DELETE',
        tripId,
        profileId,
        error: 'Forbidden: User does not own this trip',
        context: 'authorization_check',
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check trip Pro status (account Pro OR trip Pro)
    // Note: getTripProStatus expects clerkUserId
    const authResult = await getProfileId(supabase);
    const { isProForThisTrip } = await getTripProStatus(supabase, authResult.clerkUserId, tripId);
    if (!isProForThisTrip) {
      return NextResponse.json(
        { 
          error: "Pro subscription or trip unlock required",
          plan_required: 'pro_or_trip_unlock'
        },
        { status: 403 }
      );
    }

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
  } catch (error: any) {
    console.error('[Segments API]', {
      path: '/api/trips/[tripId]/segments',
      method: 'DELETE',
      tripId: tripId || 'unknown',
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

