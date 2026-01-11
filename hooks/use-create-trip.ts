import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { TripPersonalizationPayload } from "@/types/trip-personalization";
import { getTripUrl } from "@/lib/routes";
import { useToast } from "@/components/ui/toast";

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
  const { addToast } = useToast();

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
        // Default personalization payload (travelers=1, hasAccommodation=false)
        // Can be overridden if personalization or travelersCount is provided
        personalization: personalization || {
          travelers: travelersCount || 1,
          hasAccommodation: false,
        },
      };

      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Create error with status code and error data for better handling
        const error = new Error(errorData.error || errorData.message || 'Failed to create trip');
        (error as any).status = response.status;
        (error as any).errorData = errorData;
        throw error;
      }

      const data = await response.json();
      
      // Log full response (sanitized - only log structure, not sensitive data)
      console.log('[trip-create-client] POST /api/trips response:', {
        hasData: !!data,
        hasTrip: !!data?.trip,
        tripId: data?.trip?.id,
        tripKeys: data?.trip ? Object.keys(data.trip) : null,
        hasSegments: !!data?.segments,
        responseShape: {
          trip: data?.trip ? { id: data.trip.id, title: data.trip.title } : null,
          segments: data?.segments?.length || 0,
        },
      });
      
      // Explicitly extract tripId with hard validation
      const tripId = data?.trip?.id;
      console.log('[trip-create-client] extracted tripId:', tripId, 'type:', typeof tripId);

      // Hard assertion: tripId must be a non-empty string
      if (!tripId || typeof tripId !== 'string' || tripId.trim() === '') {
        const errorMsg = 'Trip created but no tripId returned';
        console.error('[trip-create-client] tripId validation failed:', {
          tripId,
          type: typeof tripId,
          data: data,
        });
        addToast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
        throw new Error(errorMsg);
      }

      // Bulletproof navigation: use replace + refresh + fallback
      const targetUrl = getTripUrl(tripId, 'itinerary');
      console.log('[trip-create] redirecting to', targetUrl);
      
      try {
        router.replace(targetUrl);
        router.refresh();
        
        // Fallback: if still on /trips after 300ms, force hard navigation
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname === '/trips') {
            console.warn('[trip-create] fallback: using hard navigation');
            window.location.assign(targetUrl);
          }
        }, 300);
      } catch (navError: any) {
        console.error('[trip-create-client] navigation failed', navError);
        // Fallback to hard navigation on error
        if (typeof window !== 'undefined') {
          window.location.assign(targetUrl);
        } else {
          throw new Error('Trip created but navigation failed. Please refresh the page.');
        }
      }
      
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

