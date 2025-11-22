"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrip } from "@/hooks/use-trip";
import { useDays } from "@/hooks/use-days";
import { AddToItineraryDialog } from "@/components/add-to-itinerary-dialog";
import { Loader2, Search, MapPin } from "lucide-react";

interface PlaceResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category?: string;
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
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: trip } = useTrip(tripId);
  const { data: days } = useDays(tripId);

  const searchPlaces = async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.error('Missing NEXT_PUBLIC_MAPBOX_TOKEN');
      setError('Map search is not configured. Please contact support.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build URL with or without proximity based on trip center coordinates
      const hasProximity = trip?.center_lat && trip?.center_lng;
      const proximityParam = hasProximity 
        ? `&proximity=${trip.center_lng},${trip.center_lat}`
        : '';
      
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?types=poi&limit=10${proximityParam}&access_token=${mapboxToken}`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Mapbox error status:', response.status, errorText);
        setError('Something went wrong searching places. Please try again.');
        setResults([]);
        return;
      }

      const data = await response.json();
      const mappedResults: PlaceResult[] = (data.features || []).map(
        (feature: any) => {
          const [lng, lat] = feature.center || [];
          
          // Extract place name (feature.text is the primary name for POIs)
          const name = feature.text || feature.properties?.name || feature.place_name?.split(",")[0] || "Unknown";
          
          // Extract address (context provides location details)
          const address =
            feature.properties?.address ||
            (feature.context
              ?.filter((ctx: any) => ctx.id?.startsWith("place") || ctx.id?.startsWith("postcode") || ctx.id?.startsWith("district"))
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

      setResults(mappedResults);
    } catch (err) {
      console.error('Error searching places:', err);
      setError('Something went wrong searching places. Please check your internet connection and try again.');
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

  const handleAddToItinerary = (place: PlaceResult) => {
    setSelectedPlace(place);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedPlace(null);
  };

  if (!trip) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Loading trip...</div>
      </div>
    );
  }

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
      <div className="flex flex-wrap gap-2 mb-6">
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

        {!loading && !error && results.length === 0 && !selectedFilter && (
          <div className="text-sm text-muted-foreground py-8 text-center">
            Search for a place or click a filter to discover places
          </div>
        )}

        {!loading && !error && results.length === 0 && selectedFilter && (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No results found. Try a different search.
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-3">
            {results.map((place) => (
              <Card key={place.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{place.name}</CardTitle>
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
                    <Button
                      size="sm"
                      onClick={() => handleAddToItinerary(place)}
                    >
                      Add to itinerary
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add to Itinerary Dialog */}
      {selectedPlace && (
        <AddToItineraryDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          place={selectedPlace}
          tripId={tripId}
          days={days || []}
        />
      )}
    </div>
  );
}

