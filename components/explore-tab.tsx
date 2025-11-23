"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrip } from "@/hooks/use-trip";
import { useDays } from "@/hooks/use-days";
import { AddToItineraryDialog } from "@/components/add-to-itinerary-dialog";
import { ExploreMap } from "@/components/explore-map";
import { PlaceDetailsPanel } from "@/components/place-details-panel";
import { Loader2, Search, MapPin, Star } from "lucide-react";
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
  { label: "Shopping", query: "shopping" },
  { label: "Neighborhoods", query: "neighborhood" },
];

export function ExploreTab({ tripId }: ExploreTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.error("Missing NEXT_PUBLIC_MAPBOX_TOKEN");
      setError("Map search is not configured. Please contact support.");
      return;
    }

    if (!trip) {
      setError("Trip information is not available. Please try again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build URL with proximity based on trip center coordinates
      const hasProximity = trip.center_lat && trip.center_lng;
      const proximityParam = hasProximity
        ? `&proximity=${trip.center_lng},${trip.center_lat}`
        : "";

      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?types=poi&limit=10${proximityParam}&access_token=${mapboxToken}`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error searching places", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        setError("We couldn't load places for this filter, please try again.");
        setResults([]);
        return;
      }

      const data = await response.json();
      
      if (!data || !Array.isArray(data.features)) {
        console.error("Error searching places: Invalid response format", data);
        setError("We couldn't load places for this filter, please try again.");
        setResults([]);
        return;
      }

      const mappedResults: PlaceResult[] = (data.features || []).map(
        (feature: any) => {
          const [lng, lat] = feature.center || [];

          // Extract place name (feature.text is the primary name for POIs)
          const name =
            feature.text ||
            feature.properties?.name ||
            feature.place_name?.split(",")[0] ||
            "Unknown";

          // Extract address (context provides location details)
          const address =
            feature.properties?.address ||
            (feature.context
              ?.filter(
                (ctx: any) =>
                  ctx.id?.startsWith("place") ||
                  ctx.id?.startsWith("postcode") ||
                  ctx.id?.startsWith("district")
              )
              .map((ctx: any) => ctx.text)
              .join(", ")) ||
            feature.place_name ||
            "";

          // Extract category from properties or place_type
          const category =
            feature.properties?.category ||
            feature.properties?.poi_category ||
            feature.place_type?.[0] ||
            undefined;

          return {
            id: feature.id,
            name: name,
            address: address || name, // Fallback to name if no address
            lat: lat || 0,
            lng: lng || 0,
            category: category,
          };
        }
      );

      // Upsert all places to database and attach place_id
      const resultsWithPlaceIds = await Promise.all(
        mappedResults.map(async (place) => {
          const place_id = await upsertPlace(place);
          return { ...place, place_id: place_id || undefined };
        })
      );

      setResults(resultsWithPlaceIds);
    } catch (err) {
      console.error("Error searching places", err);
      setError("We couldn't load places for this filter, please try again.");
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
      </div>

      {/* Main Content - 2 column grid on desktop, stacked on mobile */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        {/* Left Column - Search, Filters, Results */}
        <div className="flex flex-col overflow-hidden">
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
                {filter.label}
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
              !selectedFilter && (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  Search for a place or click a filter to discover places
                </div>
              )}

            {!loading &&
              !error &&
              results.length === 0 &&
              selectedFilter && (
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
            <div ref={detailsPanelRef} className="lg:hidden mt-4">
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

        {/* Right Column - Map (desktop) */}
        <div className="hidden lg:flex flex-col overflow-hidden">
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
            <div ref={detailsPanelRef} className="mt-4">
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
