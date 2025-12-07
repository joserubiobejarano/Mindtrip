"use client";

import { useState, useEffect, useMemo } from 'react';
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

interface ExploreDeckProps {
  tripId: string;
  filters?: ExploreFilters;
  mode?: 'trip' | 'day';
  dayId?: string;
  slot?: 'morning' | 'afternoon' | 'evening';
  areaCluster?: string;
  tripSegmentId?: string;
  onAddToItinerary?: () => void;
  onAddToDay?: (placeIds: string[]) => void;
  onActivePlaceChange?: (place: { placeId: string; lat: number; lng: number }) => void;
  className?: string;
  hideHeader?: boolean;
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
  className,
  hideHeader = false,
}: ExploreDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedPlaceName, setSelectedPlaceName] = useState<string | undefined>(undefined);
  const [swipeHistory, setSwipeHistory] = useState<Array<{ placeId: string; action: 'like' | 'dislike' }>>([]);
  const [lastDirection, setLastDirection] = useState<'left' | 'right' | 'up' | null>(null);

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
  const swipeMutation = useSwipeAction(tripId, tripSegmentId);
  const { addToast } = useToast();

  // Derive places directly from hook result
  const places = data?.places ?? [];

  // Sync currentIndex with places.length
  useEffect(() => {
    if (places.length > 0) {
      setCurrentIndex((prev) => {
        // if index is uninitialized or out of range, go to last card
        if (prev === -1 || prev >= places.length) return places.length - 1;
        return prev;
      });
    } else {
      setCurrentIndex(-1);
    }
  }, [places.length]);

  const handleSwipeLeft = () => {
    const place = places[currentIndex];
    if (!place) return;
    const placeId = place.place_id;
    setLastDirection('left');
    setCurrentIndex((prev) => prev - 1);
    swipeMutation.mutate(
      { placeId, action: 'dislike', source: mode === 'day' ? 'day' : 'trip' },
      {
        onSuccess: (res) => {
          if (res?.limitReached) {
            // Rollback UI if limit reached
            setCurrentIndex((prev) => Math.min(prev + 1, places.length - 1));
            return;
          }
          // Track swipe in history for undo (max 3)
          setSwipeHistory((prev) => {
            const newHistory: Array<{ placeId: string; action: 'like' | 'dislike' }> = [
              { placeId, action: 'dislike' as const },
              ...prev,
            ];
            return newHistory.slice(0, 3);
          });
        },
        onError: () => {
          // Rollback UI on error
          setCurrentIndex((prev) => Math.min(prev + 1, places.length - 1));
          addToast({
            title: 'Error',
            description: 'Could not save swipe. Please try again.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleSwipeRight = async () => {
    const place = places[currentIndex];
    if (!place) return;
    const placeId = place.place_id;
    setLastDirection('right');
    setCurrentIndex((prev) => prev - 1);
    
    // In day mode, immediately add to day instead of just liking
    if (mode === 'day' && dayId && slot) {
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
          const error = await response.json();
          throw new Error(error.error || 'Failed to add place to day');
        }

        const result = await response.json();
        
        // Show success toast
        if (result.addedCount > 0) {
          addToast({
            title: 'Place added',
            description: `Added to ${slot}`,
            variant: 'success',
          });
        }
        
        // Also like the place for session tracking
        swipeMutation.mutate(
          { placeId, action: 'like', source: 'day' },
          {
            onSuccess: (res) => {
              if (res?.limitReached) {
                return;
              }
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
            onError: () => {
              // Don't rollback UI since we already added to day
            },
          }
        );
      } catch (error: any) {
        // Rollback UI on error
        setCurrentIndex((prev) => Math.min(prev + 1, places.length - 1));
        addToast({
          title: 'Error',
          description: error.message || 'Could not add place to day. Please try again.',
          variant: 'destructive',
        });
      }
    } else {
      // Trip mode: just like the place
      swipeMutation.mutate(
        { placeId, action: 'like', source: mode === 'day' ? 'day' : 'trip' },
        {
          onSuccess: (res) => {
            if (res?.limitReached) {
              // Rollback UI if limit reached
              setCurrentIndex((prev) => Math.min(prev + 1, places.length - 1));
              return;
            }
            // Track swipe in history for undo (max 3)
            setSwipeHistory((prev) => {
              const newHistory: Array<{ placeId: string; action: 'like' | 'dislike' }> = [
                { placeId, action: 'like' as const },
                ...prev,
              ];
              return newHistory.slice(0, 3);
            });
          },
          onError: () => {
            // Rollback UI on error
            setCurrentIndex((prev) => Math.min(prev + 1, places.length - 1));
            addToast({
              title: 'Error',
              description: 'Could not save swipe. Please try again.',
              variant: 'destructive',
            });
          },
        }
      );
    }
  };

  const handleSwipeUp = () => {
    const place = places[currentIndex];
    if (!place) return;
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
      });

      // Remove from history
      setSwipeHistory((prev) => prev.slice(1));
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Undo error:', error);
    }
  };

  const handleAddToDay = async () => {
    if (!session || session.likedPlaces.length === 0 || !dayId || !slot) return;

    try {
      const response = await fetch(`/api/trips/${tripId}/days/${dayId}/activities/bulk-add-from-swipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place_ids: session.likedPlaces,
          slot,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add places to day');
      }

      const result = await response.json();
      
      // Show success toast
      if (result.addedCount > 0) {
        addToast({
          title: 'Places added',
          description: `${result.addedCount} place${result.addedCount !== 1 ? 's' : ''} added to ${slot}`,
          variant: 'success',
        });
      }
      
      // Call the callback
      if (onAddToDay) {
        onAddToDay(session.likedPlaces);
      }
    } catch (error: any) {
      console.error('Error adding places to day:', error);
    }
  };

  // Calculate currentPlace before early returns (for useEffect hook)
  const currentPlace = currentIndex >= 0 && places.length > 0 ? places[currentIndex] : null;
  const currentPlaceId = currentPlace?.place_id;
  const currentPlaceLat = currentPlace?.lat;
  const currentPlaceLng = currentPlace?.lng;

  // Notify parent when active place changes (for map focus)
  // This hook must be called before any early returns (Rules of Hooks)
  useEffect(() => {
    if (!currentPlace || !onActivePlaceChange) return;
    
    onActivePlaceChange({
      placeId: currentPlace.place_id,
      lat: currentPlace.lat,
      lng: currentPlace.lng,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlaceId, currentPlaceLat, currentPlaceLng, onActivePlaceChange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-sm text-muted-foreground">Loading places…</div>
      </div>
    );
  }

  if (placesError) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-sm text-destructive">Error loading places. Please try again.</div>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-sm text-muted-foreground">No places found. Try changing filters.</div>
      </div>
    );
  }

  if (currentIndex < 0 || !currentPlace) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-sm text-muted-foreground">
          No more places. Try changing filters.
        </div>
      </div>
    );
  }

  const hasLikedPlaces = session && session.likedPlaces.length > 0;

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
        <div className="flex items-center justify-center w-full flex-1 min-h-0">
          {/* Full screen on mobile, constrained on desktop */}
          <div className="relative w-full h-full lg:max-w-[480px] lg:h-auto flex items-center justify-center z-10">
            <AnimatePresence mode="wait">
              {currentPlace && (
                <motion.div
                  key={currentPlace.place_id}
                  variants={cardVariants}
                  initial="enter"
                  animate="center"
                  exit={lastDirection === 'right' ? 'exitRight' : lastDirection === 'left' ? 'exitLeft' : lastDirection === 'up' ? 'exitUp' : 'exitRight'}
                  className="w-full h-full flex items-center justify-center"
                >
                  <SwipeableCard
                    place={currentPlace}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    onSwipeUp={handleSwipeUp}
                    disabled={
                      swipeMutation.isPending ||
                      (session?.remainingSwipes != null && session.remainingSwipes <= 0)
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action buttons - Just below the card */}
        <div className="flex-shrink-0 mt-2 lg:mt-6 z-20">
          <ExploreActions
            onUndo={handleUndo}
            onDislike={handleSwipeLeft}
            onLike={handleSwipeRight}
            onDetails={handleSwipeUp}
            canUndo={swipeHistory.length > 0}
            disabled={
              swipeMutation.isPending ||
              (session?.remainingSwipes != null && session.remainingSwipes <= 0)
            }
          />
        </div>

        {/* Trip-level "Add liked places to itinerary" CTA */}
        {mode === 'trip' && hasLikedPlaces && onAddToItinerary && (
          <div className="mt-4 lg:mt-6 px-4 w-full max-w-[480px]">
            <Button
              onClick={onAddToItinerary}
              className="w-full bg-coral hover:bg-coral/90 text-white shadow-lg"
              size="lg"
            >
              <Heart className="h-4 w-4 mr-2" />
              Add {session.likedPlaces.length} liked place{session.likedPlaces.length !== 1 ? 's' : ''} to itinerary
            </Button>
          </div>
        )}
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
                onClick={() => window.location.href = '/settings?upgrade=true'} 
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
                        (session?.remainingSwipes != null && session.remainingSwipes <= 0)
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

