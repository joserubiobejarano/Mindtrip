import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@clerk/nextjs";

export type TripProStatus = {
  isAccountPro: boolean;
  isTripPro: boolean;
  isProForThisTrip: boolean;
};

export function useTripProStatus(tripId: string) {
  const { user } = useUser();
  const userId = user?.id;
  const supabase = createClient();

  return useQuery({
    queryKey: ["trip-pro-status", tripId, userId],
    queryFn: async (): Promise<TripProStatus> => {
      // Always return safe defaults - never throw
      const safeDefault: TripProStatus = {
        isAccountPro: false,
        isTripPro: false,
        isProForThisTrip: false,
      };

      if (!userId || !tripId) {
        return safeDefault;
      }

      try {
        // Fetch profile and trip in parallel
        const [profileResult, tripResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("is_pro")
            .eq("clerk_user_id", userId)
            .maybeSingle(),
          supabase
            .from("trips")
            .select("has_trip_pro")
            .eq("id", tripId)
            .eq("owner_id", userId)
            .maybeSingle(),
        ]);

        // Check for errors and return safe default if any
        if (profileResult.error || tripResult.error) {
          console.error('[useTripProStatus] Error fetching pro status:', {
            profileError: profileResult.error,
            tripError: tripResult.error,
            tripId,
            userId,
          });
          return safeDefault;
        }

        type ProfileQueryResult = {
          is_pro: boolean | null
          [key: string]: any
        }

        type TripQueryResult = {
          has_trip_pro: boolean | null
          [key: string]: any
        }

        const profileData = profileResult.data as ProfileQueryResult | null;
        const tripData = tripResult.data as TripQueryResult | null;

        const isAccountPro = !!profileData?.is_pro;
        const isTripPro = !!tripData?.has_trip_pro;

        return {
          isAccountPro,
          isTripPro,
          isProForThisTrip: isAccountPro || isTripPro,
        };
      } catch (error: any) {
        // Never throw - always return safe default
        console.error('[useTripProStatus] Unexpected error:', {
          error: error?.message,
          stack: error?.stack,
          tripId,
          userId,
        });
        return safeDefault;
      }
    },
    enabled: !!userId && !!tripId,
    retry: 1, // Only retry once to avoid excessive calls
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
