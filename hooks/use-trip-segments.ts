import { useQuery } from '@tanstack/react-query';
import type { TripSegment } from '@/types/trip-segments';

export function useTripSegments(tripId: string) {
  return useQuery({
    queryKey: ['trip-segments', tripId],
    queryFn: async () => {
      const response = await fetch(`/api/trips/${tripId}/segments`);

      if (!response.ok) {
        throw new Error('Failed to fetch segments');
      }

      const data = await response.json();
      return data.segments as TripSegment[];
    },
    enabled: !!tripId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

