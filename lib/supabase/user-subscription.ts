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

  // Check profiles table for is_pro column using clerk_user_id
  // This avoids UUID type conflicts since clerk_user_id is TEXT
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_pro')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  // Handle errors gracefully:
  // - PGRST116 = not found (profile doesn't exist yet) - default to free tier
  // - Other errors - log but default to free tier for safety
  if (error) {
    // If it's a "not found" error, that's fine - profile doesn't exist yet
    if (error.code === 'PGRST116') {
      return { isPro: false };
    }
    
    // Log unexpected errors but still default to free tier
    console.warn('Error fetching subscription status by clerk_user_id:', {
      userId,
      message: error.message,
      code: error.code,
    });
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

// Re-export usage limits for convenience (server-side code can import from here)
export {
  FREE_SWIPE_LIMIT_PER_TRIP,
  PRO_SWIPE_LIMIT_PER_TRIP,
  FREE_CHANGE_LIMIT,
  PRO_CHANGE_LIMIT,
  FREE_SEARCH_ADD_LIMIT,
  PRO_SEARCH_ADD_LIMIT,
  getUsageLimits,
} from './usage-limits';

