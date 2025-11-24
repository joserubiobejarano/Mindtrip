"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Star, MapPin, ExternalLink, Loader2, Phone, Globe, Clock } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  website?: string;
  formatted_phone_number?: string;
  photoUrl?: string | null;
  types?: string[];
  googleMapsUrl: string;
}

interface PlaceDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeId: string | null;
  placeName?: string;
  onAddToPlan: () => void;
  onAddToItinerary: () => void;
  activeFilter?: string | null;
}

export function PlaceDetailsDrawer({
  open,
  onOpenChange,
  placeId,
  placeName,
  onAddToPlan,
  onAddToItinerary,
  activeFilter,
}: PlaceDetailsDrawerProps) {
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  // Fetch place details when drawer opens
  useEffect(() => {
    if (!open || !placeId) {
      setDetails(null);
      setError(null);
      return;
    }

    const fetchPlaceDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // We need to use the PlacesService from the map
        // For now, we'll create a temporary service
        if (typeof window === "undefined" || !window.google) {
          throw new Error("Google Maps API not loaded");
        }

        const tempDiv = document.createElement("div");
        const tempMap = new google.maps.Map(tempDiv);
        const service = new google.maps.places.PlacesService(tempMap);

        const request: google.maps.places.PlaceDetailsRequest = {
          placeId: placeId,
          fields: [
            "name",
            "formatted_address",
            "rating",
            "user_ratings_total",
            "opening_hours",
            "website",
            "formatted_phone_number",
            "photos",
            "types",
          ],
        };

        service.getDetails(request, (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            // Get photo URL
            let photoUrl: string | null = null;
            if (place.photos && place.photos.length > 0) {
              try {
                photoUrl = place.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 });
              } catch (err) {
                console.error("Error getting photo URL:", err);
              }
            }

            const placeDetails: PlaceDetails = {
              place_id: place.place_id || placeId,
              name: place.name || placeName || "Unknown place",
              formatted_address: place.formatted_address,
              rating: place.rating,
              user_ratings_total: place.user_ratings_total,
              opening_hours: place.opening_hours
                ? {
                    open_now: place.opening_hours.open_now,
                    weekday_text: place.opening_hours.weekday_text,
                  }
                : undefined,
              website: place.website,
              formatted_phone_number: place.formatted_phone_number,
              photoUrl,
              types: place.types,
              googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
            };

            setDetails(placeDetails);
          } else {
            setError("Failed to load place details");
          }
          setLoading(false);
        });
      } catch (err) {
        console.error("Error fetching place details:", err);
        setError("Failed to load place details");
        setLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [open, placeId, placeName]);

  // Get "good for" label based on types and active filter
  const getGoodForLabel = (): string | null => {
    if (!details?.types || details.types.length === 0) return null;

    const types = details.types;

    // If there's an active filter, use that to generate the label
    if (activeFilter === "parks" || activeFilter === "museums") {
      if (types.includes("park") || types.includes("tourist_attraction")) {
        return "Ideal if you like parks and nature";
      }
      if (types.includes("museum") || types.includes("art_gallery")) {
        return "Ideal if you enjoy art and museums";
      }
    }
    if (activeFilter === "food") {
      if (types.includes("restaurant") || types.includes("cafe")) {
        return "Great if you love food spots";
      }
    }
    if (activeFilter === "nightlife") {
      if (types.includes("bar") || types.includes("night_club")) {
        return "Nice if you like nightlife";
      }
    }
    if (activeFilter === "shopping") {
      if (types.includes("shopping_mall") || types.includes("store")) {
        return "Perfect if you like shopping";
      }
    }

    // Fallback to general labels
    if (types.includes("park") || types.includes("tourist_attraction")) {
      return "Ideal if you like parks and nature";
    }
    if (types.includes("museum") || types.includes("art_gallery")) {
      return "Ideal if you enjoy art and museums";
    }
    if (types.includes("restaurant") || types.includes("cafe")) {
      return "Great if you love food spots";
    }
    if (types.includes("bar") || types.includes("night_club")) {
      return "Nice if you like nightlife";
    }
    if (types.includes("shopping_mall") || types.includes("store")) {
      return "Perfect if you like shopping";
    }

    return null;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{details?.name || placeName || "Place Details"}</SheetTitle>
          <SheetDescription>
            {details?.formatted_address || "Loading details..."}
          </SheetDescription>
        </SheetHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive py-4">{error}</div>
        )}

        {details && !loading && (
          <div className="mt-6 space-y-6">
            {/* Photo */}
            {details.photoUrl && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image
                  src={details.photoUrl}
                  alt={details.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            {/* Rating */}
            {details.rating && (
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{details.rating.toFixed(1)}</span>
                {details.user_ratings_total && (
                  <span className="text-sm text-muted-foreground">
                    ({details.user_ratings_total.toLocaleString()} reviews)
                  </span>
                )}
              </div>
            )}

            {/* Good for badge */}
            {getGoodForLabel() && (
              <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                {getGoodForLabel()}
              </div>
            )}

            {/* Address */}
            {details.formatted_address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm">{details.formatted_address}</span>
              </div>
            )}

            {/* Opening hours */}
            {details.opening_hours && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">
                    {details.opening_hours.open_now ? "Open now" : "Closed"}
                  </span>
                </div>
                {details.opening_hours.weekday_text && (
                  <div className="pl-7 space-y-1">
                    {details.opening_hours.weekday_text.map((text, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground">
                        {text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Contact info */}
            <div className="space-y-2">
              {details.formatted_phone_number && (
                <a
                  href={`tel:${details.formatted_phone_number}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  {details.formatted_phone_number}
                </a>
              )}
              {details.website && (
                <a
                  href={details.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t">
              <Button onClick={onAddToPlan} className="w-full">
                Add to plan
              </Button>
              <Button onClick={onAddToItinerary} variant="outline" className="w-full">
                Add to itinerary
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="w-full"
              >
                <a
                  href={details.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in Google Maps
                </a>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

