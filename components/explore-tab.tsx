"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTrip } from "@/hooks/use-trip";
import { useDays } from "@/hooks/use-days";
import { AddToItineraryDialog } from "@/components/add-to-itinerary-dialog";
import { ExploreMap } from "@/components/explore-map";
import { PlaceDetailsPanel } from "@/components/place-details-panel";
import { ExploreSearch } from "@/components/explore-search";
import { Loader2, MapPin, Star, Hotel, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { calculateBBox } from "@/lib/map-utils";
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
  id: string; // For compatibility with PlaceResult check
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
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  
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
      setError("Map data is temporarily unavailable.");
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate bbox for hard filtering to the city
      let bboxParam = "";
      if (trip.center_lat && trip.center_lng && !isNaN(trip.center_lat) && !isNaN(trip.center_lng)) {
        const bbox = calculateBBox(trip.center_lat, trip.center_lng);
        bboxParam = `&bbox=${bbox.join(',')}`;
      }

      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?types=poi,landmark&limit=20${bboxParam}&access_token=${mapboxToken}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to search");
      }

      let poiFeatures = data.features || [];
      
      // Map to PlaceResult
      const nextPlaces: PlaceResult[] = poiFeatures.map((feature: any) => ({
        id: feature.id,
        name: feature.text || feature.place_name || "Unknown place",
        address: feature.place_name ?? "",
        lat: feature.center?.[1] ?? 0,
        lng: feature.center?.[0] ?? 0,
        category: feature.properties?.category || undefined,
      }));

      // Upsert all places
      const resultsWithPlaceIds = await Promise.all(
        nextPlaces.map(async (place) => {
          const place_id = await upsertPlace(place);
          return { ...place, place_id: place_id || undefined };
        })
      );

      setResults(resultsWithPlaceIds);
    } catch (err) {
      console.error("searchPlaces failed", err);
      setError("Something went wrong loading places.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAutocompleteSelect = async (mapboxPlace: any) => {
    // Convert to PlaceResult
    const placeResult: PlaceResult = {
      id: mapboxPlace.id,
      name: mapboxPlace.text || mapboxPlace.place_name.split(',')[0],
      address: mapboxPlace.place_name,
      lat: mapboxPlace.center[1],
      lng: mapboxPlace.center[0],
      category: mapboxPlace.properties?.category
    };

    // Add to results if not present
    setResults(prev => {
      if (prev.find(p => p.id === placeResult.id)) return prev;
      return [placeResult, ...prev];
    });

    // Select it immediately
    setSelectedPlace(placeResult);

    // Upsert to get ID
    const placeId = await upsertPlace(placeResult);
    
    // Update selection with ID
    setSelectedPlace({ ...placeResult, place_id: placeId || undefined });
    
    // Also ensure the panel is open
    setIsPanelOpen(true);
  };

  const handleFilterClick = (filterQuery: string) => {
    setSelectedFilter(filterQuery);
    searchPlaces(filterQuery);
    setIsPanelOpen(true);
  };

  const handlePlaceSelect = (place: PlaceResult | SavedPlace) => {
    setSelectedPlace(place);
    setIsPanelOpen(true);
  };

  const handleAddToItinerary = (place: PlaceResult | SavedPlace) => {
    setSelectedPlace(place);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleToggleSave = async (place: PlaceResult | SavedPlace) => {
    if (!user?.id || !place.place_id) return;

    const placeId = place.place_id;
    const isSaved = savedPlaceIds.has(placeId);

    setTogglingPlaceId(placeId);

    try {
      if (isSaved) {
        const { error } = await unsavePlace(tripId, user.id, placeId);
        if (!error) {
          setSavedPlaceIds((prev) => {
            const next = new Set(prev);
            next.delete(placeId);
            return next;
          });
          setSavedPlaces((prev) => prev.filter((p) => p.place_id !== placeId));
        }
      } else {
        const { error } = await savePlace(tripId, user.id, placeId);
        if (!error) {
          setSavedPlaceIds((prev) => new Set(prev).add(placeId));
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

  const tripBBox = (trip.center_lat && trip.center_lng && !isNaN(trip.center_lat) && !isNaN(trip.center_lng))
    ? calculateBBox(trip.center_lat, trip.center_lng)
    : undefined;

  // Helper for place card
  const PlaceCard = ({ place, isFromSaved = false }: { place: PlaceResult | SavedPlace; isFromSaved?: boolean }) => {
    const placeId = place.place_id;
    const saved = placeId ? isPlaceSaved(placeId) : false;
    const isToggling = placeId === togglingPlaceId;
    
    let isSelected = false;
    if (selectedPlace) {
      if (place.place_id && selectedPlace.place_id) {
        isSelected = place.place_id === selectedPlace.place_id;
      } else if (place.id && selectedPlace.id && place.id.startsWith("poi.") && selectedPlace.id.startsWith("poi.")) {
        isSelected = place.id === selectedPlace.id;
      }
    }

    return (
      <Card
        className={`cursor-pointer transition-all ${
          isSelected ? "ring-2 ring-primary" : "hover:shadow-md"
        } mb-3`}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          handlePlaceSelect(place);
        }}
      >
        <CardHeader className="pb-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-medium flex-1 leading-tight">{place.name}</CardTitle>
            {user?.id && placeId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSave(place);
                }}
                disabled={isToggling}
                className="h-8 w-8 p-0"
              >
                {isToggling ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                 saved ? <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /> : 
                 <Star className="h-4 w-4" />}
              </Button>
            )}
          </div>
          {place.address && (
            <div className="flex items-start gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1">{place.address}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4 pt-0 flex justify-between items-center">
           {place.category && (
              <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded-md uppercase tracking-wide text-muted-foreground font-medium">
                {place.category}
              </span>
            )}
            <Button size="sm" className="h-7 text-xs" onClick={(e) => {
              e.stopPropagation();
              handleAddToItinerary(place);
            }}>Add to trip</Button>
        </CardContent>
      </Card>
    );
  };

  // Convert SavedPlace to PlaceResult for dialog
  const getPlaceForDialog = (place: PlaceResult | SavedPlace): PlaceResult => {
    if ("id" in place && place.id && place.id.startsWith("poi.")) return place as PlaceResult;
    const savedPlace = place as SavedPlace;
    return {
      id: savedPlace.place_id,
      place_id: savedPlace.place_id,
      name: savedPlace.name,
      address: savedPlace.address || "",
      lat: savedPlace.lat || 0,
      lng: savedPlace.lng || 0,
      category: savedPlace.category || undefined,
    };
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background Map */}
      <div className="absolute inset-0 z-0">
        <ExploreMap
          tripId={tripId}
          centerLat={trip.center_lat}
          centerLng={trip.center_lng}
          searchResults={results}
          savedPlaces={savedPlaces}
          selectedPlace={selectedPlace}
          onPlaceSelect={handlePlaceSelect}
          height="100%"
          className="rounded-none border-none"
        />
      </div>

      {/* Floating Panel Toggle (Mobile) */}
      <div className="absolute top-4 left-4 z-20 md:hidden">
         <Button 
            size="icon" 
            variant="secondary" 
            className="shadow-md bg-background/90 backdrop-blur"
            onClick={() => setIsPanelOpen(!isPanelOpen)}
         >
            {isPanelOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
         </Button>
      </div>

      {/* Floating Side Panel */}
      <div 
        className={`absolute top-4 left-4 bottom-4 z-10 w-[90%] sm:w-[400px] bg-background/95 backdrop-blur-sm shadow-xl rounded-xl border flex flex-col transition-transform duration-300 ease-in-out ${
          isPanelOpen ? "translate-x-0" : "-translate-x-[110%]"
        } md:translate-x-0`}
      >
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <div className="mb-6">
            <h1 className="text-xl font-bold">
              {trip.destination_name || trip.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              Discover places in {trip.destination_name || "your destination"}
            </p>
          </div>

          {/* Search */}
          <div className="mb-4 sticky top-0 bg-background/95 backdrop-blur pb-2 z-10">
            <ExploreSearch 
              onSelectPlace={handleAutocompleteSelect} 
              bbox={tripBBox}
              placeholder={`Search in ${trip.destination_name || 'city'}...`}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {FILTER_OPTIONS.map((filter) => (
              <Button
                key={filter.query}
                variant={selectedFilter === filter.query ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleFilterClick(filter.query)}
                disabled={loading}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Selected Place Details (if any) */}
          {selectedPlace && (
             <div className="mb-6 animate-in slide-in-from-bottom-4 fade-in">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold">Selected Place</h2>
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedPlace(null)}>Close</Button>
                </div>
                <PlaceDetailsPanel
                  place={selectedPlace}
                  isSaved={selectedPlace.place_id ? isPlaceSaved(selectedPlace.place_id) : false}
                  isToggling={selectedPlace.place_id === togglingPlaceId}
                  onToggleSave={() => handleToggleSave(selectedPlace)}
                  onAddToItinerary={() => handleAddToItinerary(selectedPlace)}
                  variant="compact" 
                />
             </div>
          )}

          {/* Search Results */}
          {loading ? (
             <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : results.length > 0 ? (
             <div className="space-y-2 mb-6">
                <h2 className="text-sm font-semibold mb-2">Results</h2>
                {results.map(place => <PlaceCard key={place.id} place={place} />)}
             </div>
          ) : selectedFilter && !loading && (
             <div className="text-center py-8 text-muted-foreground text-sm">No places found for this filter.</div>
          )}

          {/* Saved Places */}
          {savedPlaces.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold mb-3">Saved Places</h2>
              <div className="space-y-2">
                {savedPlaces.map(place => <PlaceCard key={place.place_id} place={place} isFromSaved />)}
              </div>
            </div>
          )}

          {/* Hotel Search */}
          <div className="mt-8 pt-4 border-t">
             <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => {
                  const city = trip.destination_name || trip.title;
                  if (!trip.start_date || !trip.end_date) return;
                  const checkin = format(new Date(trip.start_date), "yyyy-MM-dd");
                  const checkout = format(new Date(trip.end_date), "yyyy-MM-dd");
                  window.open(`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}&checkin=${checkin}&checkout=${checkout}`, "_blank");
                }}
              >
                <Hotel className="h-4 w-4" />
                Search Hotels on Booking.com
              </Button>
          </div>
        </div>
      </div>

      {/* Dialog */}
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
