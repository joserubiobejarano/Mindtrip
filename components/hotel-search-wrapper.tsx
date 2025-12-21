"use client";

import { HotelSearch } from "@/components/hotel-search";

export function HotelSearchWrapper({ tripId }: { tripId: string }) {
  return <HotelSearch tripId={tripId} />;
}

