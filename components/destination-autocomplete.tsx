"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
  place_type: string[];
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
}

interface DestinationOption {
  id: string;
  placeName: string;
  region: string;
  type: "City" | "Country" | "Region";
  center: [number, number];
}

interface DestinationAutocompleteProps {
  value: DestinationOption | null;
  onChange: (destination: DestinationOption | null) => void;
  className?: string;
}

export function DestinationAutocomplete({
  value,
  onChange,
  className,
}: DestinationAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<DestinationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update query when value changes externally
  useEffect(() => {
    if (value) {
      setQuery(value.placeName);
    }
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchDestinations = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
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
        )}.json?access_token=${mapboxToken}&types=place,country,region&limit=7`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();
      const options: DestinationOption[] = (data.features || []).map(
        (feature: MapboxFeature) => {
          // Extract place name (first part before comma)
          const placeName = feature.place_name.split(",")[0].trim();
          
          // Extract region/country (usually the last context item)
          const regionParts: string[] = [];
          if (feature.context) {
            // Get country first, then region/state if available
            const country = feature.context.find(
              (ctx) => ctx.id.startsWith("country")
            );
            const region = feature.context.find(
              (ctx) => ctx.id.startsWith("region")
            );
            
            if (region) regionParts.push(region.text);
            if (country) regionParts.push(country.text);
          }
          const region = regionParts.join(", ") || feature.place_name.split(",").slice(1).join(",").trim();

          // Determine type based on place_type
          let type: "City" | "Country" | "Region" = "City";
          if (feature.place_type?.includes("country")) {
            type = "Country";
          } else if (feature.place_type?.includes("region")) {
            type = "Region";
          } else if (feature.place_type?.includes("place")) {
            type = "City";
          }

          return {
            id: feature.id,
            placeName,
            region,
            type,
            center: feature.center,
          };
        }
      );

      setSuggestions(options);
      setIsOpen(true);
    } catch (error) {
      console.error("Error searching destinations:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    searchDestinations(newQuery);
    if (!newQuery) {
      onChange(null);
    }
  };

  const handleSelect = (option: DestinationOption) => {
    setQuery(option.placeName);
    onChange(option);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    onChange(null);
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (query.length >= 3 && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay closing to allow click on suggestions
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder="Where to?"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="pr-10"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={handleClear}
            onMouseDown={(e) => e.preventDefault()} // Prevent input blur
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
        {loading && !query && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((option, index) => (
            <button
              key={option.id}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0 first:rounded-t-md last:rounded-b-md"
              onClick={() => handleSelect(option)}
              onMouseDown={(e) => e.preventDefault()} // Prevent input blur
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {option.placeName}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {option.region}
                  </div>
                </div>
                <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full whitespace-nowrap flex-shrink-0">
                  {option.type}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

