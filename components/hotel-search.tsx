"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Star, MapPin, ExternalLink, Loader2, ArrowLeft } from "lucide-react";
import { useTrip } from "@/hooks/use-trip";
import { type HotelType, type HotelResult } from "@/lib/google-places/hotels";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface HotelSearchProps {
  tripId: string;
}

export function HotelSearch({ tripId }: HotelSearchProps) {
  const { data: trip } = useTrip(tripId);
  const [rawHotels, setRawHotels] = useState<HotelResult[]>([]);
  const [hotels, setHotels] = useState<HotelResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hotelType, setHotelType] = useState<HotelType>("any");
  const [budgetMin, setBudgetMin] = useState(30);
  const [budgetMax, setBudgetMax] = useState(600);
  const [selectedHotel, setSelectedHotel] = useState<HotelResult | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const { addToast } = useToast();
  const router = useRouter();

  const searchHotelsForTrip = useCallback(async () => {
    if (!trip || trip.center_lat == null || trip.center_lng == null) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Hotel search requires Google Maps JS SDK which has been removed
      // TODO: Refactor to use Places API REST endpoint instead
      setError("Hotel search is currently unavailable. Please check back later.");
      setRawHotels([]);
    } catch (err) {
      console.error("Error searching hotels:", err);
      setError(err instanceof Error ? err.message : "Failed to search hotels");
    } finally {
      setLoading(false);
    }
  }, [trip, hotelType]);

  // Filter hotels based on budget
  useEffect(() => {
    if (rawHotels.length === 0) {
      setHotels([]);
      return;
    }

    const filtered = rawHotels.filter((hotel) => {
      // If price_level is missing, include it (generous filtering)
      if (hotel.price_level === undefined || hotel.price_level === null) return true;
      
      // Approximate mapping:
      // 0: Free
      // 1: Inexpensive (< $50)
      // 2: Moderate ($50 - $100)
      // 3: Expensive ($100 - $200)
      // 4: Very Expensive (> $200)

      // Max budget filter
      if (budgetMax < 50 && hotel.price_level > 1) return false;
      if (budgetMax < 100 && hotel.price_level > 2) return false;
      if (budgetMax < 200 && hotel.price_level > 3) return false;

      // Min budget filter
      if (budgetMin > 200 && hotel.price_level < 4) return false;
      if (budgetMin > 100 && hotel.price_level < 3) return false;
      if (budgetMin > 50 && hotel.price_level < 2) return false;

      return true;
    });

    setHotels(filtered);
  }, [rawHotels, budgetMin, budgetMax]);

  // Search hotels when filters change
  useEffect(() => {
    if (trip && trip.center_lat != null && trip.center_lng != null) {
      searchHotelsForTrip();
    }
  }, [trip, hotelType, searchHotelsForTrip]);

  const handleViewDetails = (hotel: HotelResult) => {
    setSelectedHotel(hotel);
    setDetailsOpen(true);
  };

  const handleBookOnBooking = (hotel: HotelResult) => {
    const destination = trip?.destination_name || trip?.title || "";
    const url = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.name + ' ' + destination)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSetAsAccommodation = async () => {
    if (!selectedHotel || !trip) return;

    setSaving(true);
    try {
      // Save to trip - use accommodation_address field for now
      // Note: The user mentioned they already ran SQL to add accommodation_name, accommodation_place_id, accommodation_photo_url
      // If those columns don't exist yet, we'll just use accommodation_address
      const updateData: any = {
        accommodation_address: selectedHotel.formatted_address,
      };

      // Try to add additional fields if they exist in the schema
      // These will be ignored if columns don't exist
      try {
        updateData.accommodation_name = selectedHotel.name;
        updateData.accommodation_place_id = selectedHotel.place_id;
        updateData.accommodation_photo_url = selectedHotel.photo_reference || null;
      } catch (e) {
        // Ignore if columns don't exist
      }

      const { error } = await (supabase
        .from("trips") as any)
        .update(updateData)
        .eq("id", tripId);

      if (error) throw error;

      addToast({
        title: "Accommodation saved!",
        description: "Future itineraries will consider this location.",
        variant: "success",
      });

      setDetailsOpen(false);
    } catch (err) {
      console.error("Error saving accommodation:", err);
      addToast({
        title: "Error",
        description: "Failed to save accommodation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getHotelTypeLabel = (types: string[] | undefined): string => {
    if (!types) return "Hotel";
    if (types.some((t) => t.toLowerCase().includes("hostel"))) return "Hostel";
    if (types.some((t) => t.toLowerCase().includes("apartment"))) return "Apartment";
    return "Hotel";
  };


  if (!trip) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Loading trip...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Filters + Hotel List */}
      <div className="w-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/trips/${tripId}`)}
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to trip
          </Button>
          <h1 className="text-2xl font-bold mb-2">Find a place to stay</h1>
          <p className="text-sm text-muted-foreground">
            {trip.destination_name || trip.title}
          </p>
        </div>

        {/* Filters */}
        <div className="p-6 border-b space-y-4">
          <div>
            <Label className="mb-2 block">Hotel Type</Label>
            <RadioGroup value={hotelType} onValueChange={(v) => setHotelType(v as HotelType)}>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="any" id="any" />
                  <Label htmlFor="any" className="cursor-pointer">Any</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hotel" id="hotel" />
                  <Label htmlFor="hotel" className="cursor-pointer">Hotel</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hostel" id="hostel" />
                  <Label htmlFor="hostel" className="cursor-pointer">Hostel</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="apartment" id="apartment" />
                  <Label htmlFor="apartment" className="cursor-pointer">Apartment</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="mb-2 block">
              Budget per night: ${budgetMin} - ${budgetMax}
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(Number(e.target.value))}
                className="w-24"
                min={0}
              />
              <span>-</span>
              <Input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                className="w-24"
                min={budgetMin}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Note: Price filtering is approximate. Actual prices may vary.
            </p>
          </div>
        </div>

        {/* Hotel List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive py-4">{error}</div>
          )}

          {!loading && !error && hotels.length === 0 && (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No hotels found. Try adjusting your filters.
            </div>
          )}

          {!loading && hotels.length > 0 && (
            <div className="space-y-4">
              {hotels.map((hotel) => (
                <Card key={hotel.place_id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex gap-3">
                      {hotel.photo_reference ? (
                        <Image
                          src={hotel.photo_reference}
                          alt={hotel.name}
                          width={120}
                          height={80}
                          className="h-20 w-32 rounded-lg object-cover flex-shrink-0"
                          unoptimized
                        />
                      ) : (
                        <div className="h-20 w-32 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 flex-shrink-0">
                          No image
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-1">{hotel.name}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{hotel.formatted_address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {hotel.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{hotel.rating.toFixed(1)}</span>
                            </div>
                          )}
                          {hotel.user_ratings_total && (
                            <span className="text-xs text-muted-foreground">
                              ({hotel.user_ratings_total} reviews)
                            </span>
                          )}
                          <span className="text-xs px-2 py-1 bg-muted rounded-md">
                            {getHotelTypeLabel(hotel.types)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(hotel)}
                      >
                        View details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleBookOnBooking(hotel)}
                      >
                        Book on Booking.com
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details Sheet */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedHotel?.name}</SheetTitle>
            <SheetDescription>{selectedHotel?.formatted_address}</SheetDescription>
          </SheetHeader>
          {selectedHotel && (
            <div className="mt-6 space-y-4">
              {selectedHotel.photo_reference && (
                <Image
                  src={selectedHotel.photo_reference}
                  alt={selectedHotel.name}
                  width={400}
                  height={300}
                  className="w-full h-48 rounded-lg object-cover"
                  unoptimized
                />
              )}
              <div className="flex items-center gap-2">
                {selectedHotel.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{selectedHotel.rating.toFixed(1)}</span>
                  </div>
                )}
                {selectedHotel.user_ratings_total && (
                  <span className="text-sm text-muted-foreground">
                    ({selectedHotel.user_ratings_total} reviews)
                  </span>
                )}
                <span className="text-sm px-2 py-1 bg-muted rounded-md">
                  {getHotelTypeLabel(selectedHotel.types)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleBookOnBooking(selectedHotel)}
                  className="flex-1"
                >
                  Book on Booking.com
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSetAsAccommodation}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Set as my accommodation"
                  )}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

