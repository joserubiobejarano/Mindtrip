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

const MAPBOX_BASE = "https://api.mapbox.com/geocoding/v5/mapbox.places";

const FILTER_PRESETS: Record<string, { label: string; query?: string; categories?: string }> = {
  museums: { label: "Museums", query: "museum", categories: "museum" },
  parks: { label: "Parks & Nature", query: "park", categories: "park,garden" },
  food: { label: "Food", query: "restaurant", categories: "restaurant,food" },
  nightlife: { label: "Nightlife", query: "bar", categories: "bar,nightclub" },
  shopping: { label: "Shopping", query: "shop", categories: "shop,mall" },
  neighborhoods: { label: "Neighborhoods", query: "", categories: "" },
} as const;

const FILTER_OPTIONS = Object.values(FILTER_PRESETS);

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

  const searchPlaces = async (userQuery: string, filterOverride?: ExploreFilter) => {
    if (!trip) return;

    if (!mapboxToken) {
      console.error("Missing NEXT_PUBLIC_MAPBOX_TOKEN");
      setError("Map data is temporarily unavailable. Please check the Mapbox API key.");
      setQueryWasTried(true);
      setResults([]);
      return;
    }

    // Determine active filter: use override, then selectedFilter
    const activeFilter: ExploreFilter | null = filterOverride || selectedFilter;

    // Validate trip coordinates
    const hasCoordinates = trip.center_lat != null && trip.center_lng != null && 
                          !isNaN(trip.center_lat) && !isNaN(trip.center_lng);
    
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
      let url: URL;

      if (activeFilter === "neighborhoods") {
        // Special case for neighborhoods
        const cityQuery = trip.destination_name || "city";
        url = new URL(
          `${MAPBOX_BASE}/${encodeURIComponent(cityQuery)}.json`
        );
        url.searchParams.set("access_token", mapboxToken);
        url.searchParams.set("limit", "10");
        url.searchParams.set("types", "neighborhood");
        url.searchParams.set("proximity", `${trip.center_lng},${trip.center_lat}`);
      } else {
        // For POI-based filters (Museums, Parks, Food, Nightlife, Shopping)
        const baseQuery =
          userQuery?.trim() ||
          FILTER_PRESETS[activeFilter || ""]?.query ||
          "point of interest";
        
        url = new URL(
          `${MAPBOX_BASE}/${encodeURIComponent(baseQuery)}.json`
        );
        url.searchParams.set("access_token", mapboxToken);
        url.searchParams.set("limit", "20");
        url.searchParams.set("types", "poi");
        url.searchParams.set("proximity", `${trip.center_lng},${trip.center_lat}`);
      }

      console.log("Mapbox URL", url.toString().replace(mapboxToken, "TOKEN_HIDDEN"));

      const res = await fetch(url.toString());
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Mapbox error", res.status, errorText);
        setError("We could not load places. Try again in a moment.");
        setResults([]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const features = data.features ?? [];
      
      console.log("Mapbox features length", features.length, features);

      // Filter features by place_type
      const filtered =
        activeFilter === "neighborhoods"
          ? features.filter((f: any) => f.place_type?.includes("neighborhood"))
          : features.filter((f: any) => f.place_type?.includes("poi"));

      const places: PlaceResult[] = filtered
        .filter((f: any) => Array.isArray(f.center) && f.center.length === 2)
        .map((feature: any) => ({
          id: feature.id,
          name: feature.text || feature.place_name || "Unknown place",
          address: feature.place_name || "",
          lat: feature.center[1],
          lng: feature.center[0],
        }));

      // Upsert all places to database and attach place_id
      const resultsWithPlaceIds = await Promise.all(
        places.map(async (place) => {
          const place_id = await upsertPlace(place);
          return { ...place, place_id: place_id || undefined };
        })
      );

      setResults(resultsWithPlaceIds);
      setError(resultsWithPlaceIds.length === 0 ? "No results found. Try a different search." : null);
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
      // Pass the user query - searchPlaces will handle the searchText construction
      searchPlaces(searchQuery.trim());
    }
  };

  const handleFilterClick = (filterQuery: string) => {
    // Find the filter key from the query
    const filterKey = Object.keys(FILTER_PRESETS).find(
      (key) => FILTER_PRESETS[key as keyof typeof FILTER_PRESETS].query === filterQuery
    ) as ExploreFilter | undefined;
    
    if (filterKey) {
      setSelectedFilter(filterKey);
      setSearchQuery("");
      // Pass empty query and the filter - searchPlaces will construct searchText from filter
      searchPlaces("", filterKey);
    }
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

      {/* Main Content - 2 column grid on desktop, stacked on mobile */}
      <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
        <div className="flex-1 grid md:grid-cols-[2fr_1fr] gap-4 min-h-0">
          {/* Left: Map */}
          <div className="rounded-lg border overflow-hidden flex-1 min-h-0">
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

          {/* Right: Side Panel */}
          <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
            {/* Hotel Card */}
            {trip.start_date && trip.end_date && (
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
            )}

            {/* Search Input */}
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
              {FILTER_OPTIONS.map((filter) => {
                // Find the filter key for this filter
                const filterKey = Object.keys(FILTER_PRESETS).find(
                  (key) => FILTER_PRESETS[key as keyof typeof FILTER_PRESETS].query === filter.query
                ) as ExploreFilter | undefined;
                const isSelected = filterKey && selectedFilter === filterKey;
                
                return (
                  <Button
                    key={filter.query}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterClick(filter.query)}
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

            {/* Saved Places + Results */}
            <div className="flex-1 overflow-y-auto">
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
        </div>
      </div>

      {/* Place Details Panel - Desktop (below grid) */}
      {selectedPlace && (
        <div ref={detailsPanelRef} className="hidden md:block">
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
