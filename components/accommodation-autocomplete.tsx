"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccommodationOption {
  placeId: string;
  name: string;
  address: string;
}

interface AccommodationAutocompleteProps {
  value: AccommodationOption | null;
  onChange: (accommodation: AccommodationOption | null) => void;
  className?: string;
  placeholder?: string;
  inputClassName?: string;
  destinationLocation?: string; // Optional: "lat,lng" for biasing results
}

export function AccommodationAutocomplete({
  value,
  onChange,
  className,
  placeholder = "Search hotels or addresses...",
  inputClassName,
  destinationLocation,
}: AccommodationAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AccommodationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update query when value changes externally
  useEffect(() => {
    if (value) {
      setQuery(value.name);
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

  const searchAccommodation = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      let url = `/api/places/autocomplete?input=${encodeURIComponent(searchQuery)}&types=lodging`;
      if (destinationLocation) {
        url += `&location=${destinationLocation}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();
      const options: AccommodationOption[] = (data.predictions || []).map(
        (pred: any) => {
          // Main text is usually the name
          const name = pred.structuredFormatting?.main_text || pred.description.split(",")[0].trim();
          // Full description is the address
          const address = pred.description;

          return {
            placeId: pred.placeId,
            name,
            address,
          };
        }
      );

      setSuggestions(options);
      setIsOpen(true);
    } catch (error) {
      console.error("Error searching accommodation:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    searchAccommodation(newQuery);
    if (!newQuery) {
      onChange(null);
    }
  };

  const handleSelect = (option: AccommodationOption) => {
    setQuery(option.name);
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
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={handleClear}
            onMouseDown={(e) => e.preventDefault()}
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
          {suggestions.map((option) => (
            <button
              key={option.placeId}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0 first:rounded-t-md last:rounded-b-md"
              onClick={() => handleSelect(option)}
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {option.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {option.address}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

