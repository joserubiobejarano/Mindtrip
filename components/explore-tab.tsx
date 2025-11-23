"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTrip } from "@/hooks/use-trip";
import { useDays } from "@/hooks/use-days";
import { AddToItineraryDialog } from "@/components/add-to-itinerary-dialog";
import { ExploreMap } from "@/components/explore-map";
import { PlaceDetailsPanel } from "@/components/place-details-panel";
import { Loader2, Search, MapPin, Star, Hotel } from "lucide-react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import {
  savePlace,
  unsavePlace,
  getSavedPlaces,
  getSavedPlaceIds,
} from "@/lib/supabase/saved-places";

interface PlaceResult {
  id: string; // Mapbox external_id
  place_id?: string; // Database place ID (after upsert)
  name: string;
  address: string;
  lat: number;
  lng: number;
  category?: string;
}

interface SavedPlace {
  place_id: string;
  id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  category: string | null;
}

interface ExploreTabProps {
  tripId: string;
}

const FILTER_OPTIONS = [
  { label: "Museums", query: "museum" },
  { label: "Parks & Nature", query: "park" },
  { label: "Food", query: "restaurant" },
  { label: "Nightlife", query: "bar" },
  { label: "Shopping", query: "shopping mall" },
  { label: "Neighborhoods", query: "neighborhood" },
];

