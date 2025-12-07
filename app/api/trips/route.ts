import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscriptionStatus } from "@/lib/supabase/user-subscription";
import { createTripSegment } from "@/lib/supabase/trip-segments";
import { getPlaceDetails } from "@/lib/google/places-server";
import { eachDayOfInterval, format, addDays } from "date-fns";

interface NewTripPayload {
  destinationPlaceId: string;
  startDate: string;
  endDate: string;
  travelers?: number;
  segments?: Array<{
    cityPlaceId: string;
    cityName: string;
    nights: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: NewTripPayload = await request.json();
    const { destinationPlaceId, startDate, endDate, segments } = body;

    if (!destinationPlaceId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "destinationPlaceId, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check subscription status
    const { isPro } = await getUserSubscriptionStatus(userId);

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
      // Get city name from Places API
      const placeDetails = await getPlaceDetails(destinationPlaceId);
      const cityName = placeDetails?.name || "Unknown City";

      segmentsToCreate = [
        {
          cityPlaceId: destinationPlaceId,
          cityName,
          startDate,
          endDate,
        },
      ];
    }

    // Get primary city details for trip title
    const primaryPlaceDetails = await getPlaceDetails(
      segmentsToCreate[0].cityPlaceId
    );
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
    const { data: trip, error: tripError } = await supabase
      .from("trips")
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
        owner_id: userId,
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
    const createdSegments = [];
    for (let i = 0; i < segmentsToCreate.length; i++) {
      const segmentData = segmentsToCreate[i];

      // Create segment
      const { data: segment, error: segmentError } = await supabase
        .from("trip_segments")
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

      const { error: daysError } = await supabase
        .from("days")
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

    // Create trip member (owner)
    const { error: memberError } = await supabase
      .from("trip_members")
      .insert({
        trip_id: trip.id,
        user_id: userId,
        email: null, // Will be populated from Clerk if needed
        role: "owner",
        display_name: null,
      });

    if (memberError) {
      // Rollback: delete everything
      await supabase.from("trip_segments").delete().eq("trip_id", trip.id);
      await supabase.from("days").delete().eq("trip_id", trip.id);
      await supabase.from("trips").delete().eq("id", trip.id);
      return NextResponse.json(
        { error: memberError.message || "Failed to create trip member" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      trip,
      segments: createdSegments,
    });
  } catch (error) {
    console.error("Error creating trip:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

