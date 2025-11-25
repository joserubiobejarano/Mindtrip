"use client";

import { GoogleMapsProvider } from "@/components/google-maps-provider";
import { HotelSearch } from "@/components/hotel-search";

export function HotelSearchWrapper({ tripId }: { tripId: string }) {
  return (
    <GoogleMapsProvider>
      <HotelSearch tripId={tripId} />
    </GoogleMapsProvider>
  );
}

