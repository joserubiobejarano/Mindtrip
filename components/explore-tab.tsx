"use client";

import { useState, FormEvent, useEffect, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTrip } from "@/hooks/use-trip";
import { useDays } from "@/hooks/use-days";
import { AddToItineraryDialog } from "@/components/add-to-itinerary-dialog";
import { BaseMarker } from "@/components/google-map-base";
import { PlaceDetailsPanel } from "@/components/place-details-panel";
import { PlaceDetailsDrawer } from "@/components/place-details-drawer";
import { Loader2, Search, MapPin, Star, Hotel } from "lucide-react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import {
  savePlaceForTrip,
  removeSavedPlace,
  getSavedPlacesForTrip,
  getSavedPlaceIdsForTrip,
  type PlaceResult as SavedPlaceResult,
} from "@/lib/supabase/saved-places";
import { useToast } from "@/components/ui/toast";
import {
  getPlaceTypeForFilter,
  mapGooglePlaceToPlaceResult,
  searchNearbyPlaces,
  searchPlacesByText,
} from "@/lib/google-places";

interface PlaceResult {
  id: string; // Google place_id or external_id
  place_id?: string; // Database place ID (after upsert)
  name: string;
  address: string;
  lat: number;
  lng: number;
  category?: string;
  photoUrl?: string | null;
  types?: string[];
  googleMapsUrl?: string; // Google Maps URL for this place
  rating?: number; // For sorting
  user_ratings_total?: number; // For sorting
}

interface SavedPlace {
  id: string;
  trip_id: string;
  place_id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  photo_url: string | null;
  types: string[] | null;
  source: string;
  created_at: string;
}

interface ExploreTabProps {
  tripId: string;
  onMapUpdate?: (
    markers: import("@/components/google-map-base").BaseMarker[],
    center: { lat: number; lng: number } | null,
    zoom: number | undefined
  ) => void;
  onMarkerClickRef?: React.MutableRefObject<((id: string) => void) | null>;
}

type ExploreFilter =
  | "main"
  | "museums"
  | "parks"
  | "food"
  | "nightlife"
  | "shopping"
  | "neighborhoods";

interface Trip {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  default_currency: string;
  owner_id: string;
  center_lat: number | null;
  center_lng: number | null;
  budget_level: string | null;
  daily_budget: number | null;
  interests: string[] | null;
  destination_name: string | null;
  destination_country: string | null;
  destination_place_id: string | null;
}

const FILTER_PRESETS: Record<ExploreFilter, { label: string; query: string }> = {
  main: { label: "Main places", query: "tourist attractions" },
  museums: { label: "Museums", query: "museum" },
  parks: { label: "Parks & Nature", query: "park" },
  food: { label: "Food", query: "restaurant" },
  nightlife: { label: "Nightlife", query: "bar" },
  shopping: { label: "Shopping", query: "shop" },
  neighborhoods: { label: "Neighborhoods", query: "" },
} as const;

const FILTER_ORDER: ExploreFilter[] = [
  "main",
  "museums",
  "parks",
  "food",
  "nightlife",
  "shopping",
  "neighborhoods",
];

/**
 * Get a human-readable "good for" label based on place types
 */
function getGoodForLabel(types: string[] | undefined): string | null {
  if (!types || types.length === 0) return null;

  const t = types;

  if (t.includes("park") || t.includes("tourist_attraction")) {
    return "Ideal if you like parks and nature";
  }
  if (t.includes("museum") || t.includes("art_gallery")) {
    return "Ideal if you enjoy art and museums";
  }
  if (t.includes("restaurant") || t.includes("cafe")) {
    return "Great if you love food spots";
  }
  if (t.includes("bar") || t.includes("night_club")) {
    return "Nice if you like nightlife";
  }
  if (t.includes("shopping_mall") || t.includes("store")) {
    return "Perfect if you like shopping";
  }

  return null;
}

