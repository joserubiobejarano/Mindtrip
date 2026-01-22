"use client";

import { useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Star, MapPin, Check, Lock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExplorePlaces } from '@/hooks/use-explore';
import { useTripActivities } from '@/hooks/use-trip-activities';
import { getItineraryPlaceKeys, normalizePlaceKey } from '@/lib/itinerary/dedupe';
import type { ExploreFilters, ExplorePlace } from '@/lib/google/explore-places';
import { useLanguage } from '@/components/providers/language-provider';
import { usePaywall } from '@/hooks/usePaywall';
import { useTripProStatus } from '@/hooks/use-trip-pro-status';
import { Loader2 } from 'lucide-react';

interface ExplorePlaceListProps {
  tripId: string;
  filters?: ExploreFilters;
  tripSegmentId?: string;
}

export function ExplorePlaceList({
  tripId,
  filters = {},
  tripSegmentId,
}: ExplorePlaceListProps) {
  const { data, isLoading, error } = useExplorePlaces(
    tripId,
    filters,
    true,
    undefined,
    undefined,
    tripSegmentId
  );
  const { data: activities = [], isLoading: activitiesLoading } = useTripActivities(tripId);
  const { data: proStatus } = useTripProStatus(tripId);
  const { t } = useLanguage();
  const { openPaywall } = usePaywall();

  const isPro = proStatus?.isProForThisTrip ?? false;

  // Get itinerary place keys for checking if places are already in itinerary
  const itineraryPlaceKeys = useMemo(() => {
    return getItineraryPlaceKeys(activities);
  }, [activities]);

  // Check if a place is already in itinerary
  const isPlaceInItinerary = useCallback((place: ExplorePlace): boolean => {
    // Primary match: place_id
    if (place.place_id && itineraryPlaceKeys.placeIds.has(place.place_id)) {
      return true;
    }

    // Fallback match: normalized name + area/city (only if place_id is missing)
    if (!place.place_id) {
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

  // Sort places by number of reviews (descending), then by rating (descending)
  const sortedPlaces = useMemo(() => {
    const places = Array.isArray(data?.places) ? data.places : [];
    return [...places].sort((a, b) => {
      // Primary sort: number of reviews (descending)
      const aReviews = a.user_ratings_total ?? 0;
      const bReviews = b.user_ratings_total ?? 0;
      if (bReviews !== aReviews) {
        return bReviews - aReviews;
      }
      // Secondary sort: rating (descending)
      const aRating = a.rating ?? 0;
      const bRating = b.rating ?? 0;
      return bRating - aRating;
    });
  }, [data?.places]);

  // Filter out places already in itinerary (if includeItineraryPlaces is false)
  const filteredPlaces = useMemo(() => {
    if (filters.includeItineraryPlaces) {
      return sortedPlaces;
    }
    return sortedPlaces.filter(place => !isPlaceInItinerary(place));
  }, [sortedPlaces, filters.includeItineraryPlaces, isPlaceInItinerary]);

  // Count unique places already in itinerary for free tier limit calculation
  const placesInItineraryCount = useMemo(() => {
    // Count unique places by place_id (external_id)
    // Activities can have the same place multiple times, so we count unique place_ids
    const uniquePlaceIds = new Set<string>();
    activities.forEach(activity => {
      if (activity.place?.external_id) {
        uniquePlaceIds.add(activity.place.external_id);
      }
    });
    return uniquePlaceIds.size;
  }, [activities]);

  // Apply Free tier limit: show (10 - places already in itinerary) places
  // So if user has added 1 place, show 9 more; if they've added 2, show 8 more, etc.
  const visiblePlaces = useMemo(() => {
    if (isPro) {
      return filteredPlaces;
    }
    const freeTierLimit = 10;
    const remainingSlots = Math.max(0, freeTierLimit - placesInItineraryCount);
    return filteredPlaces.slice(0, remainingSlots);
  }, [filteredPlaces, isPro, placesInItineraryCount]);

  const freeTierLimit = 10;
  const remainingSlots = Math.max(0, freeTierLimit - placesInItineraryCount);
  const hasMorePlaces = !isPro && filteredPlaces.length > remainingSlots;
  const hiddenCount = hasMorePlaces ? filteredPlaces.length - remainingSlots : 0;

  if (isLoading || activitiesLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">{t('explore_loading_places')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <p className="text-sm text-destructive">{t('explore_error_loading')}</p>
        </div>
      </div>
    );
  }

  if (filteredPlaces.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {filters.includeItineraryPlaces
              ? t('explore_empty_no_places')
              : t('explore_empty_no_more_new')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4 lg:p-6 lg:max-w-4xl lg:mx-auto">
          <div className="px-1">
            <h2 className="text-xl font-semibold text-foreground">
              Most touristic places
            </h2>
          </div>
          {visiblePlaces.map((place) => {
            const isInItinerary = isPlaceInItinerary(place);
            const mapUrl = place.place_id
              ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
              : place.lat && place.lng
                ? `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`
                : undefined;
            return (
              <div
                key={place.place_id}
                className="bg-white rounded-lg border border-sage/20 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="relative w-32 lg:w-40 flex-shrink-0 self-stretch overflow-hidden">
                    {place.photo_url ? (
                      <Image
                        src={place.photo_url}
                        alt={place.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 128px, 160px"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-200 via-pink-200 to-orange-200" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between p-4 min-w-0">
                    <div className="space-y-2">
                      {/* Name and Category */}
                      <div>
                        {mapUrl ? (
                          <a
                            href={mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-semibold text-foreground line-clamp-1 hover:text-coral transition-colors"
                          >
                            {place.name}
                          </a>
                        ) : (
                          <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                            {place.name}
                          </h3>
                        )}
                        {place.category && (
                          <span className="inline-block text-xs uppercase tracking-wider text-sage bg-sage/10 px-2 py-1 rounded-full mt-1">
                            {place.category}
                          </span>
                        )}
                      </div>

                      {/* Rating and Reviews */}
                      <div className="flex items-center gap-2 text-sm">
                        {place.rating != null && (
                          <>
                            <Star className="w-4 h-4 fill-coral text-coral" />
                            <span className="font-semibold">{place.rating.toFixed(1)}</span>
                          </>
                        )}
                        {place.user_ratings_total != null && place.user_ratings_total > 0 && (
                          <span className="text-muted-foreground">
                            ({place.user_ratings_total.toLocaleString()} {t('explore_reviews')})
                          </span>
                        )}
                      </div>

                      {/* Address */}
                      {place.address && (
                        <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{place.address}</span>
                        </div>
                      )}

                      {/* Already in itinerary badge */}
                      {isInItinerary && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{t('explore_already_in_itinerary')}</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {mapUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full sm:w-auto"
                        >
                          <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {t('explore_button_open_maps')}
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Free tier limit message */}
          {hasMorePlaces && (
            <div className="bg-muted/50 border border-sage/20 rounded-lg p-6 text-center space-y-4">
              <div className="flex items-center justify-center">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  {t('explore_upgrade_title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('explore_upgrade_message').replace('{count}', '100')}
                </p>
              </div>
              <Button
                onClick={() => openPaywall({ reason: "pro_feature", source: "explore_list_limit", tripId })}
                className="bg-coral hover:bg-coral/90 text-white"
              >
                {t('explore_upgrade_button')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
