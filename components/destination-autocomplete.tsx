"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DestinationOption {
  placeId: string;
  name: string;
  description: string; // Full description with city + country
  city: string;
  country: string;
  center: [number, number]; // [lat, lng]
}

interface DestinationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (destination: DestinationOption) => void;
  className?: string;
  placeholder?: string;
  inputClassName?: string;
}

export function DestinationAutocomplete({
  value,
  onChange,
  onSelect,
  className,
  placeholder = "Search destinations...",
  inputClassName,
}: DestinationAutocompleteProps) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState<Omit<DestinationOption, 'center'>[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update query when value changes externally
  useEffect(() => {
    setQuery(value || "");
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const searchCities = useCallback(async (searchQuery: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (searchQuery.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setNoResults(false);
      return;
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setNoResults(false);

    try {
      const response = await fetch(
        `/api/places/city-autocomplete?q=${encodeURIComponent(searchQuery)}`,
        {
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();
      const options = (data.predictions || []).map((pred: any) => ({
        placeId: pred.placeId,
        name: pred.city,
        description: pred.description,
        city: pred.city,
        country: pred.country,
      }));

      setSuggestions(options);
      setNoResults(options.length === 0);
      setIsOpen(true);
    } catch (error: any) {
      // Ignore abort errors
      if (error.name === 'AbortError') {
        return;
      }
      console.error("Error searching cities:", error);
      setSuggestions([]);
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onChange(newQuery);

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the search (300ms)
    debounceTimerRef.current = setTimeout(() => {
      searchCities(newQuery);
    }, 300);
  };

  const handleSelect = async (option: Omit<DestinationOption, 'center'>) => {
    setQuery(option.description);
    setIsOpen(false);
    setLoading(true);

    try {
      // Fetch place details to get lat/lng
      const response = await fetch('/api/places/city-autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ placeId: option.placeId }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch place details");
      }

      const data = await response.json();
      
      const destination: DestinationOption = {
        placeId: data.placeId,
        name: data.name,
        description: option.description,
        city: option.city,
        country: option.country,
        center: data.center,
      };

      onSelect(destination);
    } catch (error) {
      console.error("Error fetching place details:", error);
      // Still call onSelect with what we have, but without center
      onSelect({
        ...option,
        center: [0, 0], // Fallback
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
    setSuggestions([]);
    setIsOpen(false);
    setNoResults(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (query.length >= 2 && suggestions.length > 0) {
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
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className={cn("pr-10", inputClassName)}
        />
        {query && !loading && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={handleClear}
            onMouseDown={(e) => e.preventDefault()}
          >
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {loading && suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
              Searching...
            </div>
          ) : noResults && !loading ? (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
              No results found
            </div>
          ) : (
            suggestions.map((option) => (
              <button
                key={option.placeId}
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0 first:rounded-t-md last:rounded-b-md"
                onClick={() => handleSelect(option)}
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      {option.city}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {option.country}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
