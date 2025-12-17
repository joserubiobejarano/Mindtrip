// Swipe limits per trip (not per day)
export const FREE_SWIPE_LIMIT_PER_TRIP = 10;
export const PRO_SWIPE_LIMIT_PER_TRIP = 100;

// Explore usage limits
export const FREE_CHANGE_LIMIT = 10;
export const PRO_CHANGE_LIMIT = Infinity; // Unlimited for Pro
export const FREE_SEARCH_ADD_LIMIT = 20;
export const PRO_SEARCH_ADD_LIMIT = Infinity; // Unlimited for Pro

/**
 * Get usage limits for Explore features based on Pro status
 * @param isPro - Whether the user has Pro subscription
 * @returns Object with limits for swipe, change, and searchAdd actions
 */
export function getUsageLimits(isPro: boolean): {
  swipe: { limit: number };
  change: { limit: number };
  searchAdd: { limit: number };
} {
  return {
    swipe: {
      limit: isPro ? PRO_SWIPE_LIMIT_PER_TRIP : FREE_SWIPE_LIMIT_PER_TRIP,
    },
    change: {
      limit: isPro ? PRO_CHANGE_LIMIT : FREE_CHANGE_LIMIT,
    },
    searchAdd: {
      limit: isPro ? PRO_SEARCH_ADD_LIMIT : FREE_SEARCH_ADD_LIMIT,
    },
  };
}
