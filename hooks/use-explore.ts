import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/toast';
import type { ExplorePlace, ExploreFilters } from '@/lib/google/explore-places';

export interface ExploreSession {
  likedPlaces: string[];
  discardedPlaces: string[];
  swipeCount: number;
  remainingSwipes: number | null;
  dailyLimit: number | null;
}

export interface SwipeResponse {
  success: boolean;
  swipeCount: number;
  remainingSwipes: number | null;
  limitReached: boolean;
  error?: string;
  undonePlaceId?: string;
}

/**
 * Hook to fetch places for exploration
 */
export function useExplorePlaces(
  tripId: string,
  filters: ExploreFilters = {},
  enabled: boolean = true,
  dayId?: string,
  slot?: 'morning' | 'afternoon' | 'evening'
) {
  return useQuery({
    queryKey: ['explore-places', tripId, filters, dayId, slot],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.neighborhood) params.set('neighborhood', filters.neighborhood);
      if (filters.category) params.set('category', filters.category);
      if (filters.timeOfDay) params.set('timeOfDay', filters.timeOfDay);
      if (filters.includeItineraryPlaces) {
        params.set('includeItineraryPlaces', 'true');
      }
      if (filters.excludePlaceIds) {
        filters.excludePlaceIds.forEach(id => params.append('excludePlaceId', id));
      }
      if (dayId) params.set('day_id', dayId);
      if (slot) params.set('time_of_day', slot);
      if (filters.budget !== undefined) params.set('budget', filters.budget.toString());
      if (filters.maxDistance !== undefined) params.set('maxDistance', filters.maxDistance.toString());

      const response = await fetch(
        `/api/trips/${tripId}/explore/places?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch places');
      }

      const data = await response.json();
      return data as { places: ExplorePlace[]; hasMore: boolean; totalCount: number };
    },
    enabled: enabled && !!tripId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch explore session state
 * Source of truth for liked/discarded lists
 */
export function useExploreSession(tripId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['explore-session', tripId],
    queryFn: async () => {
      const response = await fetch(`/api/trips/${tripId}/explore/session`);

      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }

      const data = await response.json();
      return data as ExploreSession;
    },
    enabled: enabled && !!tripId,
    staleTime: 1 * 60 * 1000, // 1 minute - session changes frequently
  });
}

/**
 * Hook to handle swipe actions with optimistic updates
 */
export function useSwipeAction(tripId: string) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      placeId, 
      action, 
      previousAction, 
      source 
    }: { 
      placeId?: string; 
      action: 'like' | 'dislike' | 'undo';
      previousAction?: 'like' | 'dislike';
      source?: 'trip' | 'day';
    }) => {
      const response = await fetch(`/api/trips/${tripId}/explore/swipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          place_id: placeId || '',
          action,
          previous_action: previousAction,
          source: source || 'trip',
        }),
      });

      const data = await response.json();

      // Handle limit reached (even if success is false)
      if (data.limitReached) {
        // Return the response so onSuccess can handle it
        return data as SwipeResponse;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record swipe');
      }

      return data as SwipeResponse;
    },
    onMutate: async ({ placeId, action, previousAction, source }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['explore-session', tripId] });

      // Snapshot previous value
      const previousSession = queryClient.getQueryData<ExploreSession>(['explore-session', tripId]);

      // Optimistically update session
      if (previousSession) {
        if (action === 'undo') {
          // For undo, remove last item from whichever array has items
          const updatedLiked = [...previousSession.likedPlaces];
          const updatedDiscarded = [...previousSession.discardedPlaces];
          
          if (updatedLiked.length > 0) {
            updatedLiked.pop();
          } else if (updatedDiscarded.length > 0) {
            updatedDiscarded.pop();
          }

          const updatedSession: ExploreSession = {
            ...previousSession,
            likedPlaces: updatedLiked,
            discardedPlaces: updatedDiscarded,
            swipeCount: Math.max(0, previousSession.swipeCount - 1),
            remainingSwipes:
              previousSession.remainingSwipes !== null
                ? Math.min(previousSession.dailyLimit || 0, (previousSession.remainingSwipes || 0) + 1)
                : null,
          };

          queryClient.setQueryData(['explore-session', tripId], updatedSession);
        } else if (placeId) {
          const updatedSession: ExploreSession = {
            ...previousSession,
            [action === 'like' ? 'likedPlaces' : 'discardedPlaces']: [
              ...(action === 'like' ? previousSession.likedPlaces : previousSession.discardedPlaces),
              placeId,
            ],
            swipeCount: previousSession.swipeCount + 1,
            remainingSwipes:
              previousSession.remainingSwipes !== null
                ? Math.max(0, previousSession.remainingSwipes - 1)
                : null,
          };

          queryClient.setQueryData(['explore-session', tripId], updatedSession);
        }
      }

      return { previousSession };
    },
    onError: (err, variables, context) => {
      // Rollback optimistic update
      if (context?.previousSession) {
        queryClient.setQueryData(['explore-session', tripId], context.previousSession);
      }

      addToast({
        title: 'Error',
        description: err instanceof Error ? err.message : `Failed to ${variables.action === 'undo' ? 'undo swipe' : 'record swipe'}. Please try again.`,
        variant: 'destructive',
      });
    },
    onSuccess: (data) => {
      // Update session with server response
      queryClient.setQueryData<ExploreSession>(['explore-session', tripId], (old) => {
        if (!old) return old;
        return {
          ...old,
          swipeCount: data.swipeCount,
          remainingSwipes: data.remainingSwipes,
        };
      });

      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['explore-session', tripId] });
      
      // Invalidate places query so newly swiped places are excluded from future fetches
      queryClient.invalidateQueries({ queryKey: ['explore-places', tripId] });

      // Show limit reached message and redirect to upgrade
      if (data.limitReached) {
        addToast({
          title: 'Daily limit reached',
          description: 'You\'ve reached your daily swipe limit. Upgrade to Pro for unlimited swipes!',
          variant: 'default',
        });
        // Redirect to upgrade page
        setTimeout(() => {
          window.location.href = '/settings?upgrade=true';
        }, 1500); // Small delay to let user see the toast
      }
    },
  });
}

