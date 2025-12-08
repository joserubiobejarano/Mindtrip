"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OriginCityOption {
  placeId: string;
  name: string;
  description: string; // Full description with region/country
}

interface OriginCityAutocompleteProps {
  value: OriginCityOption | null;
  onChange: (city: OriginCityOption | null) => void;
  className?: string;
  placeholder?: string;
  inputClassName?: string;
}

export function OriginCityAutocomplete({
  value,
  onChange,
  className,
  placeholder = "City of departure (e.g. Malaga)",
  inputClassName,
}: OriginCityAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<OriginCityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update query when value changes externally
  useEffect(() => {
    if (value) {
      setQuery(value.name || value.description);
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

  const searchCities = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/places/autocomplete?input=${encodeURIComponent(searchQuery)}&types=(cities)`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();
      const options: OriginCityOption[] = (data.predictions || []).map(
        (pred: any) => {
          // Extract city name (main text)
          const name = pred.structuredFormatting?.main_text || pred.description.split(",")[0].trim();
          // Full description includes region/country
          const description = pred.description;

          return {
            placeId: pred.placeId,
            name,
            description,
          };
        }
      );

      setSuggestions(options);
      setIsOpen(true);
    } catch (error) {
      console.error("Error searching cities:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    searchCities(newQuery);
    if (!newQuery) {
      onChange(null);
    }
  };

  const handleSelect = (option: OriginCityOption) => {
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
                    {option.description}
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

