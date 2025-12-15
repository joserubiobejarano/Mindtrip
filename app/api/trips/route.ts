import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfileId } from "@/lib/auth/getProfileId";
import { getUserSubscriptionStatus } from "@/lib/supabase/user-subscription";
import { createTripSegment } from "@/lib/supabase/trip-segments";
import { getPlaceDetails, findGooglePlaceId } from "@/lib/google/places-server";
import { eachDayOfInterval, format, addDays } from "date-fns";
import type { TripPersonalizationPayload } from "@/types/trip-personalization";

interface NewTripPayload {
  destinationPlaceId: string;
  destinationName?: string;
  destinationCenter?: [number, number];
  startDate: string;
  endDate: string;
  travelers?: number;
  segments?: Array<{
    cityPlaceId: string;
    cityName: string;
    nights: number;
  }>;
  personalization?: TripPersonalizationPayload;
}

export async function POST(request: NextRequest) {
  let profileId: string | undefined;
  
  try {
    const supabase = await createClient();

    // Get profile ID for authorization
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
    } catch (authError: any) {
      console.error('[Trips API]', {
        path: '/api/trips',
        method: 'POST',
        error: authError?.message || 'Failed to get profile',
      });
      return NextResponse.json(
        { error: authError?.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: NewTripPayload = await request.json();
    const { destinationPlaceId, destinationName, destinationCenter, startDate, endDate, segments, personalization } = body;

    // Extract personalization data with defaults
    const {
      travelers = 1,
      originCityPlaceId,
      originCityName,
      hasAccommodation = false,
      accommodationPlaceId,
      accommodationName,
      accommodationAddress,
      arrivalTransportMode,
      arrivalTimeLocal,
      interests = [],
    } = personalization ?? {};

    if (!destinationPlaceId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "destinationPlaceId, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    // Check subscription status
    // Note: getUserSubscriptionStatus expects clerkUserId
    const authResult = await getProfileId(supabase);
    const { isPro } = await getUserSubscriptionStatus(authResult.clerkUserId);

    // Determine segments to create
    let segmentsToCreate: Array<{
      cityPlaceId: string;
      cityName: string;
      startDate: string;
      endDate: string;
    }> = [];

    if (isPro && segments && segments.length > 0) {
      // Multi-city trip: compute dates from nights
      const tripStart = new Date(startDate);
      let currentDate = tripStart;

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const segmentStart = new Date(currentDate);
        const segmentEnd = addDays(segmentStart, segment.nights - 1);

        segmentsToCreate.push({
          cityPlaceId: segment.cityPlaceId,
          cityName: segment.cityName,
          startDate: format(segmentStart, "yyyy-MM-dd"),
          endDate: format(segmentEnd, "yyyy-MM-dd"),
        });

        // Next segment starts the day after this one ends
        currentDate = addDays(segmentEnd, 1);
      }
    } else {
      // Single-city trip: use destinationPlaceId and full date range
      // destinationPlaceId is a Mapbox ID, we need to convert it to Google Place ID
      let googlePlaceId: string | null = null;
      let cityName = destinationName || "Unknown City";
      let placeDetails: any = null;
      
      // Use the place name to find Google Place ID
      if (destinationName) {
        // Use coordinates if available for better accuracy
        if (destinationCenter && destinationCenter.length === 2) {
          googlePlaceId = await findGooglePlaceId(destinationName, destinationCenter[1], destinationCenter[0]);
        } else {
          googlePlaceId = await findGooglePlaceId(destinationName);
        }
        
        if (googlePlaceId) {
          placeDetails = await getPlaceDetails(googlePlaceId);
          cityName = placeDetails?.name || destinationName;
        }
      } else {
        // Fallback: try to use destinationPlaceId as Google Place ID (in case it's already a Google ID)
        placeDetails = await getPlaceDetails(destinationPlaceId);
        if (placeDetails) {
          cityName = placeDetails.name;
          googlePlaceId = destinationPlaceId;
        }
      }

      segmentsToCreate = [
        {
          cityPlaceId: googlePlaceId || destinationPlaceId,
          cityName,
          startDate,
          endDate,
        },
      ];
    }

    // Get primary city details for trip title
    const primaryPlaceId = segmentsToCreate[0].cityPlaceId;
    let primaryPlaceDetails: any = null;
    
    // Check if it's a Google Place ID (starts with specific pattern) or Mapbox ID
    if (primaryPlaceId && !primaryPlaceId.startsWith('place.')) {
      // Likely a Google Place ID
      primaryPlaceDetails = await getPlaceDetails(primaryPlaceId);
    } else if (segmentsToCreate[0].cityName && segmentsToCreate[0].cityName !== "Unknown City") {
      // Try to find Google Place ID from city name
      const googlePlaceId = await findGooglePlaceId(segmentsToCreate[0].cityName);
      if (googlePlaceId) {
        primaryPlaceDetails = await getPlaceDetails(googlePlaceId);
      }
    }
    
    const primaryCityName = primaryPlaceDetails?.name || segmentsToCreate[0].cityName;
    const primaryCountry = primaryPlaceDetails?.formatted_address
      ?.split(",")
      .slice(-1)[0]
      .trim() || null;

    // Generate trip title
    const tripStart = new Date(startDate);
    const tripEnd = new Date(endDate);
    const title =
      segmentsToCreate.length > 1
        ? `${segmentsToCreate.map((s) => s.cityName).join(" → ")} Trip`
        : `${primaryCityName} Trip`;

    // Create trip
    const { data: trip, error: tripError } = await (supabase
      .from("trips") as any)
      .insert({
        title,
        start_date: startDate,
        end_date: endDate,
        default_currency: "USD",
        destination_name: primaryCityName,
        destination_country: primaryCountry,
        destination_place_id: segmentsToCreate[0].cityPlaceId,
        center_lat: primaryPlaceDetails?.geometry?.location?.lat || null,
        center_lng: primaryPlaceDetails?.geometry?.location?.lng || null,
        owner_id: profileId,
        // Personalization fields
        travelers,
        origin_city_place_id: originCityPlaceId || null,
        origin_city_name: originCityName || null,
        has_accommodation: hasAccommodation,
        accommodation_place_id: accommodationPlaceId || null,
        accommodation_name: accommodationName || null,
        accommodation_address: accommodationAddress || null,
        arrival_transport_mode: arrivalTransportMode || null,
        arrival_time_local: arrivalTimeLocal || null,
        interests: interests.length > 0 ? interests : [],
      })
      .select()
      .single();

    if (tripError || !trip) {
      return NextResponse.json(
        { error: tripError?.message || "Failed to create trip" },
        { status: 500 }
      );
    }

    // Create segments and days
    const createdSegments: any[] = [];
    for (let i = 0; i < segmentsToCreate.length; i++) {
      const segmentData = segmentsToCreate[i];

      // Create segment
      const { data: segment, error: segmentError } = await (supabase
        .from("trip_segments") as any)
        .insert({
          trip_id: trip.id,
          order_index: i,
          city_place_id: segmentData.cityPlaceId,
          city_name: segmentData.cityName,
          start_date: segmentData.startDate,
          end_date: segmentData.endDate,
        })
        .select()
        .single();

      if (segmentError || !segment) {
        // Rollback: delete trip
        await supabase.from("trips").delete().eq("id", trip.id);
        return NextResponse.json(
          { error: segmentError?.message || "Failed to create segment" },
          { status: 500 }
        );
      }

      createdSegments.push(segment);

      // Create days for this segment
      const segmentStart = new Date(segmentData.startDate);
      const segmentEnd = new Date(segmentData.endDate);
      const days = eachDayOfInterval({ start: segmentStart, end: segmentEnd });

      const dayRecords = days.map((date, dayIndex) => {
        // Calculate day_number across entire trip
        const tripStart = new Date(startDate);
        const daysSinceTripStart = Math.floor(
          (date.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          trip_id: trip.id,
          trip_segment_id: segment.id,
          date: format(date, "yyyy-MM-dd"),
          day_number: daysSinceTripStart + 1,
        };
      });

      const { error: daysError } = await (supabase
        .from("days") as any)
        .insert(dayRecords);

      if (daysError) {
        // Rollback: delete trip and segments
        await supabase.from("trip_segments").delete().eq("trip_id", trip.id);
        await supabase.from("trips").delete().eq("id", trip.id);
        return NextResponse.json(
          { error: daysError.message || "Failed to create days" },
          { status: 500 }
        );
      }
    }

    // Create trip member (owner) using upsert to prevent 409 errors
    const { error: memberError } = await (supabase
      .from("trip_members") as any)
      .upsert({
        trip_id: trip.id,
        user_id: profileId,
        email: null, // Will be populated from Clerk if needed
        role: "owner",
        display_name: null,
      }, {
        onConflict: 'trip_id,email'
      });

    if (memberError) {
      console.error('[trip-members]', { tripId: trip.id, email: null, profileId, action: 'create_trip_owner_member', error: memberError.message });
      // Rollback: delete everything
      await supabase.from("trip_segments").delete().eq("trip_id", trip.id);
      await supabase.from("days").delete().eq("trip_id", trip.id);
      await supabase.from("trips").delete().eq("id", trip.id);
      return NextResponse.json(
        { error: memberError.message || "Failed to create trip member" },
        { status: 500 }
      );
    }

    console.log('[trip-members]', { tripId: trip.id, email: null, profileId, action: 'create_trip_owner_member' });

    console.log('[trip-create] returning trip id', trip.id);

    return NextResponse.json({
      trip: {
        id: trip.id,
        ...trip,
      },
      segments: createdSegments,
    });
  } catch (error: any) {
    console.error('[Trips API]', {
      path: '/api/trips',
      method: 'POST',
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

export async function GET(request: NextRequest) {
  let profileId: string | undefined;
  
  try {
    const supabase = await createClient();

    // Get profile ID for authorization
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
    } catch (authError: any) {
      console.error('[Trips API]', {
        path: '/api/trips',
        method: 'GET',
        error: authError?.message || 'Failed to get profile',
      });
      return NextResponse.json(
        { error: authError?.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch trips where user is owner
    const { data: ownedTrips, error: ownedError } = await supabase
      .from("trips")
      .select("*")
      .eq("owner_id", profileId)
      .order("start_date", { ascending: true });

    if (ownedError) {
      console.error('[Trips API]', {
        path: '/api/trips',
        method: 'GET',
        error: ownedError.message,
        profileId,
      });
      return NextResponse.json(
        { error: ownedError.message || "Failed to fetch trips" },
        { status: 500 }
      );
    }

    // Fetch trips where user is a member
    const { data: memberTrips, error: memberError } = await supabase
      .from("trip_members")
      .select("trip_id, trips(*)")
      .eq("user_id", profileId);

    if (memberError) {
      console.error('[Trips API]', {
        path: '/api/trips',
        method: 'GET',
        error: memberError.message,
        profileId,
      });
      return NextResponse.json(
        { error: memberError.message || "Failed to fetch trip members" },
        { status: 500 }
      );
    }

    // Combine and deduplicate trips
    const allTrips = [
      ...(ownedTrips || []),
      ...(memberTrips || []).map((mt: any) => mt.trips).filter(Boolean),
    ];

    // Deduplicate by id
    const uniqueTrips = Array.from(
      new Map(allTrips.map((trip: any) => [trip.id, trip])).values()
    );

    // Sort by start_date
    uniqueTrips.sort(
      (a: any, b: any) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    console.log('[trips-list] profileId=', profileId, 'count=', uniqueTrips.length);

    return NextResponse.json({
      trips: uniqueTrips,
    });
  } catch (error: any) {
    console.error('[Trips API]', {
      path: '/api/trips',
      method: 'GET',
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

