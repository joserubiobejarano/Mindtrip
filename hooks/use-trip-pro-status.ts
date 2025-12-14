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
      if (!userId || !tripId) {
        return {
          isAccountPro: false,
          isTripPro: false,
          isProForThisTrip: false,
        };
      }

      // Fetch profile and trip in parallel
      const [profileResult, tripResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("is_pro")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("trips")
          .select("has_trip_pro")
          .eq("id", tripId)
          .eq("owner_id", userId)
          .maybeSingle(),
      ]);

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
    },
    enabled: !!userId && !!tripId,
  });
}
