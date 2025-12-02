import { createClient } from '@/lib/supabase/server';

/**
 * Gets the subscription status for a user.
 * Currently defaults to free tier. Can be extended to check:
 * - Supabase profiles table (if subscription field is added)
 * - Stripe API (via webhook or direct API call)
 * - Central config table
 * 
 * @param userId - The Clerk user ID
 * @returns Promise resolving to subscription status
 */
export async function getUserSubscriptionStatus(userId: string): Promise<{ isPro: boolean }> {
  if (!userId) {
    return { isPro: false };
  }

  const supabase = await createClient();

  // Check profiles table for is_pro column
  // Note: profiles.id should be TEXT to support Clerk user IDs, but if the migration
  // hasn't run, it may still be UUID. We handle errors gracefully.
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_pro')
    .eq('id', userId)
    .maybeSingle();

  // Handle errors gracefully:
  // - PGRST116 = not found (profile doesn't exist yet) - default to free tier
  // - 400 Bad Request or UUID-related errors = likely UUID column type mismatch - default to free tier
  // - Other errors - log but default to free tier for safety
  if (error) {
    // If it's a "not found" error, that's fine - profile doesn't exist yet
    if (error.code === 'PGRST116') {
      return { isPro: false };
    }
    
    // Check for UUID-related errors (400 Bad Request or invalid input syntax for type uuid)
    // This happens when profiles.id is still UUID but we're querying with Clerk user ID strings
    const errorMessage = error.message?.toLowerCase() || '';
    const isUuidError = error.status === 400 || 
                       errorMessage.includes('invalid input syntax for type uuid') ||
                       errorMessage.includes('invalid input');
    
    if (isUuidError) {
      // Database schema mismatch - profiles.id is likely still UUID, not TEXT
      // Default to free tier and log for debugging
      console.warn('Profiles table may need migration: profiles.id should be TEXT for Clerk user IDs', error);
      return { isPro: false };
    }
    
    // Log unexpected errors but still default to free tier
    console.warn('Error fetching subscription status:', error);
    return { isPro: false };
  }

  // If profile not found, default to free tier
  if (!profile) {
    return { isPro: false };
  }

  // Return Pro status (is_pro defaults to false if column doesn't exist yet)
  return { isPro: profile.is_pro === true };
}

// TEMP: increased for internal testing. IMPORTANT: set back to 10 before launch.
export const FREE_SWIPE_LIMIT_PER_TRIP = 50;

/**
 * Gets the daily swipe limit for a user based on their subscription tier.
 * 
 * @param userId - The Clerk user ID
 * @returns Promise resolving to daily swipe limit (Infinity for Pro, 50 for Free)
 */
export async function getUserDailySwipeLimit(userId: string): Promise<number> {
  const { isPro } = await getUserSubscriptionStatus(userId);
  return isPro ? Infinity : FREE_SWIPE_LIMIT_PER_TRIP;
}

