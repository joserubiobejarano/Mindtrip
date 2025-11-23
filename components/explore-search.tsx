"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, Search, X } from "lucide-react";

interface MapboxPlace {
  id: string;
  place_name: string;
  center: [number, number];
  context?: Array<{
    text: string;
  }>;
  place_type?: string[];
  properties?: {
    category?: string;
  };
}

interface ExploreSearchProps {
  onSelectPlace: (place: MapboxPlace) => void;
  bbox?: [number, number, number, number]; // minLng, minLat, maxLng, maxLat
  placeholder?: string;
  className?: string;
}

export function ExploreSearch({ 
  onSelectPlace, 
  bbox, 
  placeholder = "Search for a place...",
  className 
}: ExploreSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MapboxPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
        setFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchPlaces = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
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

      let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        searchQuery
      )}.json?access_token=${mapboxToken}&limit=5&types=poi,landmark`;

      // Add bbox if available to restrict search to the area
      if (bbox) {
        url += `&bbox=${bbox.join(",")}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error("Error searching places:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (place: MapboxPlace) => {
    setQuery(place.place_name); // Optionally keep the query or clear it
    // For Explore tab, we usually want to clear the search so the user can see the result on the map
    // But keeping it might be good too. Let's keep it for now.
    setSuggestions([]);
    onSelectPlace(place);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            searchPlaces(e.target.value);
          }}
          onFocus={() => {
            setFocused(true);
            if (query.length >= 2) {
              searchPlaces(query);
            }
          }}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {suggestions.length > 0 && focused && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {suggestions.map((place) => (
              <div
                key={place.id}
                className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0 flex items-start gap-3"
                onClick={() => handleSelectSuggestion(place)}
              >
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="font-medium text-sm">{place.place_name.split(',')[0]}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {place.place_name.split(',').slice(1).join(',')}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

