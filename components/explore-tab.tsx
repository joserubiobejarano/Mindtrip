"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTrip } from "@/hooks/use-trip";
import { useDays } from "@/hooks/use-days";
import { AddToItineraryDialog } from "@/components/add-to-itinerary-dialog";
import { GoogleMapBase, BaseMarker } from "@/components/google-map-base";
import { PlaceDetailsPanel } from "@/components/place-details-panel";
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
}

type ExploreFilter =
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
  museums: { label: "Museums", query: "museum" },
  parks: { label: "Parks & Nature", query: "park" },
  food: { label: "Food", query: "restaurant" },
  nightlife: { label: "Nightlife", query: "bar" },
  shopping: { label: "Shopping", query: "shop" },
  neighborhoods: { label: "Neighborhoods", query: "" },
} as const;

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

export function ExploreTab({ tripId }: ExploreTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<ExploreFilter | null>(null);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryWasTried, setQueryWasTried] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | SavedPlace | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  // Load saved places on mount
  useEffect(() => {
    if (tripId && user?.id) {
      loadSavedPlaces();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, user?.id]);

  // Initial load: search for museums when trip and places service are available
  useEffect(() => {
    if (
      trip &&
      placesService &&
      trip.center_lat != null &&
      trip.center_lng != null
    ) {
      searchPlaces({ filterKey: "museums" });
      setSelectedFilter("museums");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip?.id, placesService]);

  // Center map on selected place
  useEffect(() => {
    if (!mapInstance || !selectedPlace) return;

    const lat = selectedPlace.lat;
    const lng = selectedPlace.lng;

    if (!lat || !lng || lat === 0 || lng === 0) return;

    mapInstance.panTo({ lat, lng });
    mapInstance.setZoom(14);
  }, [selectedPlace, mapInstance]);

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
    if (!trip || !placesService) return;

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

      if (textQuery && textQuery.trim().length > 0) {
        // Text search: "<user text> in <city>"
        const query = cityName ? `${textQuery.trim()} in ${cityName}` : textQuery.trim();
        googlePlaces = await searchPlacesByText(placesService, query, location, 15000);
      } else if (filterKey === "neighborhoods") {
        // For neighborhoods, use text search with city name
        const query = cityName || trip.title;
        googlePlaces = await searchPlacesByText(placesService, query, location, 15000);
      } else if (filterKey) {
        // Filter-based search using nearbySearch
        const placeType = getPlaceTypeForFilter(filterKey);
        googlePlaces = await searchNearbyPlaces(placesService, location, placeType, 10000);
      } else {
        // Fallback: search for restaurants
        googlePlaces = await searchNearbyPlaces(placesService, location, "restaurant", 10000);
      }

      // Map Google Places results to our PlaceResult format
      const mapped: PlaceResult[] = googlePlaces.map((place) => {
        const result = mapGooglePlaceToPlaceResult(place);
        // Add Google Maps URL
        const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${result.id}`;
        return { ...result, googleMapsUrl };
      });

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
    searchPlaces({ filterKey });
  };

  const handlePlaceSelect = (place: PlaceResult | SavedPlace) => {
    setSelectedPlace(place);
    // Scroll to details panel if it exists
    setTimeout(() => {
      detailsPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 100);
  };

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
        addToast({
          title: "Error",
          description: "Failed to save place. Please try again.",
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
        description: "This place will be included in your Smart itinerary.",
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
            {/* Thumbnail - clickable to open Google Maps */}
            {googleMapsUrl ? (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
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
                  <div className="h-16 w-16 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 cursor-pointer hover:opacity-90 transition-opacity">
                    No image
                  </div>
                )}
              </a>
            ) : (
              <>
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={place.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                    unoptimized
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 flex-shrink-0">
                    No image
                  </div>
                )}
              </>
            )}

            {/* Content - clickable to open Google Maps */}
            <div className="flex-1 min-w-0">
              {googleMapsUrl ? (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg flex-1 cursor-pointer hover:text-primary transition-colors">
                      {place.name}
                    </CardTitle>
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
                </a>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg flex-1">{place.name}</CardTitle>
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
                </>
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
                  "Saved to plan"
                ) : (
                  "Save to plan"
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
      category: savedPlace.category || undefined,
    };
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Map */}
      <div className="flex-1 min-w-0">
        <div className="h-full w-full">
          {trip.center_lat != null && trip.center_lng != null ? (
            <GoogleMapBase
              center={{ lat: trip.center_lat, lng: trip.center_lng }}
              zoom={12}
              markers={[
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
              ]}
              onMarkerClick={(id) => {
                // Find the place by id
                const place =
                  results.find((p) => (p.place_id || p.id) === id) ||
                  savedPlaces.find((p) => p.place_id === id);
                if (place) {
                  // Convert SavedPlace to PlaceResult if needed
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
              }}
              onMapLoad={(map) => {
                setMapInstance(map);
                // Create PlacesService from the map
                const service = new google.maps.places.PlacesService(map);
                setPlacesService(service);
              }}
              className="h-full w-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <p className="text-sm text-muted-foreground">
                Trip location is required to display the map.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Side Panel */}
      <aside className="w-full max-w-md border-l bg-white flex flex-col">
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
            {(Object.keys(FILTER_PRESETS) as ExploreFilter[]).map((filterKey) => {
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
              Save places you like. We will use them to build your Smart itinerary later.
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
              {("id" in selectedPlace || "place_id" in selectedPlace) && (
                <PlaceDetailsPanel
                  place={selectedPlace}
                  isSaved={
                    ("id" in selectedPlace && isPlaceSaved(selectedPlace.id)) ||
                    ("place_id" in selectedPlace && selectedPlace.place_id && isPlaceSaved(selectedPlace.place_id))
                  }
                  isToggling={
                    ("id" in selectedPlace && selectedPlace.id === savingPlaceId) ||
                    ("place_id" in selectedPlace && selectedPlace.place_id === savingPlaceId)
                  }
                  onToggleSave={() => {
                    if ("id" in selectedPlace) {
                      handleSaveToPlan(selectedPlace);
                    }
                  }}
                  onAddToItinerary={() => handleAddToItinerary(selectedPlace)}
                />
              )}
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
    </div>
  );
}
