"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, Sparkles } from 'lucide-react';
import { SwipeableCard } from './SwipeableCard';
import { ExploreActions } from './ExploreActions';
import { PlaceDetailsDrawer } from '@/components/place-details-drawer';
import { useExplorePlaces, useExploreSession, useSwipeAction } from '@/hooks/use-explore';
import type { ExplorePlace, ExploreFilters } from '@/lib/google/explore-places';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { usePaywall } from '@/hooks/usePaywall';
import { useTripActivities } from '@/hooks/use-trip-activities';
import { getItineraryPlaceKeys, normalizePlaceKey } from '@/lib/itinerary/dedupe';
import { useLanguage } from '@/components/providers/language-provider';

interface ExploreDeckProps {
  tripId: string;
  filters?: ExploreFilters;
  mode?: 'trip' | 'day';
  dayId?: string;
  slot?: 'morning' | 'afternoon' | 'evening';
  areaCluster?: string;
  tripSegmentId?: string;
  onAddToItinerary?: (selectedPlace?: ExplorePlace) => void;
  onAddToDay?: (placeIds: string[]) => void;
  onActivePlaceChange?: (place: { placeId: string; lat: number; lng: number }) => void;
  onCurrentPlaceChange?: (place: ExplorePlace | null) => void;
  className?: string;
  hideHeader?: boolean;
  replaceTarget?: { tripId: string; dayId: string; activityId: string };
  replacingActivityName?: string;
}

