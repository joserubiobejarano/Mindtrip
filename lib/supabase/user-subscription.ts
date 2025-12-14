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
    
    // Check for UUID-related errors (invalid input syntax for type uuid)
    // This happens when profiles.id is still UUID but we're querying with Clerk user ID strings
    const errorMessage = error.message?.toLowerCase() || '';
    const isUuidError = errorMessage.includes('invalid input syntax for type uuid') ||
                       errorMessage.includes('invalid input') ||
                       errorMessage.includes('invalid uuid');
    
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

  type ProfileQueryResult = {
    is_pro: boolean | null
    [key: string]: any
  }

  const profileTyped = profile as ProfileQueryResult | null;

  // Return Pro status (is_pro defaults to false if column doesn't exist yet)
  return { isPro: profileTyped?.is_pro === true };
}

// Swipe limits per trip (not per day)
export const FREE_SWIPE_LIMIT_PER_TRIP = 10;
export const PRO_SWIPE_LIMIT_PER_TRIP = 100;

