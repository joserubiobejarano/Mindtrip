"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface MapboxPlace {
  id: string;
  place_name: string;
  center: [number, number];
  context?: Array<{
    text: string;
  }>;
  place_type?: string[];
}

interface PlaceSearchProps {
  onSelectPlace: (placeId: string) => void;
  selectedPlaceId: string | null;
}

export function PlaceSearch({ onSelectPlace, selectedPlaceId }: PlaceSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MapboxPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    // Fetch selected place details if placeId is provided
    if (selectedPlaceId) {
      fetchPlaceDetails(selectedPlaceId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlaceId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPlaceDetails = async (placeId: string) => {
    const { data } = await supabase
      .from("places")
      .select("*")
      .eq("id", placeId)
      .single();

    if (data) {
      setSelectedPlace(data);
    }
  };

  const searchPlaces = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!mapboxToken) {
        console.error("Mapbox token not configured");
        return;
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${mapboxToken}&limit=5`
      );

      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error("Error searching places:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = async (place: MapboxPlace) => {
    setQuery(place.place_name);
    setSuggestions([]);

    try {
      // Check if place already exists in database
      const address = place.context
        ?.map((ctx: any) => ctx.text)
        .join(", ")
        .trim() || "";

      const { data: existingPlace } = await supabase
        .from("places")
        .select("*")
        .eq("external_id", place.id)
        .single();

      if (existingPlace) {
        setSelectedPlace(existingPlace);
        onSelectPlace(existingPlace.id);
      } else {
        // Create new place in database
        const [lng, lat] = place.center;
        const { data: newPlace, error } = await supabase
          .from("places")
          .insert({
            name: place.place_name,
            address: address || null,
            lat: lat,
            lng: lng,
            external_id: place.id,
            category: place.place_type?.[0] || place.context?.[0]?.text || null,
          })
          .select()
          .single();

        if (error) throw error;
        if (newPlace) {
          setSelectedPlace(newPlace);
          onSelectPlace(newPlace.id);
        }
      }
    } catch (error) {
      console.error("Error saving place:", error);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSelectedPlace(null);
    onSelectPlace("");
    setSuggestions([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Input
          placeholder="Search for a place..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            searchPlaces(e.target.value);
          }}
          onFocus={() => {
            if (query.length >= 3) {
              searchPlaces(query);
            }
          }}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {selectedPlace && (
        <div className="mt-2 p-2 bg-muted rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{selectedPlace.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 px-2 text-xs"
          >
            Clear
          </Button>
        </div>
      )}

      {suggestions.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto">
          <CardContent className="p-0">
            {suggestions.map((place, index) => (
              <div
                key={index}
                className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                onClick={() => handleSelectSuggestion(place)}
              >
                <div className="font-medium">{place.place_name}</div>
                {place.context && (
                  <div className="text-sm text-muted-foreground">
                    {place.context.map((ctx: any) => ctx.text).join(", ")}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

