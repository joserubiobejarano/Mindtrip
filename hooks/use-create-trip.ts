import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { TripPersonalizationPayload } from "@/types/trip-personalization";

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
  personalization?: TripPersonalizationPayload;
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
  const { user } = useUser();

  const createTrip = async ({ destination, startDate, endDate, travelersCount, personalization }: CreateTripParams) => {
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

      // Use API route instead of direct Supabase call
      const payload: any = {
        destinationPlaceId: destination.id,
        destinationName: destination.placeName,
        destinationCenter: destination.center,
        startDate,
        endDate,
      };

      // Include personalization if provided
      if (personalization) {
        payload.personalization = personalization;
      } else if (travelersCount) {
        // Backward compatibility: if travelersCount is provided but no personalization, create minimal personalization
        payload.personalization = {
          travelers: travelersCount,
          hasAccommodation: false,
        };
      }

      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create trip');
      }

      const data = await response.json();
      router.push(`/trips/${data.trip.id}?tab=itinerary`);
      return data.trip;
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

