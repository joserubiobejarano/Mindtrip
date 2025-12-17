"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PlaceSearchProps {
  onSelectPlace: (placeId: string) => void;
  selectedPlaceId: string | null;
}

export function PlaceSearch({ onSelectPlace, selectedPlaceId }: PlaceSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    // Fetch selected place details if placeId is provided
    if (selectedPlaceId) {
      fetchPlaceDetails(selectedPlaceId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlaceId]);


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


  const handleClear = () => {
    setQuery("");
    setSelectedPlace(null);
    onSelectPlace("");
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          placeholder="Search for a place..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />
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
    </div>
  );
}

