import type { SupabaseClient } from '@supabase/supabase-js';

export type TripProStatus = {
  isAccountPro: boolean;
  isTripPro: boolean;
  isProForThisTrip: boolean;
};

/**
 * Gets the Pro status for a specific trip, checking both account-level and trip-level Pro.
 * 
 * @param supabaseClient - Supabase client instance
 * @param userId - The Clerk user ID
 * @param tripId - The trip UUID
 * @returns Promise resolving to trip Pro status
 */
export async function getTripProStatus(
  supabaseClient: SupabaseClient,
  userId: string,
  tripId: string
): Promise<TripProStatus> {
  if (!userId || !tripId) {
    return {
      isAccountPro: false,
      isTripPro: false,
      isProForThisTrip: false,
    };
  }

  // 1. Check profile.is_pro (account-level Pro)
  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('is_pro')
    .eq('id', userId)
    .maybeSingle();

  // Handle errors gracefully (profile might not exist yet)
  if (profileError && profileError.code !== 'PGRST116') {
    console.warn('Error fetching profile Pro status:', profileError);
  }

  const isAccountPro = !!profile?.is_pro;

  // 2. Check trip.has_trip_pro (trip-level Pro)
  const { data: trip, error: tripError } = await supabaseClient
    .from('trips')
    .select('has_trip_pro')
    .eq('id', tripId)
    .eq('owner_id', userId)
    .maybeSingle();

  // Handle errors gracefully
  if (tripError && tripError.code !== 'PGRST116') {
    console.warn('Error fetching trip Pro status:', tripError);
  }

  const isTripPro = !!trip?.has_trip_pro;

  return {
    isAccountPro,
    isTripPro,
    isProForThisTrip: isAccountPro || isTripPro,
  };
}
