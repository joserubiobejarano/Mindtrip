import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { eachDayOfInterval, format } from "date-fns";

export interface DestinationOption {
  id: string;
  placeName: string;
  region: string;
  type: "City" | "Country" | "Region";
  center: [number, number];
}

interface CreateTripParams {
  destination: DestinationOption;
  startDate: string;
  endDate: string;
  travelersCount?: number;
}

const generateTripTitle = (dest: DestinationOption, start: string, end: string): string => {
  if (!dest) return "";
  const cityName = dest.placeName;
  if (!start || !end) return `Trip to ${cityName}`;
  
  const startDateObj = new Date(start);
  const season = getSeason(startDateObj);
  
  return `${season} getaway to ${cityName}`;
};

const getSeason = (date: Date): string => {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Fall";
  return "Winter";
};

export function useCreateTrip() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { user } = useUser();

  const createTrip = async ({ destination, startDate, endDate, travelersCount }: CreateTripParams) => {
    setLoading(true);
    setError(null);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Validate dates
      if (end < start) {
        throw new Error("End date must be after start date");
      }

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const title = generateTripTitle(destination, startDate, endDate);
      const [centerLng, centerLat] = destination?.center || [null, null];
      const destinationCountry = destination?.region 
        ? destination.region.split(",").slice(-1)[0].trim() 
        : null;

      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .insert({
          title,
          start_date: startDate,
          end_date: endDate,
          default_currency: "USD",
          destination_name: destination?.placeName || null,
          destination_country: destinationCountry || null,
          destination_place_id: destination?.id || null,
          center_lat: centerLat || null,
          center_lng: centerLng || null,
          owner_id: user.id,
        })
        .select()
        .single();

      if (tripError) throw tripError;
      if (!trip) throw new Error("Failed to create trip");

      const days = eachDayOfInterval({ start, end });
      const dayRecords = days.map((date, index) => ({
        trip_id: trip.id,
        date: format(date, "yyyy-MM-dd"),
        day_number: index + 1,
      }));

      const { error: daysError } = await supabase
        .from("days")
        .insert(dayRecords);

      if (daysError) throw daysError;

      const userEmail = user?.primaryEmailAddress?.emailAddress || null;
      const displayName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : userEmail || null;

      const { error: memberError } = await supabase
        .from("trip_members")
        .insert({
          trip_id: trip.id,
          user_id: user.id,
          email: userEmail,
          role: "owner",
          display_name: displayName,
        });

      if (memberError) {
        console.error("Error creating owner member:", memberError);
        await supabase.from("trips").delete().eq("id", trip.id);
        throw new Error("Failed to create trip member. Please try again.");
      }

      router.push(`/trips/${trip.id}?tab=itinerary`);
      return trip;
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createTrip, loading, error };
}

