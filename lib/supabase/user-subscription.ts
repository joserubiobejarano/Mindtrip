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
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_pro')
    .eq('id', userId)
    .maybeSingle();

  // If error or profile not found, default to free tier
  if (error || !profile) {
    return { isPro: false };
  }

  // Return Pro status (is_pro defaults to false if column doesn't exist yet)
  return { isPro: profile.is_pro === true };
}

/**
 * Gets the daily swipe limit for a user based on their subscription tier.
 * 
 * @param userId - The Clerk user ID
 * @returns Promise resolving to daily swipe limit (Infinity for Pro, 10 for Free)
 */
export async function getUserDailySwipeLimit(userId: string): Promise<number> {
  const { isPro } = await getUserSubscriptionStatus(userId);
  return isPro ? Infinity : 10;
}