export function ExploreTab({ tripId }: ExploreTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryWasTried, setQueryWasTried] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | SavedPlace | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [savedPlaceIds, setSavedPlaceIds] = useState<Set<string>>(new Set());
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [togglingPlaceId, setTogglingPlaceId] = useState<string | null>(null);
  const detailsPanelRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();
  const { data: trip } = useTrip(tripId);
  const { data: days } = useDays(tripId);
  const supabase = createClient();

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Load saved places on mount
  useEffect(() => {
    if (tripId && user?.id) {
      loadSavedPlaces();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, user?.id]);

  const loadSavedPlaces = async () => {
    if (!user?.id) return;

    setLoadingSaved(true);
    try {
      const { data: savedIds, error: idsError } = await getSavedPlaceIds(
        tripId,
        user.id
      );
      if (idsError) {
        console.error("Error loading saved place IDs:", idsError);
      } else if (savedIds) {
        setSavedPlaceIds(savedIds);
      }

      const { data: saved, error: savedError } = await getSavedPlaces(
        tripId,
        user.id
      );
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
      // Check if place with this external_id already exists for this trip
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

  const searchPlaces = async (query: string) => {
    if (!trip) return;
    if (!query.trim()) return;

    if (!mapboxToken) {
      console.error("Missing NEXT_PUBLIC_MAPBOX_TOKEN");
      setError("Map data is temporarily unavailable. Please check the Mapbox API key.");
      setQueryWasTried(true);
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    setQueryWasTried(true);

    try {
      // Build query - for category searches, combine with city name for better results
      const cityName = trip.destination_name || trip.title || "";
      let searchQuery = query.trim();
      
      // If it's a generic category term and we have a city, search in that city
      const isCategorySearch = ["museum", "park", "restaurant", "bar", "shopping mall", "neighborhood"].includes(
        query.trim().toLowerCase()
      );
      
      if (isCategorySearch && cityName) {
        searchQuery = `${query.trim()} in ${cityName}`;
      }

      // Build proximity parameter if we have coordinates
      const hasProximity = trip.center_lat && trip.center_lng && 
                          !isNaN(trip.center_lat) && !isNaN(trip.center_lng);
      const proximityParam = hasProximity 
        ? `&proximity=${trip.center_lng},${trip.center_lat}`
        : "";

      // Try with types=poi first, but if that fails, try without type restriction
      let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        searchQuery
      )}.json?types=poi&limit=20${proximityParam}&access_token=${mapboxToken}`;

      console.log("Mapbox search URL:", url.replace(mapboxToken, "TOKEN_HIDDEN"));
      console.log("Search query:", searchQuery);
      console.log("Has proximity:", hasProximity, hasProximity ? `${trip.center_lng},${trip.center_lat}` : "none");

      let res = await fetch(url);
      let data = await res.json();

      // If no results with types=poi, try without type restriction
      if (!res.ok || !data.features || data.features.length === 0) {
        console.log("No results with types=poi, trying without type restriction");
        url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?limit=20${proximityParam}&access_token=${mapboxToken}`;
        
        res = await fetch(url);
        data = await res.json();
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Mapbox geocoding error", res.status, errorText);
        setError(`Failed to search places. Please try again.`);
        setResults([]);
        return;
      }

      console.log("raw mapbox features", data.features);
      console.log("total features:", data.features?.length || 0);

      // Filter to only POIs and places (not addresses, neighborhoods, etc.)
      let poiFeatures = (data.features ?? []).filter((feature: any) => {
        // Include POIs, landmarks, and places
        const types = feature.place_type || [];
        return (
          types.includes("poi") ||
          types.includes("landmark") ||
          (types.includes("place") && feature.properties?.category)
        );
      });

      console.log("filtered POI features:", poiFeatures.length);

      // If filtering removed all results, use all features but prioritize POIs
      if (poiFeatures.length === 0 && data.features && data.features.length > 0) {
        console.log("No POIs found, using all features");
        poiFeatures = data.features;
      }

      const nextPlaces: PlaceResult[] = poiFeatures.map((feature: any) => ({
        id: feature.id,
        name: feature.text || feature.place_name || "Unknown place",
        address: feature.place_name ?? "",
        lat: feature.center?.[1] ?? 0,
        lng: feature.center?.[0] ?? 0,
        category: feature.properties?.category || undefined,
      }));

      // Upsert all places to database and attach place_id
      const resultsWithPlaceIds = await Promise.all(
        nextPlaces.map(async (place) => {
          const place_id = await upsertPlace(place);
          return { ...place, place_id: place_id || undefined };
        })
      );

      console.log("final results count:", resultsWithPlaceIds.length);
      setResults(resultsWithPlaceIds);
    } catch (err) {
      console.error("searchPlaces failed", err);
      setError("Something went wrong loading places. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      searchPlaces(searchQuery.trim());
    }
  };

  const handleFilterClick = (filterQuery: string) => {
    setSelectedFilter(filterQuery);
    setSearchQuery("");
    searchPlaces(filterQuery);
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

  const handleToggleSave = async (place: PlaceResult | SavedPlace) => {
    if (!user?.id || !place.place_id) return;

    const placeId = place.place_id;
    const isSaved = savedPlaceIds.has(placeId);

    setTogglingPlaceId(placeId);

    try {
      if (isSaved) {
        // Unsave
        const { error } = await unsavePlace(tripId, user.id, placeId);
        if (error) {
          console.error("Error unsaving place:", error);
          return;
        }

        // Update local state
        setSavedPlaceIds((prev) => {
          const next = new Set(prev);
          next.delete(placeId);
          return next;
        });

        // Remove from saved places list
        setSavedPlaces((prev) => prev.filter((p) => p.place_id !== placeId));
      } else {
        // Save
        const { error } = await savePlace(tripId, user.id, placeId);
        if (error) {
          console.error("Error saving place:", error);
          return;
        }

        // Update local state
        setSavedPlaceIds((prev) => new Set(prev).add(placeId));

        // Add to saved places list if it's a PlaceResult
        if ("id" in place) {
          const savedPlace: SavedPlace = {
            place_id: placeId,
            id: placeId,
            name: place.name,
            address: place.address || null,
            lat: place.lat || null,
            lng: place.lng || null,
            category: place.category || null,
          };
          setSavedPlaces((prev) => [savedPlace, ...prev]);
        }
      }
    } catch (err) {
      console.error("Error toggling save:", err);
    } finally {
      setTogglingPlaceId(null);
    }
  };

  const isPlaceSaved = (placeId: string | undefined): boolean => {
    return placeId ? savedPlaceIds.has(placeId) : false;
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
    const placeId = place.place_id;
    const saved = placeId ? isPlaceSaved(placeId) : false;
    const isToggling = placeId === togglingPlaceId;
    
    // Check if this place is selected
    // Compare by place_id first (most reliable), then by external id
    let isSelected = false;
    if (selectedPlace) {
      // First try to match by place_id (database ID) - most reliable
      if (place.place_id && selectedPlace.place_id) {
        isSelected = place.place_id === selectedPlace.place_id;
      }
      // If not matched and both have external_id (id starts with "poi."), match by external_id
      else if (
        place.id &&
        selectedPlace.id &&
        place.id.startsWith("poi.") &&
        selectedPlace.id.startsWith("poi.")
      ) {
        isSelected = place.id === selectedPlace.id;
      }
    }

    return (
      <Card
        className={`cursor-pointer transition-all ${
          isSelected ? "ring-2 ring-primary" : "hover:shadow-md"
        }`}
        onClick={(e) => {
          // Prevent selection when clicking buttons
          if (
            (e.target as HTMLElement).closest("button") ||
            (e.target as HTMLElement).closest("a")
          ) {
            return;
          }
          handlePlaceSelect(place);
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg flex-1">{place.name}</CardTitle>
            {user?.id && placeId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSave(place);
                }}
                disabled={isToggling}
                className="flex items-center gap-1 h-auto p-1"
                title={saved ? "Saved" : "Save"}
              >
                {isToggling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                ) : (
                  <Star className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          {place.address && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{place.address}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            {place.category && (
              <span className="text-xs px-2 py-1 bg-muted rounded-md">
                {place.category}
              </span>
            )}
            {!isFromSaved && "id" in place && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToItinerary(place);
                }}
              >
                Add to itinerary
              </Button>
            )}
            {isFromSaved && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  const savedPlace = place as SavedPlace;
                  const placeResult: PlaceResult = {
                    id: savedPlace.place_id || savedPlace.id,
                    place_id: savedPlace.place_id,
                    name: savedPlace.name,
                    address: savedPlace.address || "",
                    lat: savedPlace.lat || 0,
                    lng: savedPlace.lng || 0,
                    category: savedPlace.category || undefined,
                  };
                  handleAddToItinerary(placeResult);
                }}
              >
                Add to itinerary
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
    <div className="p-6 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {trip.destination_name || trip.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discover places in {trip.destination_name || "your destination"}
        </p>
        {!mapboxToken && (
          <div className="mt-2 text-sm text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/20">
            Map data is temporarily unavailable. Please check the Mapbox API key.
          </div>
        )}
      </div>

      {/* Book Hotels Card */}
      {trip.start_date && trip.end_date && (
        <div className="mb-4">
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
                className="w-full sm:w-auto"
              >
                Search hotels
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content - 2 column grid on desktop, stacked on mobile */}
      <div className="flex-1 flex flex-col-reverse md:grid md:grid-cols-[40%_60%] gap-6 overflow-hidden min-h-0">
        {/* Left Column - Search, Filters, Results */}
        <div className="flex flex-col overflow-hidden order-2 md:order-none">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="mb-4">
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
          <div className="flex flex-wrap gap-2 mb-4">
            {FILTER_OPTIONS.map((filter) => (
              <Button
                key={filter.query}
                variant={selectedFilter === filter.query ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterClick(filter.query)}
                disabled={loading}
              >
                {loading && selectedFilter === filter.query ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  filter.label
                )}
              </Button>
            ))}
          </div>

          {/* Saved Places Section */}
          {user?.id && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-3">Saved places</h2>
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
                  {savedPlaces.map((place) => (
                    <PlaceCard key={place.place_id} place={place} isFromSaved />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
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
          </div>

          {/* Place Details Panel - Mobile (below list) */}
          {selectedPlace && (
            <div ref={detailsPanelRef} className="md:hidden mt-4">
              <PlaceDetailsPanel
                place={selectedPlace}
                isSaved={
                  selectedPlace.place_id
                    ? isPlaceSaved(selectedPlace.place_id)
                    : false
                }
                isToggling={
                  selectedPlace.place_id === togglingPlaceId ? true : false
                }
                onToggleSave={() => handleToggleSave(selectedPlace)}
                onAddToItinerary={() => handleAddToItinerary(selectedPlace)}
              />
            </div>
          )}
        </div>

        {/* Right Column - Map */}
        <div className="flex flex-col overflow-hidden order-1 md:order-none h-[50vh] md:h-auto">
          <div className="flex-1 min-h-0">
            <ExploreMap
              tripId={tripId}
              centerLat={trip.center_lat}
              centerLng={trip.center_lng}
              searchResults={results}
              savedPlaces={savedPlaces}
              selectedPlace={selectedPlace}
              onPlaceSelect={handlePlaceSelect}
              height="100%"
            />
          </div>

          {/* Place Details Panel - Desktop (below map) */}
          {selectedPlace && (
            <div ref={detailsPanelRef} className="hidden md:block mt-4">
              <PlaceDetailsPanel
                place={selectedPlace}
                isSaved={
                  selectedPlace.place_id
                    ? isPlaceSaved(selectedPlace.place_id)
                    : false
                }
                isToggling={
                  selectedPlace.place_id === togglingPlaceId ? true : false
                }
                onToggleSave={() => handleToggleSave(selectedPlace)}
                onAddToItinerary={() => handleAddToItinerary(selectedPlace)}
              />
            </div>
          )}
        </div>
      </div>


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
