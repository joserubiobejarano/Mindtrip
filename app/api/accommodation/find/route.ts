import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { findBestAccommodation } from "@/lib/google/accommodation";
import type { Database, Json } from "@/types/database";

type TripUpdate = Database["public"]["Tables"]["trips"]["Update"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId } = body;

    if (!tripId) {
      return NextResponse.json(
        { error: "tripId is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key not configured" },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    // Load trip data
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("destination_name, center_lat, center_lng")
      .eq("id", tripId)
      .single<{
        destination_name: string | null;
        center_lat: number | null;
        center_lng: number | null;
      }>();

    if (tripError || !trip) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    if (!trip.destination_name) {
      return NextResponse.json(
        { error: "Trip destination not set" },
        { status: 400 }
      );
    }

    // Find best accommodation
    const accommodation = await findBestAccommodation(
      trip.destination_name,
      apiKey
    );

    if (!accommodation) {
      return NextResponse.json(
        { error: "No accommodation found" },
        { status: 404 }
      );
    }

    // Save to trip - use type assertion to fix TypeScript inference issue
    const updatePayload: TripUpdate = {
      auto_accommodation: accommodation as unknown as Json,
    };
    const { error: updateError } = await supabase
      .from("trips")
      .update(updatePayload)
      .eq("id", tripId);

    if (updateError) {
      console.error("Error updating trip with accommodation:", updateError);
      return NextResponse.json(
        { error: "Failed to save accommodation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ accommodation });
  } catch (error) {
    console.error("Error in /api/accommodation/find:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

