/**
 * Route helper functions for constructing URLs
 */

/**
 * Get the URL for a trip workspace
 * @param tripId - The trip ID (UUID)
 * @param tab - Optional tab name (e.g., 'itinerary', 'expenses', 'explore')
 * @returns The trip URL with optional tab query parameter
 */
export function getTripUrl(tripId: string, tab?: string): string {
  const baseUrl = `/trips/${tripId}`;
  if (tab) {
    return `${baseUrl}?tab=${tab}`;
  }
  return baseUrl;
}