export function ExploreTab({ tripId, onMapUpdate, onMarkerClickRef }: ExploreTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<ExploreFilter>("main");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryWasTried, setQueryWasTried] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | SavedPlace | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [savedPlaceIds, setSavedPlaceIds] = useState<Set<string>>(new Set());
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savingPlaceId, setSavingPlaceId] = useState<string | null>(null);
  const detailsPanelRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();
  const { data: trip } = useTrip(tripId);
  const { data: days } = useDays(tripId);
  const supabase = createClient();
  const { addToast } = useToast();

  const mapServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  // Load saved places on mount
  useEffect(() => {
    if (tripId && user?.id) {
      loadSavedPlaces();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, user?.id]);

  // Initial load: search for main places when trip and places service are available
  useEffect(() => {
    if (
      trip &&
      mapServiceRef.current &&
      trip.center_lat != null &&
      trip.center_lng != null &&
      selectedFilter === "main"
    ) {
      searchPlaces({ filterKey: "main" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip?.id, mapServiceRef.current]);

  // Update map markers and center when results or saved places change
  useEffect(() => {
    if (!trip || trip.center_lat == null || trip.center_lng == null) {
      if (onMapUpdate) {
        onMapUpdate([], null, undefined);
      }
      return;
    }

    const markers: import("@/components/google-map-base").BaseMarker[] = [
      ...results.map((place) => ({
        id: place.place_id || place.id,
        lat: place.lat,
        lng: place.lng,
      })),
      ...savedPlaces
        .filter((place) => place.lat != null && place.lng != null)
        .map((place) => ({
          id: place.place_id,
          lat: place.lat!,
          lng: place.lng!,
        })),
    ];

    let center: { lat: number; lng: number } | null = null;
    let zoom: number | undefined = undefined;

    if (selectedPlace && selectedPlace.lat && selectedPlace.lng) {
      center = { lat: selectedPlace.lat, lng: selectedPlace.lng };
      zoom = 14;
    } else if (trip.center_lat != null && trip.center_lng != null) {
      center = { lat: trip.center_lat, lng: trip.center_lng };
      zoom = 12;
    }

    if (onMapUpdate) {
      onMapUpdate(markers, center, zoom);
    }
  }, [results, savedPlaces, selectedPlace, trip, onMapUpdate]);

  // Initialize PlacesService - create a temporary map instance for the service
  useEffect(() => {
    if (typeof window !== "undefined" && window.google && window.google.maps && !mapServiceRef.current) {
      // Create a temporary hidden map div to initialize PlacesService
      const tempDiv = document.createElement("div");
      tempDiv.style.display = "none";
      document.body.appendChild(tempDiv);
      const tempMap = new google.maps.Map(tempDiv, {
        center: { lat: 0, lng: 0 },
        zoom: 1,
      });
      mapServiceRef.current = new google.maps.places.PlacesService(tempMap);
      
      // Cleanup
      return () => {
        document.body.removeChild(tempDiv);
      };
    }
  }, []);

  const loadSavedPlaces = async () => {
    setLoadingSaved(true);
    try {
      const { data: savedIds, error: idsError } = await getSavedPlaceIdsForTrip(tripId);
      if (idsError) {
        console.error("Error loading saved place IDs:", idsError);
      } else if (savedIds) {
        setSavedPlaceIds(savedIds);
      }

      const { data: saved, error: savedError } = await getSavedPlacesForTrip(tripId);
      if (savedError) {
        console.error("Error loading saved places:", savedError);
      } else if (saved) {
        setSavedPlaces(saved);
      }
    } catch (err) {
      console.error("Error loading saved places:", err);
    } finally {
      setLoadingSaved(false);
    }
  };

  // Upsert place to database and return place_id
  const upsertPlace = async (
    place: PlaceResult
  ): Promise<string | null> => {
    if (!tripId) return null;

    try {
      // Check if place with this external_id (Google place_id) already exists for this trip
      const { data: existingPlace } = await supabase
        .from("places")
        .select("id")
        .eq("trip_id", tripId)
        .eq("external_id", place.id)
        .maybeSingle();

      if (existingPlace) {
        return existingPlace.id;
      }

      // Create new place
      const { data: newPlace, error: placeError } = await supabase
        .from("places")
        .insert({
          trip_id: tripId,
          external_id: place.id,
          name: place.name,
          address: place.address || null,
          lat: place.lat || null,
          lng: place.lng || null,
          category: place.category || null,
        })
        .select()
        .single();

      if (placeError) {
        console.error("Error creating place:", placeError);
        return null;
      }

      return newPlace?.id || null;
    } catch (err) {
      console.error("Error upserting place:", err);
      return null;
    }
  };

  const searchPlaces = async (options?: { filterKey?: ExploreFilter; textQuery?: string }) => {
    if (!trip || !mapServiceRef.current) return;

    const { filterKey, textQuery } = options ?? {};

    // Validate trip coordinates
    const hasCoordinates =
      trip.center_lat != null &&
      trip.center_lng != null &&
      !isNaN(trip.center_lat) &&
      !isNaN(trip.center_lng);

    if (!hasCoordinates) {
      setError("Trip location is required for searching places.");
      setResults([]);
      setQueryWasTried(true);
      return;
    }

    setLoading(true);
    setError(null);
    setQueryWasTried(true);

    try {
      const location = {
        lat: trip.center_lat!,
        lng: trip.center_lng!,
      };
      const cityName = trip.destination_name || "";

      let googlePlaces: Awaited<ReturnType<typeof searchNearbyPlaces>> | Awaited<ReturnType<typeof searchPlacesByText>>;

      const service = mapServiceRef.current;
      if (textQuery && textQuery.trim().length > 0) {
        // Text search: "<user text> in <city>"
        const query = cityName ? `${textQuery.trim()} in ${cityName}` : textQuery.trim();
        googlePlaces = await searchPlacesByText(service, query, location, 15000);
      } else if (filterKey === "neighborhoods") {
        // For neighborhoods, use text search with city name
        const query = cityName || trip.title;
        googlePlaces = await searchPlacesByText(service, query, location, 15000);
      } else if (filterKey === "main") {
        // For main places, search for tourist attractions (most important POIs)
        const query = cityName
          ? `top tourist attractions landmarks in ${cityName}`
          : "top tourist attractions landmarks";
        googlePlaces = await searchPlacesByText(service, query, location, 20000);
      } else if (filterKey) {
        // Filter-based search using nearbySearch
        const placeType = getPlaceTypeForFilter(filterKey);
        googlePlaces = await searchNearbyPlaces(service, location, placeType, 10000);
      } else {
        // Fallback: search for restaurants
        googlePlaces = await searchNearbyPlaces(service, location, "restaurant", 10000);
      }

      // Map Google Places results to our PlaceResult format
      let mapped: PlaceResult[] = googlePlaces.map((place) => {
        const result = mapGooglePlaceToPlaceResult(place);
        // Add Google Maps URL
        const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${result.id}`;
        // Preserve rating and user_ratings_total for sorting
        return {
          ...result,
          googleMapsUrl,
          rating: place.rating,
          user_ratings_total: place.user_ratings_total,
        } as PlaceResult & { rating?: number; user_ratings_total?: number };
      });

      // For main places, filter out food/nightlife places and sort by rating/reviews
      if (filterKey === "main") {
        const excludeTypes = [
          "restaurant",
          "cafe",
          "bar",
          "night_club",
          "food",
          "meal_takeaway",
          "meal_delivery",
          "bakery",
          "meal_delivery",
        ];
        mapped = mapped.filter((place) => {
          const types = place.types || [];
          return !types.some((type) => excludeTypes.includes(type));
        });
      }

      // Sort by user_ratings_total DESC, then rating DESC (especially important for main places)
      mapped.sort((a, b) => {
        const aRatings = (a as any).user_ratings_total || 0;
        const bRatings = (b as any).user_ratings_total || 0;
        if (bRatings !== aRatings) {
          return bRatings - aRatings;
        }
        const aRating = (a as any).rating || 0;
        const bRating = (b as any).rating || 0;
        return bRating - aRating;
      });

      // Limit main places to top 30 (most iconic spots)
      if (filterKey === "main") {
        mapped = mapped.slice(0, 30);
      }

      // Upsert all places to database and attach place_id
      const resultsWithPlaceIds = await Promise.all(
        mapped.map(async (place) => {
          const place_id = await upsertPlace(place);
          return { ...place, place_id: place_id || undefined };
        })
      );

      setResults(resultsWithPlaceIds);
      setError(
        resultsWithPlaceIds.length === 0
          ? "No results found. Try a different search."
          : null
      );
    } catch (err) {
      console.error("Error searching places", err);
      setError("Error searching places.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      setSelectedFilter(null);
      searchPlaces({ textQuery: searchQuery.trim() });
    }
  };

  const handleFilterClick = (filterKey: ExploreFilter) => {
    setSelectedFilter(filterKey);
    setSearchQuery("");
    if (filterKey) {
      searchPlaces({ filterKey });
    }
  };

  const handlePlaceSelect = useCallback((place: PlaceResult | SavedPlace) => {
    setSelectedPlace(place);
    // Get the Google place_id
    const placeId = isPlaceResult(place) ? place.id : place.place_id;
    setSelectedPlaceId(placeId);
    setDrawerOpen(true);
    
    // Update map center to selected place
    if (place.lat && place.lng) {
      if (onMapUpdate) {
        const markers: BaseMarker[] = [
          ...results.map((p) => ({
            id: p.place_id || p.id,
            lat: p.lat,
            lng: p.lng,
          })),
          ...savedPlaces
            .filter((p) => p.lat != null && p.lng != null)
            .map((p) => ({
              id: p.place_id,
              lat: p.lat!,
              lng: p.lng!,
            })),
        ];
        onMapUpdate(markers, { lat: place.lat, lng: place.lng }, 14);
      }
    }
  }, [results, savedPlaces, onMapUpdate]);

  const handleAddToItinerary = (place: PlaceResult | SavedPlace) => {
    setSelectedPlace(place);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    // Don't clear selectedPlace when closing dialog, keep it selected for the map/details panel
  };

  const handleSaveToPlan = async (place: PlaceResult) => {
    const placeId = place.id; // Use Google place_id
    const isSaved = savedPlaceIds.has(placeId);

    if (isSaved) {
      // Already saved, do nothing or show message
      return;
    }

    setSavingPlaceId(placeId);

    try {
      const { error } = await savePlaceForTrip({
        tripId,
        place: {
          id: place.id,
          name: place.name,
          address: place.address,
          lat: place.lat,
          lng: place.lng,
          photoUrl: place.photoUrl,
          types: place.types,
        },
      });

      if (error) {
        console.error("Error saving place:", error);
        const errorMessage = error.message || "Failed to save place. Please try again.";
        addToast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setSavedPlaceIds((prev) => new Set(prev).add(placeId));

      // Reload saved places to get the full record
      await loadSavedPlaces();

      addToast({
        title: "Saved to your plan",
        description: "We'll use this when building your Smart itinerary.",
        variant: "success",
      });
    } catch (err) {
      console.error("Error saving place:", err);
      addToast({
        title: "Error",
        description: "Failed to save place. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingPlaceId(null);
    }
  };

  const isPlaceSaved = (placeId: string | undefined): boolean => {
    if (!placeId) return false;
    // Check by Google place_id (id field) for PlaceResult, or by place_id for SavedPlace
    return savedPlaceIds.has(placeId);
  };

  // Type guard to check if a place is a PlaceResult (not a SavedPlace)
  const isPlaceResult = (place: PlaceResult | SavedPlace): place is PlaceResult => {
    return !("trip_id" in place);
  };

  // Convert PlaceResult | SavedPlace to the format expected by PlaceDetailsPanel
  // This normalizes the types to match PlaceDetailsPanel's expected interface
  const normalizePlaceForDetailsPanel = (
    place: PlaceResult | SavedPlace
  ): {
    id: string;
    place_id?: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    category?: string;
    photoUrl?: string | null;
    types?: string[];
  } => {
    if (isPlaceResult(place)) {
      return {
        id: place.id,
        place_id: place.place_id,
        name: place.name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        category: place.category,
        photoUrl: place.photoUrl,
        types: place.types,
      };
    } else {
      // It's a SavedPlace - convert to PlaceResult format
      const savedPlace = place as SavedPlace;
      return {
        id: savedPlace.place_id,
        place_id: savedPlace.place_id,
        name: savedPlace.name,
        address: savedPlace.address || "",
        lat: savedPlace.lat || 0,
        lng: savedPlace.lng || 0,
        category: undefined,
        photoUrl: savedPlace.photo_url,
        types: savedPlace.types || undefined,
      };
    }
  };

  // Expose marker click handler via ref
  useEffect(() => {
    if (onMarkerClickRef) {
      onMarkerClickRef.current = (id: string) => {
        const place =
          results.find((p) => (p.place_id || p.id) === id) ||
          savedPlaces.find((p) => p.place_id === id);
        if (place) {
          if ("trip_id" in place) {
            const placeResult: PlaceResult = {
              id: place.place_id,
              name: place.name,
              address: place.address || "",
              lat: place.lat || 0,
              lng: place.lng || 0,
              photoUrl: place.photo_url,
              types: place.types || undefined,
              googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
            };
            handlePlaceSelect(placeResult);
          } else {
            handlePlaceSelect(place);
          }
        }
      };
    }
    return () => {
      if (onMarkerClickRef) {
        onMarkerClickRef.current = null;
      }
    };
  }, [results, savedPlaces, onMarkerClickRef, handlePlaceSelect]);

  if (!trip) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Loading trip...</div>
      </div>
    );
  }

  // Place card component (reusable)
  const PlaceCard = ({
    place,
    isFromSaved = false,
  }: {
    place: PlaceResult | SavedPlace;
    isFromSaved?: boolean;
  }) => {
    // For PlaceResult, use id (Google place_id); for SavedPlace, use place_id
    const googlePlaceId = "googleMapsUrl" in place ? place.id : place.place_id;
    const saved = googlePlaceId ? isPlaceSaved(googlePlaceId) : false;
    const isSaving = googlePlaceId === savingPlaceId;
    
    // Get Google Maps URL
    let googleMapsUrl: string | undefined;
    if ("googleMapsUrl" in place && place.googleMapsUrl) {
      googleMapsUrl = place.googleMapsUrl;
    } else if (googlePlaceId) {
      googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${googlePlaceId}`;
    }
    
    // Check if this place is selected
    let isSelected = false;
    if (selectedPlace) {
      if (googlePlaceId && "id" in selectedPlace && selectedPlace.id === googlePlaceId) {
        isSelected = true;
      } else if (googlePlaceId && "place_id" in selectedPlace && selectedPlace.place_id === googlePlaceId) {
        isSelected = true;
      } else if ("place_id" in place && selectedPlace && "place_id" in selectedPlace && place.place_id === selectedPlace.place_id) {
        isSelected = true;
      }
    }

    // Get photo URL and types
    const photoUrl = "photoUrl" in place ? place.photoUrl : "photo_url" in place ? place.photo_url : null;
    const types = "types" in place ? (place.types ?? undefined) : undefined;
    const goodFor = getGoodForLabel(types);

    return (
      <Card
        className={`transition-all ${
          isSelected ? "ring-2 ring-primary" : "hover:shadow-md"
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            {/* Thumbnail - clickable to open drawer */}
            <div
              className="flex-shrink-0 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handlePlaceSelect(place);
              }}
            >
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={place.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    unoptimized
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 hover:opacity-90 transition-opacity">
                    No image
                  </div>
                )}
            </div>

            {/* Content - clickable to open drawer */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handlePlaceSelect(place);
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg hover:text-primary transition-colors">
                      {place.name}
                    </CardTitle>
                    {saved && (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                    )}
                  </div>
                  {saved && (
                    <span className="text-xs text-muted-foreground mt-0.5 inline-block">
                      In your plan
                    </span>
                  )}
                </div>
              </div>
              {place.address && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{place.address}</span>
                </div>
              )}
              {goodFor && (
                <div className="text-xs text-muted-foreground mt-1.5">
                  {goodFor}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            {("category" in place && place.category) && (
              <span className="text-xs px-2 py-1 bg-muted rounded-md">
                {place.category}
              </span>
            )}
            {!isFromSaved && "id" in place && isPlaceResult(place) && (
              <Button
                size="sm"
                variant={saved ? "outline" : "default"}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveToPlan(place);
                }}
                disabled={isSaving || saved}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
                    In your plan
                  </>
                ) : (
                  "Add to plan"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Convert SavedPlace to PlaceResult for dialog if needed
  const getPlaceForDialog = (
    place: PlaceResult | SavedPlace
  ): PlaceResult => {
    // If it has an external_id (starts with "poi."), it's already a PlaceResult
    if ("id" in place && place.id && place.id.startsWith("poi.")) {
      return place as PlaceResult;
    }
    // Otherwise, it's a SavedPlace - convert it to PlaceResult format
    const savedPlace = place as SavedPlace;
    return {
      id: savedPlace.place_id, // Use place_id as id for dialog purposes
      place_id: savedPlace.place_id,
      name: savedPlace.name,
      address: savedPlace.address || "",
      lat: savedPlace.lat || 0,
      lng: savedPlace.lng || 0,
      category: undefined, // SavedPlace doesn't have category
    };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Side Panel */}
      <aside className="w-full flex flex-col h-full">
        {/* Hotel Card */}
        {trip.start_date && trip.end_date && (
          <div className="p-4 border-b">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Hotel className="h-5 w-5" />
                  Need a place to stay?
                </CardTitle>
                <CardDescription>
                  Search hotels for your trip dates and destination.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => {
                    const city = trip.destination_name || trip.title;
                    const startDate = new Date(trip.start_date);
                    const endDate = new Date(trip.end_date);
                    const checkin = format(startDate, "yyyy-MM-dd");
                    const checkout = format(endDate, "yyyy-MM-dd");
                    const url = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}&checkin=${checkin}&checkout=${checkout}`;
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                  className="w-full"
                >
                  Search hotels
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search Input + Filter Chips */}
        <div className="p-4 border-b space-y-3">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder='Search for a place or type "museum"...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim().length >= 2) {
                    handleSearchSubmit(e as any);
                  }
                }}
              />
            </div>
          </form>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {FILTER_ORDER.map((filterKey) => {
              const filter = FILTER_PRESETS[filterKey];
              const isSelected = selectedFilter === filterKey;
              
              return (
                <Button
                  key={filterKey}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterClick(filterKey)}
                  disabled={loading}
                >
                  {loading && isSelected ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    filter.label
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Saved Places + Results - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Saved Places Section */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Saved places</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Save places you like. We&apos;ll use them to build your Smart itinerary later.
            </p>
            {loadingSaved ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : savedPlaces.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You haven&apos;t saved any places yet.
              </p>
            ) : (
              <div className="space-y-3 mb-4">
                {savedPlaces.map((place) => {
                  // Convert SavedPlace to PlaceResult for display
                  const placeResult: PlaceResult = {
                    id: place.place_id,
                    name: place.name,
                    address: place.address || "",
                    lat: place.lat || 0,
                    lng: place.lng || 0,
                    photoUrl: place.photo_url,
                    types: place.types || undefined,
                    googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
                  };
                  return <PlaceCard key={place.id} place={placeResult} isFromSaved />;
                })}
              </div>
            )}
          </div>

          {/* Results */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive py-4">{error}</div>
          )}

          {!loading &&
            !error &&
            results.length === 0 &&
            !queryWasTried && (
              <div className="text-sm text-muted-foreground py-8 text-center">
                Search for a place or click a filter to discover places
              </div>
            )}

          {!loading &&
            !error &&
            results.length === 0 &&
            queryWasTried && (
              <div className="text-sm text-muted-foreground py-8 text-center">
                No results found. Try a different search.
              </div>
            )}

          {!loading && results.length > 0 && (
            <div className="space-y-3">
              {results.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}

          {/* Place Details Panel - Mobile (below list) */}
          {selectedPlace && (
            <div ref={detailsPanelRef} className="md:hidden mt-4">
              {("id" in selectedPlace || "place_id" in selectedPlace) && (() => {
                const normalizedPlace = normalizePlaceForDetailsPanel(selectedPlace);
                return (
                  <PlaceDetailsPanel
                    place={normalizedPlace as any}
                    isSaved={
                      !!(
                        ("id" in selectedPlace && isPlaceSaved(selectedPlace.id)) ||
                        ("place_id" in selectedPlace && selectedPlace.place_id && isPlaceSaved(selectedPlace.place_id))
                      )
                    }
                    isToggling={
                      !!(
                        ("id" in selectedPlace && selectedPlace.id === savingPlaceId) ||
                        ("place_id" in selectedPlace && selectedPlace.place_id === savingPlaceId)
                      )
                    }
                    onToggleSave={() => {
                      if ("id" in selectedPlace && isPlaceResult(selectedPlace)) {
                        handleSaveToPlan(selectedPlace);
                      }
                    }}
                    onAddToItinerary={() => handleAddToItinerary(selectedPlace)}
                  />
                );
              })()}
            </div>
          )}
        </div>
      </aside>

      {/* Add to Itinerary Dialog */}
      {selectedPlace && (
        <AddToItineraryDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          place={getPlaceForDialog(selectedPlace)}
          tripId={tripId}
          days={days || []}
        />
      )}

      {/* Place Details Drawer */}
      <PlaceDetailsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        placeId={selectedPlaceId}
        placeName={selectedPlace?.name}
        activeFilter={selectedFilter}
        onAddToPlan={() => {
          if (selectedPlace && isPlaceResult(selectedPlace)) {
            handleSaveToPlan(selectedPlace);
          }
        }}
        onAddToItinerary={() => {
          if (selectedPlace) {
            handleAddToItinerary(selectedPlace);
          }
        }}
      />
    </div>
  );
}
