"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, ExternalLink } from "lucide-react";
import { getPlacePhotoUrl } from "@/lib/google/accommodation";

interface AccommodationData {
  place_id: string;
  name: string;
  formatted_address: string;
  rating: number;
  user_ratings_total: number;
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface AccommodationCardProps {
  accommodation: AccommodationData;
}

export function AccommodationCard({ accommodation }: AccommodationCardProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const photoUrl = accommodation.photos && accommodation.photos.length > 0 && apiKey
    ? getPlacePhotoUrl(accommodation.photos[0].photo_reference, apiKey, 800)
    : null;

  const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${accommodation.place_id}`;

  return (
    <Card className="mb-6 overflow-hidden">
      {photoUrl && (
        <div className="relative w-full h-48">
          <Image
            src={photoUrl}
            alt={accommodation.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{accommodation.name}</CardTitle>
            {accommodation.rating > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-medium">
                  {accommodation.rating.toFixed(1)}
                </span>
                {accommodation.user_ratings_total > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({accommodation.user_ratings_total.toLocaleString()} reviews)
                  </span>
                )}
              </div>
            )}
            {accommodation.formatted_address && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{accommodation.formatted_address}</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-3">
          <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
            Automatically selected for you
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="w-full"
        >
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open in Google Maps
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

