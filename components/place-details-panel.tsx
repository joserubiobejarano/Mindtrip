"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, ExternalLink, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface PlaceResult {
  id: string;
  place_id?: string;
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

interface PlaceDetailsPanelProps {
  place: PlaceResult | SavedPlace;
  isSaved: boolean;
  isToggling: boolean;
  onToggleSave: () => void;
  onAddToItinerary: () => void;
}

export function PlaceDetailsPanel({
  place,
  isSaved,
  isToggling,
  onToggleSave,
  onAddToItinerary,
}: PlaceDetailsPanelProps) {
  const { user } = useUser();

  const mapsUrl =
    place.lat && place.lng
      ? `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`
      : null;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl flex-1">{place.name}</CardTitle>
          {user?.id && place.place_id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSave}
              disabled={isToggling}
              className="flex items-center gap-1 h-auto p-1"
              title={isSaved ? "Saved" : "Save"}
            >
              {isToggling ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isSaved ? (
                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              ) : (
                <Star className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
        {place.address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{place.address}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {place.category && (
          <div>
            <span className="text-xs px-2 py-1 bg-muted rounded-md">
              {place.category}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {mapsUrl && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full justify-start"
            >
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in Google Maps
              </a>
            </Button>
          )}

          <Button size="sm" onClick={onAddToItinerary} className="w-full">
            Add to itinerary
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