export function ExploreDeck({
  tripId,
  filters = {},
  mode = 'trip',
  dayId,
  slot,
  areaCluster,
  tripSegmentId,
  onAddToItinerary,
  onAddToDay,
  onActivePlaceChange,
  onCurrentPlaceChange,
  className,
  hideHeader = false,
  replaceTarget,
  replacingActivityName,
}: ExploreDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedPlaceName, setSelectedPlaceName] = useState<string | undefined>(undefined);
  const [swipeHistory, setSwipeHistory] = useState<Array<{ placeId: string; action: 'like' | 'dislike' }>>([]);
  const [lastDirection, setLastDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [selectedReplacementPlace, setSelectedReplacementPlace] = useState<ExplorePlace | null>(null);

  // Build filters based on mode - memoized to prevent unnecessary re-renders
  // Use individual filter properties for stability instead of the whole filters object
  const excludePlaceIdsKey = filters.excludePlaceIds?.join(',') ?? '';
  const effectiveFilters: ExploreFilters = useMemo(() => {
    return mode === 'day' && dayId
      ? {
          ...filters,
          neighborhood: areaCluster || filters.neighborhood,
          timeOfDay: slot || filters.timeOfDay,
        }
      : filters;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mode,
    dayId,
    areaCluster,
    slot,
    filters.neighborhood,
    filters.category,
    filters.timeOfDay,
    filters.includeItineraryPlaces,
    filters.budget,
    filters.maxDistance,
    excludePlaceIdsKey,
  ]);

  const { data: session } = useExploreSession(tripId, true, tripSegmentId);
  const { data, isLoading, error: placesError } = useExplorePlaces(tripId, effectiveFilters, true, dayId, slot, tripSegmentId);
  const { data: activities = [], isLoading: activitiesLoading } = useTripActivities(tripId);
  const { openPaywall } = usePaywall();
  const swipeMutation = useSwipeAction(tripId, tripSegmentId, (tripId) => {
    openPaywall({ reason: "pro_feature", source: "explore_swipe_limit", tripId });
  });
  const { addToast } = useToast();
  const { t } = useLanguage();

  // Derive places directly from hook result - ensure always an array (memoized to prevent unnecessary re-renders)
  const rawPlaces = useMemo(() => {
    return Array.isArray(data?.places) ? data.places : [];
  }, [data?.places]);

  // Compute itinerary place keys (memoized)
  const itineraryPlaceKeys = useMemo(() => {
    const keys = getItineraryPlaceKeys(activities);
    // DEV-only logging
    if (process.env.NODE_ENV === 'development') {
      console.debug("[Explore] itinerary place keys", {
        placeIdsSize: keys.placeIds.size,
        fallbackKeysSize: keys.fallbackKeys.size,
        activitiesCount: activities.length,
      });
    }
    return keys;
  }, [activities]);

  // Filter and dedupe places based on itinerary
  const places = useMemo(() => {
    const beforeCount = rawPlaces.length;
    let filtered: ExplorePlace[];

    // If includeItineraryPlaces is true, skip filtering
    if (filters.includeItineraryPlaces) {
      filtered = rawPlaces;
    } else {
      // Filter out places already in itinerary
      filtered = rawPlaces.filter((place) => {
        // Primary match: place_id (if available)
        if (place.place_id && itineraryPlaceKeys.placeIds.has(place.place_id)) {
          return false;
        }

        // Fallback match: normalized name + area/city (only if place_id is missing)
        if (!place.place_id) {
          // Extract city/area from address similar to dedupe helper
          let area: string | null = place.neighborhood || place.district || null;
          let city: string | null = null;
          if (place.address) {
            const addressParts = place.address.split(',').map(p => p.trim());
            if (addressParts.length > 1) {
              city = addressParts[addressParts.length - 2] || addressParts[addressParts.length - 1] || null;
              if (!area && addressParts.length > 2) {
                area = addressParts[addressParts.length - 3] || null;
              }
            }
          }
          const normalizedKey = normalizePlaceKey(place.name, area, city);
          if (normalizedKey && itineraryPlaceKeys.fallbackKeys.has(normalizedKey)) {
            return false;
          }
        }

        return true;
      });
    }

    // Dedupe explore results themselves by place_id or normalized key
    const seenPlaceIds = new Set<string>();
    const seenKeys = new Set<string>();
    const deduped: ExplorePlace[] = [];

    for (const place of filtered) {
      // Check by place_id first
      if (place.place_id) {
        if (seenPlaceIds.has(place.place_id)) {
          continue;
        }
        seenPlaceIds.add(place.place_id);
      } else {
        // Fallback: check by normalized key
        let area: string | null = place.neighborhood || place.district || null;
        let city: string | null = null;
        if (place.address) {
          const addressParts = place.address.split(',').map(p => p.trim());
          if (addressParts.length > 1) {
            city = addressParts[addressParts.length - 2] || addressParts[addressParts.length - 1] || null;
            if (!area && addressParts.length > 2) {
              area = addressParts[addressParts.length - 3] || null;
            }
          }
        }
        const normalizedKey = normalizePlaceKey(place.name, area, city);
        if (normalizedKey && seenKeys.has(normalizedKey)) {
          continue;
        }
        if (normalizedKey) {
          seenKeys.add(normalizedKey);
        }
      }

      deduped.push(place);
    }

    const afterCount = deduped.length;
    const removedCount = beforeCount - afterCount;

    // DEV-only logging
    if (process.env.NODE_ENV === 'development') {
      console.debug("[Explore] filtered places", {
        before: beforeCount,
        after: afterCount,
        removed: removedCount,
        showAlreadyInItinerary: filters.includeItineraryPlaces,
        itineraryPlaceIdsSize: itineraryPlaceKeys.placeIds.size,
        itineraryFallbackKeysSize: itineraryPlaceKeys.fallbackKeys.size,
      });
    }

    return deduped;
  }, [rawPlaces, itineraryPlaceKeys, filters.includeItineraryPlaces]);

  // Ensure session has safe defaults
  const safeSession = session || {
    likedPlaces: [],
    discardedPlaces: [],
    swipeCount: 0,
    remainingSwipes: null,
    dailyLimit: null,
  };

  // Helper to check if a place is already in itinerary
  const isPlaceInItinerary = useCallback((place: ExplorePlace): boolean => {
    // Primary match: place_id (if available)
    if (place.place_id && itineraryPlaceKeys.placeIds.has(place.place_id)) {
      return true;
    }

    // Fallback match: normalized name + area/city (only if place_id is missing)
    if (!place.place_id) {
      // Extract city/area from address similar to dedupe helper
      let area: string | null = place.neighborhood || place.district || null;
      let city: string | null = null;
      if (place.address) {
        const addressParts = place.address.split(',').map(p => p.trim());
        if (addressParts.length > 1) {
          city = addressParts[addressParts.length - 2] || addressParts[addressParts.length - 1] || null;
          if (!area && addressParts.length > 2) {
            area = addressParts[addressParts.length - 3] || null;
          }
        }
      }
      const normalizedKey = normalizePlaceKey(place.name, area, city);
      if (normalizedKey && itineraryPlaceKeys.fallbackKeys.has(normalizedKey)) {
        return true;
      }
    }

    return false;
  }, [itineraryPlaceKeys]);

  // In replace mode, enforce single selection - only keep the latest liked place
  const likedPlacesForReplace = useMemo(() => {
    if (replaceTarget && safeSession.likedPlaces && safeSession.likedPlaces.length > 0) {
      // Return only the most recent liked place (last in array)
      return [safeSession.likedPlaces[safeSession.likedPlaces.length - 1]];
    }
    return safeSession.likedPlaces || [];
  }, [replaceTarget, safeSession.likedPlaces]);

  // Clear selected replacement when replaceTarget changes
  useEffect(() => {
    if (!replaceTarget) {
      setSelectedReplacementPlace(null);
    }
  }, [replaceTarget]);

  // Sync currentIndex with places.length - always clamp to valid range
  useEffect(() => {
    if (places.length > 0) {
      setCurrentIndex((prev) => {
        // Clamp index to valid range: [0, places.length - 1]
        const clampedIndex = Math.min(Math.max(prev, 0), places.length - 1);
        if (clampedIndex !== prev) {
          console.log(`[itinerary-swipe] clamping index from ${prev} to ${clampedIndex} (places.length: ${places.length})`);
        }
        return clampedIndex;
      });
    } else {
      // When no places, keep index at 0 (but don't render card - handled by early return)
      setCurrentIndex(0);
    }
  }, [places.length]);

  const handleSwipeLeft = () => {
    // Guard: ensure index is valid before accessing places array
    if (currentIndex < 0 || currentIndex >= places.length) {
      console.log('[itinerary-swipe] handleSwipeLeft: invalid index', currentIndex, 'places.length:', places.length);
      return;
    }
    const place = places[currentIndex];
    if (!place) {
      console.log('[itinerary-swipe] handleSwipeLeft: no place at currentIndex', currentIndex);
      return;
    }
    const placeId = place.place_id;
    console.log(`[itinerary-swipe] swipe left triggered for place ${placeId} (${place.name})`);
    setLastDirection('left');
    setCurrentIndex((prev) => {
      const newIndex = prev - 1;
      // Clamp to valid range: [0, places.length - 1]
      const clampedIndex = Math.max(0, Math.min(newIndex, places.length - 1));
      console.log(`[itinerary-swipe] advancing index from ${prev} to ${clampedIndex} (places.length: ${places.length})`);
      return clampedIndex;
    });
    console.log(`[itinerary-swipe] API call: dislike for place ${placeId}`);
    swipeMutation.mutate(
      { 
        placeId, 
        action: 'dislike', 
        source: mode === 'day' ? 'day' : 'trip',
        dayId: mode === 'day' ? dayId : undefined,
        slot: mode === 'day' ? slot : undefined,
      },
      {
        onSuccess: (res) => {
          if (res?.limitReached) {
            console.log('[itinerary-swipe] limit reached, rolling back index');
            // Rollback UI if limit reached - clamp to valid range
            setCurrentIndex((prev) => {
              const newIndex = prev + 1;
              return Math.max(0, Math.min(newIndex, places.length - 1));
            });
            return;
          }
          console.log('[itinerary-swipe] dislike API call successful');
          // Track swipe in history for undo (max 3)
          setSwipeHistory((prev) => {
            const newHistory: Array<{ placeId: string; action: 'like' | 'dislike' }> = [
              { placeId, action: 'dislike' as const },
              ...prev,
            ];
            return newHistory.slice(0, 3);
          });
        },
        onError: (error) => {
          console.error('[itinerary-swipe] dislike API call failed:', error);
          // Rollback UI on error - clamp to valid range
          setCurrentIndex((prev) => {
            const newIndex = prev + 1;
            return Math.max(0, Math.min(newIndex, places.length - 1));
          });
          addToast({
            title: t('explore_toast_error'),
            description: t('explore_toast_could_not_save_swipe'),
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleSwipeRight = async () => {
    // Guard: ensure index is valid before accessing places array
    if (currentIndex < 0 || currentIndex >= places.length) {
      console.log('[itinerary-swipe] handleSwipeRight: invalid index', currentIndex, 'places.length:', places.length);
      return;
    }
    const place = places[currentIndex];
    if (!place) {
      console.log('[itinerary-swipe] handleSwipeRight: no place at currentIndex', currentIndex);
      return;
    }
    const placeId = place.place_id;
    console.log(`[itinerary-swipe] swipe right triggered for place ${placeId} (${place.name})`);
    
    // Check if place is already in itinerary (guardrail)
    const isInItinerary = isPlaceInItinerary(place);
    
    // Handle replace mode
    if (replaceTarget) {
      // In replace mode, check if already in itinerary
      if (isInItinerary) {
        addToast({
          title: t('explore_toast_already_in_itinerary'),
          description: t('explore_toast_already_in_itinerary_desc_replace'),
          variant: 'destructive',
        });
        return; // Don't select, don't advance
      }
      
      // Set selected replacement place (don't advance card)
      setSelectedReplacementPlace(place);
      addToast({
        title: t('explore_toast_selected'),
        description: t('explore_toast_selected_desc').replace('{name}', place.name),
        variant: 'default',
      });
      
      // Still like the place for session tracking (but don't advance)
      console.log(`[itinerary-swipe] replace mode: API call: like for place ${placeId}`);
      swipeMutation.mutate(
        { 
          placeId, 
          action: 'like', 
          source: mode === 'day' ? 'day' : 'trip',
          dayId: mode === 'day' ? dayId : undefined,
          slot: mode === 'day' ? slot : undefined,
        },
        {
          onSuccess: (res) => {
            if (res?.limitReached) {
              console.log('[itinerary-swipe] limit reached in replace mode');
              // Clear selection if limit reached
              setSelectedReplacementPlace(null);
              return;
            }
            console.log('[itinerary-swipe] like API call successful (replace mode)');
          },
          onError: (error) => {
            console.error('[itinerary-swipe] like API call failed (replace mode):', error);
            // Clear selection on error
            setSelectedReplacementPlace(null);
            addToast({
              title: t('explore_toast_error'),
              description: t('explore_toast_could_not_save_selection'),
              variant: 'destructive',
            });
          },
        }
      );
      return; // Don't advance card in replace mode
    }
    
    // Normal mode: check if already in itinerary
    if (isInItinerary) {
      addToast({
        title: t('explore_toast_already_in_itinerary'),
        description: t('explore_toast_already_in_itinerary_desc'),
        variant: 'default',
      });
      // Still advance card so user can continue exploring
      setLastDirection('right');
      setCurrentIndex((prev) => {
        const newIndex = prev - 1;
        const clampedIndex = Math.max(0, Math.min(newIndex, places.length - 1));
        console.log(`[itinerary-swipe] advancing index from ${prev} to ${clampedIndex} (places.length: ${places.length})`);
        return clampedIndex;
      });
      return; // Don't add to liked places
    }
    
    // Normal mode: advance card and like the place
    setLastDirection('right');
    setCurrentIndex((prev) => {
      const newIndex = prev - 1;
      // Clamp to valid range: [0, places.length - 1]
      const clampedIndex = Math.max(0, Math.min(newIndex, places.length - 1));
      console.log(`[itinerary-swipe] advancing index from ${prev} to ${clampedIndex} (places.length: ${places.length})`);
      return clampedIndex;
    });
    
    // In day mode, immediately add to day instead of just liking
    if (mode === 'day' && dayId && slot) {
      console.log(`[itinerary-swipe] day mode: adding place ${placeId} to day ${dayId}, slot ${slot}`);
      try {
        const response = await fetch(`/api/trips/${tripId}/days/${dayId}/activities/bulk-add-from-swipes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            place_ids: [placeId],
            slot,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Unknown error' }));
          
          // Handle specific error types
          if (error.error === 'day_activity_limit') {
            addToast({
              title: t('explore_toast_day_full'),
              description: error.message || t('explore_toast_day_full_desc'),
              variant: 'destructive',
            });
            // Rollback UI - clamp to valid range
            setCurrentIndex((prev) => {
              const newIndex = prev + 1;
              return Math.max(0, Math.min(newIndex, places.length - 1));
            });
            return;
          }
          
          if (error.error === 'past_day_locked') {
            addToast({
              title: t('explore_toast_cannot_modify_past'),
              description: error.message || t('explore_toast_cannot_modify_past_desc'),
              variant: 'destructive',
            });
            // Rollback UI - clamp to valid range
            setCurrentIndex((prev) => {
              const newIndex = prev + 1;
              return Math.max(0, Math.min(newIndex, places.length - 1));
            });
            return;
          }
          
          // Handle other error status codes
          if (response.status === 401 || response.status === 403) {
            addToast({
              title: t('explore_toast_access_denied'),
              description: error.error || t('explore_toast_access_denied_desc'),
              variant: 'destructive',
            });
          } else if (response.status === 404) {
            addToast({
              title: t('explore_toast_not_found'),
              description: error.error || t('explore_toast_not_found_desc'),
              variant: 'destructive',
            });
          } else {
            addToast({
              title: t('explore_toast_error'),
              description: error.error || t('explore_toast_could_not_add_day'),
              variant: 'destructive',
            });
          }
          
          // Rollback UI on error - clamp to valid range
          setCurrentIndex((prev) => {
            const newIndex = prev + 1;
            return Math.max(0, Math.min(newIndex, places.length - 1));
          });
          return;
        }

        const result = await response.json();
        console.log(`[itinerary-swipe] place added to day: ${result.addedCount} place(s) added`);
        
        // Show success toast
        if (result.addedCount > 0) {
          addToast({
            title: t('explore_toast_place_added'),
            description: t('explore_toast_added_to_slot').replace('{slot}', slot),
            variant: 'success',
          });
        }
        
        // Also like the place for session tracking
        console.log(`[itinerary-swipe] API call: like for place ${placeId} (day mode)`);
        swipeMutation.mutate(
          { 
            placeId, 
            action: 'like', 
            source: 'day',
            dayId: dayId,
            slot: slot,
          },
          {
            onSuccess: (res) => {
              if (res?.limitReached) {
                console.log('[itinerary-swipe] limit reached (day mode)');
                return;
              }
              console.log('[itinerary-swipe] like API call successful (day mode)');
              // Track swipe in history for undo (max 3)
              setSwipeHistory((prev) => {
                const newHistory: Array<{ placeId: string; action: 'like' | 'dislike' }> = [
                  { placeId, action: 'like' as const },
                  ...prev,
                ];
                return newHistory.slice(0, 3);
              });
              
              // Call callback to refresh itinerary
              if (onAddToDay) {
                onAddToDay([placeId]);
              }
            },
            onError: (error) => {
              console.error('[itinerary-swipe] like API call failed (day mode):', error);
              // Don't rollback UI since we already added to day
            },
          }
        );
      } catch (error: any) {
        console.error('[itinerary-swipe] error adding place to day:', error);
        // Rollback UI on error
        setCurrentIndex((prev) => Math.min(prev + 1, places.length - 1));
        // Only show toast if we haven't already shown one
        if (!error.toastShown) {
          addToast({
            title: t('explore_toast_error'),
            description: error.message || t('explore_toast_could_not_add_day'),
            variant: 'destructive',
          });
        }
      }
    } else {
      // Trip mode: just like the place
      console.log(`[itinerary-swipe] trip mode: API call: like for place ${placeId}`);
      swipeMutation.mutate(
        { 
          placeId, 
          action: 'like', 
          source: mode === 'day' ? 'day' : 'trip',
          dayId: mode === 'day' ? dayId : undefined,
          slot: mode === 'day' ? slot : undefined,
        },
        {
          onSuccess: (res) => {
            if (res?.limitReached) {
              console.log('[itinerary-swipe] limit reached, rolling back index');
              // Rollback UI if limit reached
              setCurrentIndex((prev) => Math.min(prev + 1, places.length - 1));
              return;
            }
            console.log('[itinerary-swipe] like API call successful (trip mode)');
            // Track swipe in history for undo (max 3)
            setSwipeHistory((prev) => {
              const newHistory: Array<{ placeId: string; action: 'like' | 'dislike' }> = [
                { placeId, action: 'like' as const },
                ...prev,
              ];
              return newHistory.slice(0, 3);
            });
          },
          onError: (error) => {
            console.error('[itinerary-swipe] like API call failed (trip mode):', error);
            // Rollback UI on error
            setCurrentIndex((prev) => Math.min(prev + 1, places.length - 1));
            addToast({
              title: t('explore_toast_error'),
              description: t('explore_toast_could_not_save_swipe'),
              variant: 'destructive',
            });
          },
        }
      );
    }
  };

  const handleSwipeUp = () => {
    // Guard: ensure index is valid before accessing places array
    if (currentIndex < 0 || currentIndex >= places.length) {
      console.log('[itinerary-swipe] handleSwipeUp: invalid index', currentIndex, 'places.length:', places.length);
      return;
    }
    const place = places[currentIndex];
    if (!place) {
      console.log('[itinerary-swipe] handleSwipeUp: no place at currentIndex', currentIndex);
      return;
    }
    console.log(`[itinerary-swipe] swipe up triggered for place ${place.place_id} (${place.name})`);
    setLastDirection('up');
    setSelectedPlaceId(place.place_id);
    setSelectedPlaceName(place.name);
    setDetailsDrawerOpen(true);
  };

  const handleUndo = async () => {
    if (swipeHistory.length === 0) return;

    const lastSwipe = swipeHistory[0]; // Most recent swipe

    try {
      await swipeMutation.mutateAsync({
        placeId: lastSwipe.placeId,
        action: 'undo',
        previousAction: lastSwipe.action,
        source: mode,
        dayId: mode === 'day' ? dayId : undefined,
        slot: mode === 'day' ? slot : undefined,
      });

      // Remove from history
      setSwipeHistory((prev) => prev.slice(1));
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Undo error:', error);
    }
  };

  const handleAddToDay = async () => {
    if (!safeSession || (safeSession.likedPlaces?.length ?? 0) === 0 || !dayId || !slot) return;

    try {
      const response = await fetch(`/api/trips/${tripId}/days/${dayId}/activities/bulk-add-from-swipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place_ids: safeSession.likedPlaces || [],
          slot,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        
        // Handle specific error types
        if (error.error === 'day_activity_limit') {
          addToast({
            title: t('explore_toast_day_full'),
            description: error.message || t('explore_toast_day_full_desc'),
            variant: 'destructive',
          });
          return;
        }
        
        if (error.error === 'past_day_locked') {
          addToast({
            title: t('explore_toast_cannot_modify_past'),
            description: error.message || t('explore_toast_cannot_modify_past_desc'),
            variant: 'destructive',
          });
          return;
        }
        
        // Handle other error status codes
        if (response.status === 401 || response.status === 403) {
          addToast({
            title: t('explore_toast_access_denied'),
            description: error.error || t('explore_toast_access_denied_desc'),
            variant: 'destructive',
          });
        } else if (response.status === 404) {
          addToast({
            title: t('explore_toast_not_found'),
            description: error.error || t('explore_toast_not_found_desc'),
            variant: 'destructive',
          });
        } else {
          addToast({
            title: t('explore_toast_error'),
            description: error.error || t('explore_toast_could_not_add_places_day'),
            variant: 'destructive',
          });
        }
        
        return;
      }

      const result = await response.json();
      
      // Show success toast
      if (result.addedCount > 0) {
        const placeText = result.addedCount === 1 ? t('explore_place_one') : t('explore_place_many');
        addToast({
          title: t('explore_toast_places_added'),
          description: t('explore_toast_places_added_slot').replace('{count}', result.addedCount.toString()).replace('{slot}', slot),
          variant: 'success',
        });
      }
      
      // Call the callback
      if (onAddToDay) {
        onAddToDay(safeSession.likedPlaces || []);
      }
    } catch (error: any) {
      console.error('Error adding places to day:', error);
      addToast({
        title: t('explore_toast_error'),
        description: error.message || t('explore_toast_could_not_add_places_day'),
        variant: 'destructive',
      });
    }
  };

  // Calculate currentPlace before early returns (for useEffect hook)
  // Ensure index is valid before accessing array
  const currentPlace = (currentIndex >= 0 && currentIndex < places.length && places.length > 0) ? places[currentIndex] : null;
  const currentPlaceId = currentPlace?.place_id;

  // Track last notified placeId to prevent duplicate calls
  const lastNotifiedPlaceIdRef = useRef<string | null>(null);
  const lastNotifiedPlaceRef = useRef<ExplorePlace | null>(null);

  // Notify parent when active place changes (for map focus - legacy, kept for backwards compatibility)
  // This hook must be called before any early returns (Rules of Hooks)
  useEffect(() => {
    // Extract place data inside effect (currentPlace is in scope from above)
    if (!currentPlace || !onActivePlaceChange) return;
    
    // Only notify if placeId actually changed (ref guard prevents duplicate calls)
    if (currentPlaceId === lastNotifiedPlaceIdRef.current) return;
    
    // Update ref before calling callback to prevent duplicate calls
    lastNotifiedPlaceIdRef.current = currentPlaceId ?? null;
    
    // Extract placeId, lat, lng from currentPlace inside effect
    onActivePlaceChange({
      placeId: currentPlace.place_id,
      lat: currentPlace.lat,
      lng: currentPlace.lng,
    });
    // Note: onActivePlaceChange is now memoized in ExploreTab, so it's stable
    // The ref guard (lastNotifiedPlaceIdRef) prevents infinite loops even if callback changes
  }, [currentPlace, currentPlaceId, onActivePlaceChange]); // Ref guard prevents duplicate calls per placeId

  // Notify parent when current place changes (for place details card)
  useEffect(() => {
    if (!onCurrentPlaceChange) return;
    
    // Only notify if place actually changed (ref guard prevents duplicate calls)
    const prevPlace = lastNotifiedPlaceRef.current;
    if (prevPlace?.place_id === currentPlace?.place_id) return;
    
    // Update ref before calling callback
    lastNotifiedPlaceRef.current = currentPlace ?? null;
    
    // Call callback with full place object or null
    onCurrentPlaceChange(currentPlace ?? null);
  }, [currentPlace, onCurrentPlaceChange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-sm text-muted-foreground">{t('explore_loading_places')}</div>
      </div>
    );
  }

  if (placesError) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-sm text-destructive">{t('explore_error_loading')}</div>
      </div>
    );
  }

  if (places.length === 0) {
    // Show different message if we filtered out all places vs no results from API
    const hasRawPlaces = rawPlaces.length > 0;
    const message = hasRawPlaces && !filters.includeItineraryPlaces
      ? t('explore_empty_no_more_new')
      : t('explore_empty_no_places');

    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-sm text-muted-foreground">{message}</div>
      </div>
    );
  }

  // Guard: ensure we have a valid place before rendering SwipeableCard
  if (currentIndex < 0 || currentIndex >= places.length || !currentPlace) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-sm text-muted-foreground">
          {t('explore_empty_no_more')}
        </div>
      </div>
    );
  }

  const hasLikedPlaces = safeSession && (safeSession.likedPlaces?.length ?? 0) > 0;

  const cardVariants = {
    enter: { opacity: 0, scale: 0.95, y: 20 },
    center: { opacity: 1, scale: 1, y: 0 },
    exitRight: { opacity: 0, x: 200, rotate: 12 },
    exitLeft: { opacity: 0, x: -200, rotate: -12 },
    exitUp: { opacity: 0, y: -200 },
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-full">
        {/* Card area - flex-1 with max-height constraint to leave space for buttons */}
        {/* Max height calculation: 100vh - header/padding (~200px) - buttons area (~100px) = ~calc(100vh - 300px) */}
        <div className="flex items-center justify-center w-full flex-1 min-h-0 max-h-[calc(100vh-300px)] lg:max-h-[600px]">
          {/* Full screen on mobile, larger on desktop */}
          <div className="relative w-full h-full lg:max-w-[600px] flex items-center justify-center z-10">
            <AnimatePresence mode="wait">
              {currentPlace && (
                <motion.div
                  key={currentPlace.place_id}
                  variants={cardVariants}
                  initial="enter"
                  animate="center"
                  exit={lastDirection === 'right' ? 'exitRight' : lastDirection === 'left' ? 'exitLeft' : lastDirection === 'up' ? 'exitUp' : 'exitRight'}
                  className="w-full h-full max-h-full flex items-center justify-center"
                >
                  <SwipeableCard
                    place={currentPlace}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    onSwipeUp={handleSwipeUp}
                    disabled={
                      swipeMutation.isPending ||
                      (safeSession?.remainingSwipes != null && safeSession.remainingSwipes <= 0)
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action buttons - Fixed height area, always visible, never covered by card */}
        <div className="flex-shrink-0 mt-2 lg:mt-6 z-20">
          <ExploreActions
            onUndo={handleUndo}
            onDislike={handleSwipeLeft}
            onLike={handleSwipeRight}
            onDetails={handleSwipeUp}
            canUndo={swipeHistory.length > 0}
            disabled={
              swipeMutation.isPending ||
              (safeSession?.remainingSwipes != null && safeSession.remainingSwipes <= 0)
            }
          />
        </div>

        {/* Replace mode label */}
        {replaceTarget && replacingActivityName && (
          <div className="mt-4 px-4 w-full max-w-[480px] text-center">
            <p className="text-sm text-muted-foreground">
              {t('explore_replace_mode_replacing').replace('{name}', replacingActivityName)}
            </p>
          </div>
        )}

        {/* Selected replacement indicator */}
        {replaceTarget && selectedReplacementPlace && (
          <div className="mt-2 px-4 w-full max-w-[480px] text-center">
            <p className="text-sm text-muted-foreground">
              {t('explore_replace_mode_selected').replace('{name}', selectedReplacementPlace.name)}
            </p>
          </div>
        )}

        {/* Trip-level "Add liked places to itinerary" CTA or Replace button */}
        {mode === 'trip' && onAddToItinerary ? (
          <div className="mt-4 lg:mt-6 px-4 w-full max-w-[480px]">
            {replaceTarget ? (
              // Replace mode: show button when replacement is selected
              selectedReplacementPlace ? (
                <Button
                  onClick={() => onAddToItinerary?.(selectedReplacementPlace)}
                  className="w-full bg-coral hover:bg-coral/90 text-white shadow-lg"
                  size="lg"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {t('explore_replace_mode_button').replace('{name}', selectedReplacementPlace.name)}
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 cursor-not-allowed shadow-lg"
                  size="lg"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {t('explore_replace_mode_select')}
                </Button>
              )
            ) : (
              // Normal mode: show add button when there are liked places
              hasLikedPlaces ? (
                <Button
                  onClick={() => onAddToItinerary?.()}
                  className="w-full bg-coral hover:bg-coral/90 text-white shadow-lg"
                  size="lg"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {t('explore_add_liked_places').replace('{count}', (safeSession.likedPlaces?.length ?? 0).toString())}
                </Button>
              ) : null
            )}
          </div>
        ) : null}
      </div>

      {/* Place Details Drawer */}
      <PlaceDetailsDrawer
        open={detailsDrawerOpen}
        onOpenChange={setDetailsDrawerOpen}
        placeId={selectedPlaceId}
        placeName={selectedPlaceName}
        onAddToPlan={() => {
          // Handle add to plan (save to saved_places)
          if (selectedPlaceId) {
            const place = places.find(p => p.place_id === selectedPlaceId);
            if (place && onAddToItinerary) {
              // For now, just like the place and show message
              // In future, can implement a separate "save to plan" action
              swipeMutation.mutate(
                { 
                  placeId: selectedPlaceId, 
                  action: 'like', 
                  source: mode,
                  dayId: mode === 'day' ? dayId : undefined,
                  slot: mode === 'day' ? slot : undefined,
                },
                {
                  onSuccess: () => {
                    setDetailsDrawerOpen(false);
                  },
                }
              );
            }
          }
        }}
        onAddToItinerary={() => {
          // Like the place when user clicks "Add to itinerary"
          if (selectedPlaceId) {
            swipeMutation.mutate(
              { 
                placeId: selectedPlaceId, 
                action: 'like', 
                source: mode,
                dayId: mode === 'day' ? dayId : undefined,
                slot: mode === 'day' ? slot : undefined,
              },
              {
                onSuccess: () => {
                  setDetailsDrawerOpen(false);
                },
              }
            );
          }
        }}
      />
    </>
  );

  // ============================================
  // ORIGINAL CODE (COMMENTED OUT FOR DEBUGGING)
  // ============================================
  /*
  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {/* Header with swipe counter and undo button - Hidden when hideHeader is true *//*
      {!hideHeader && (
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold">Discover Places</h2>
          <div className="flex items-center gap-2 sm:gap-4">
            {swipeHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={swipeMutation.isPending}
                className="text-sm min-h-[44px] min-w-[44px] touch-manipulation"
              >
                <Undo2 className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Undo</span>
              </Button>
            )}
            <SwipeCounter tripId={tripId} />
          </div>
        </div>
      )}
      
      {/* Undo button - Show in corner when header is hidden *//*
      {hideHeader && swipeHistory.length > 0 && (
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={swipeMutation.isPending}
            className="text-sm min-h-[44px] min-w-[44px] touch-manipulation bg-white/90 backdrop-blur-sm shadow-md"
          >
            <Undo2 className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Undo</span>
          </Button>
        </div>
      )}

      {/* Card Stack *//*
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading places…</p>
          </div>
        ) : isError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <p className="text-lg font-medium mb-2 text-destructive">Unable to load places</p>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              We&apos;re having trouble loading places right now. Please check your connection and try again.
            </p>
            <Button onClick={() => refetchPlaces()} variant="outline" size="lg">
              Try Again
            </Button>
          </div>
        ) : !places || places.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <p className="text-sm text-muted-foreground">No places found. Try changing filters.</p>
          </div>
        ) : currentIndex < 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <p className="text-sm text-muted-foreground">No more places. Try changing filters.</p>
          </div>
        ) : isLimitReached && !hasMoreCards ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <p className="text-lg font-medium mb-2">Trip swipe limit reached</p>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              {hasLikedPlaces
                ? `You've reached your trip limit of ${session?.dailyLimit || 10} swipes. You've liked ${likedCount} place${likedCount !== 1 ? 's' : ''}. Upgrade to Pro for unlimited swipes!`
                : `You've reached your trip limit of ${session?.dailyLimit || 10} swipes. Upgrade to Pro for unlimited swipes!`}
            </p>
            <div className="flex flex-col gap-3 items-center">
              {hasLikedPlaces && (
                mode === 'day' && dayId && slot ? (
                  <Button onClick={handleAddToDay} size="lg">
                    <Heart className="mr-2 h-4 w-4" />
                    Add {likedCount} place{likedCount !== 1 ? 's' : ''} to {slot}
                  </Button>
                ) : onAddToItinerary ? (
                  <Button onClick={onAddToItinerary} size="lg">
                    <Heart className="mr-2 h-4 w-4" />
                    Add {likedCount} place{likedCount !== 1 ? 's' : ''} to itinerary
                  </Button>
                ) : null
              )}
              <Button 
                onClick={() => openPaywall({ reason: "pro_feature", source: "explore_deck_upgrade", tripId })} 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            </div>
          </div>
        ) : !hasMoreCards ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <p className="text-lg font-medium mb-2">No more places to explore</p>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              {hasLikedPlaces
                ? `You've liked ${likedCount} place${likedCount !== 1 ? 's' : ''}. Ready to add them to your itinerary?`
                : "You've explored everything in this area. Try changing filters or exploring another day."}
            </p>
            {hasLikedPlaces && (
              mode === 'day' && dayId && slot ? (
                <Button onClick={handleAddToDay} size="lg">
                  <Heart className="mr-2 h-4 w-4" />
                  Add {likedCount} place{likedCount !== 1 ? 's' : ''} to {slot}
                </Button>
              ) : onAddToItinerary ? (
                <Button onClick={onAddToItinerary} size="lg">
                  <Heart className="mr-2 h-4 w-4" />
                  Add {likedCount} place{likedCount !== 1 ? 's' : ''} to itinerary
                </Button>
              ) : null
            )}
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Onboarding Tooltip *//*
            {showOnboarding && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold">How to Explore</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setShowOnboarding(false);
                        localStorage.setItem('explore-onboarding-seen', 'true');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700">
                        <Heart className="h-4 w-4" />
                      </div>
                      <span><strong>Swipe right</strong> or click the heart to like a place</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700">
                        <X className="h-4 w-4" />
                      </div>
                      <span><strong>Swipe left</strong> or click X to pass</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700">
                        <ArrowUp className="h-4 w-4" />
                      </div>
                      <span><strong>Swipe up</strong> or click the arrow to view details</span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => {
                      setShowOnboarding(false);
                      localStorage.setItem('explore-onboarding-seen', 'true');
                    }}
                  >
                    Got it!
                  </Button>
                </div>
              </div>
            )}
            <AnimatePresence mode="popLayout">
              {/* Show next 2 cards as preview - Larger cards for desktop, fill most of height *//*
              {places.slice(Math.max(0, currentIndex), currentIndex + 3).map((place, idx) => {
                const baseTransform = 'translate(-50%, -50%)';
                const scaleTransform = idx > 0 ? `scale(${1 - idx * 0.05})` : '';
                const translateYTransform = idx > 0 ? `translateY(${idx * 8}px)` : '';
                const combinedTransform = `${baseTransform} ${scaleTransform} ${translateYTransform}`.trim();
                
                return (
                  <div
                    key={`${place.place_id}-${currentIndex + idx}`}
                    className="absolute left-1/2 top-1/2 w-full max-w-2xl h-full max-h-[80vh]"
                    style={{
                      zIndex: 3 - idx,
                      transform: combinedTransform,
                    }}
                  >
                    <SwipeableCard
                      place={place}
                      onSwipe={idx === 0 ? handleSwipe : () => {}}
                      disabled={
                        idx !== 0 ||
                        swipeMutation.isPending ||
                        (safeSession?.remainingSwipes != null && safeSession.remainingSwipes <= 0)
                      }
                    />
                  </div>
                );
              })}
            </AnimatePresence>

            {/* Loading indicator when fetching more *//*
            {isLoading && places.length > 0 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with action summary *//*
      {hasLikedPlaces && (
        <div className="p-4 border-t bg-muted/50 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              {likedCount} place{likedCount !== 1 ? 's' : ''} liked
            </span>
            {mode === 'day' && dayId && slot ? (
              <Button onClick={handleAddToDay} size="sm" className="min-h-[44px] touch-manipulation">
                <Heart className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Add to {slot}</span>
                <span className="sm:hidden">Add</span>
              </Button>
            ) : onAddToItinerary ? (
              <Button onClick={onAddToItinerary} size="sm" className="min-h-[44px] touch-manipulation">
                <Heart className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Add to itinerary</span>
                <span className="sm:hidden">Add</span>
              </Button>
            ) : null}
          </div>
        </div>
      )}

      {/* Place Details Drawer *//*
      <PlaceDetailsDrawer
        open={detailsDrawerOpen}
        onOpenChange={setDetailsDrawerOpen}
        placeId={selectedPlaceId}
        placeName={selectedPlaceName}
        onAddToPlan={() => {
          // Handle add to plan (save to saved_places)
          if (selectedPlaceId) {
            const place = places.find(p => p.place_id === selectedPlaceId);
            if (place && onAddToItinerary) {
              // For now, just like the place and show message
              // In future, can implement a separate "save to plan" action
              swipeMutation.mutate(
                { placeId: selectedPlaceId, action: 'like', source: mode },
                {
                  onSuccess: () => {
                    setDetailsDrawerOpen(false);
                  },
                }
              );
            }
          }
        }}
        onAddToItinerary={() => {
          // Like the place when user clicks "Add to itinerary"
          if (selectedPlaceId) {
            swipeMutation.mutate(
              { placeId: selectedPlaceId, action: 'like', source: mode },
              {
                onSuccess: () => {
                  setDetailsDrawerOpen(false);
                  // Optionally remove from deck or keep it
                },
              }
            );
          }
        }}
      />
    </div>
  );
  */
}

