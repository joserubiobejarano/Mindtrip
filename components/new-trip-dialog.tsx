"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { eachDayOfInterval, format } from "date-fns";
import { DestinationAutocomplete } from "@/components/destination-autocomplete";

interface NewTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: string;
}

interface DestinationOption {
  id: string;
  placeName: string;
  region: string;
  type: "City" | "Country" | "Region";
  center: [number, number];
}

export function NewTripDialog({
  open,
  onOpenChange,
  onSuccess,
  userId,
}: NewTripDialogProps) {
  const [destination, setDestination] = useState<DestinationOption | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [numberOfPeople, setNumberOfPeople] = useState<string>("");
  const [dailyBudget, setDailyBudget] = useState<string>("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [findAccommodation, setFindAccommodation] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currencyOptions = [
    { value: "EUR", label: "EUR – Euro" },
    { value: "USD", label: "USD – US Dollar" },
    { value: "GBP", label: "GBP – British Pound" },
    { value: "MXN", label: "MXN – Mexican Peso" },
    { value: "COP", label: "COP – Colombian Peso" },
    { value: "ARS", label: "ARS – Argentine Peso" },
    { value: "CLP", label: "CLP – Chilean Peso" },
    { value: "BRL", label: "BRL – Brazilian Real" },
  ];

  const interestOptions = [
    { value: "museums", label: "Museums" },
    { value: "parks_nature", label: "Parks & Nature" },
    { value: "monuments_history", label: "Monuments & History" },
    { value: "food", label: "Food" },
    { value: "nightlife", label: "Nightlife" },
    { value: "shopping", label: "Shopping" },
    { value: "neighborhoods", label: "Neighborhoods" },
  ];

  // Auto-generate trip title based on destination and dates
  const generateTripTitle = (dest: DestinationOption | null, start: string, end: string): string => {
    if (!dest) return "";
    const cityName = dest.placeName;
    if (!start || !end) return `Trip to ${cityName}`;
    
    const startDate = new Date(start);
    const month = startDate.toLocaleDateString("en-US", { month: "long" });
    const season = getSeason(startDate);
    
    return `${season} getaway to ${cityName}`;
  };

  const getSeason = (date: Date): string => {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return "Spring";
    if (month >= 5 && month <= 7) return "Summer";
    if (month >= 8 && month <= 10) return "Fall";
    return "Winter";
  };

  const router = useRouter();
  const supabase = createClient();
  const { user } = useUser();
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setDestination(null);
      setStartDate("");
      setEndDate("");
      setCurrency("EUR");
      setNumberOfPeople("");
      setDailyBudget("");
      setHotelAddress("");
      setFindAccommodation(false);
      setInterests([]);
      setError(null);
    }
  }, [open]);
  
  if (!userId) {
    return null;
  }

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!destination || !startDate || !endDate || !currency) {
        throw new Error("Please fill in all required fields");
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        throw new Error("End date must be after start date");
      }

      // Auto-generate title
      const title = generateTripTitle(destination, startDate, endDate);

      // Prepare daily budget - convert to number or null
      const dailyBudgetNum = dailyBudget ? parseFloat(dailyBudget) : null;
      
      // Prepare number of people - convert to integer or null
      const numberOfPeopleNum = numberOfPeople ? parseInt(numberOfPeople, 10) : null;

      // Extract coordinates and destination info from selected destination
      const [centerLng, centerLat] = destination?.center || [null, null];
      
      // Extract country from region (usually the last part after comma)
      const destinationCountry = destination?.region 
        ? destination.region.split(",").slice(-1)[0].trim() 
        : null;

      // Create trip
      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .insert({
          title,
          start_date: startDate,
          end_date: endDate,
          default_currency: currency,
          daily_budget: dailyBudgetNum,
          number_of_people: numberOfPeopleNum,
          hotel_address: findAccommodation ? null : (hotelAddress || null),
          find_accommodation: findAccommodation,
          interests: interests.length > 0 ? interests : null,
          destination_name: destination.placeName || null,
          destination_country: destinationCountry || null,
          destination_place_id: destination.id || null,
          center_lat: centerLat || null,
          center_lng: centerLng || null,
          owner_id: userId,
        })
        .select()
        .single();

      if (tripError) throw tripError;
      if (!trip) throw new Error("Failed to create trip");

      // Create days for the trip
      const days = eachDayOfInterval({ start, end });
      const dayRecords = days.map((date, index) => ({
        trip_id: trip.id,
        date: format(date, "yyyy-MM-dd"),
        day_number: index + 1,
      }));

      const { error: daysError } = await supabase
        .from("days")
        .insert(dayRecords);

      if (daysError) throw daysError;

      // Create owner member entry
      const userEmail = user?.primaryEmailAddress?.emailAddress || null;
      const displayName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : userEmail || null;

      const { error: memberError } = await supabase
        .from("trip_members")
        .insert({
          trip_id: trip.id,
          user_id: userId,
          email: userEmail,
          role: "owner",
          display_name: displayName,
        });

      if (memberError) {
        console.error("Error creating owner member:", memberError);
        // Rollback: delete the trip if member creation fails
        await supabase.from("trips").delete().eq("id", trip.id);
        throw new Error("Failed to create trip member. Please try again.");
      }

      // Auto-generate itinerary
      try {
        const itineraryResponse = await fetch("/api/ai-itinerary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tripId: trip.id }),
        });

        if (!itineraryResponse.ok) {
          console.error("Failed to generate itinerary, but trip was created");
        }
      } catch (itineraryError) {
        console.error("Error generating itinerary:", itineraryError);
        // Don't fail the trip creation if itinerary generation fails
      }

      onOpenChange(false);
      onSuccess();
      router.push(`/trips/${trip.id}?tab=itinerary`);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Trip</DialogTitle>
          <DialogDescription>
            Plan your next adventure. We&apos;ll generate a smart itinerary for you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Destination */}
            <div className="space-y-2">
              <Label htmlFor="destination" className="text-base font-medium">Destination</Label>
              <DestinationAutocomplete
                value={destination}
                onChange={setDestination}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-base font-medium mb-4">Travel Dates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-base font-medium mb-4">Trip Details</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="number_of_people">How many people are traveling?</Label>
                  <Input
                    id="number_of_people"
                    type="number"
                    placeholder="e.g., 2"
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(e.target.value)}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency} required>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily_budget">Daily Budget (optional)</Label>
                  <Input
                    id="daily_budget"
                    type="number"
                    placeholder="e.g., 100"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-base font-medium mb-4">Accommodation</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="find_accommodation"
                    checked={findAccommodation}
                    onCheckedChange={(checked) => {
                      setFindAccommodation(checked as boolean);
                      if (checked) {
                        setHotelAddress("");
                      }
                    }}
                  />
                  <Label htmlFor="find_accommodation" className="font-normal cursor-pointer">
                    Find me a great place to stay
                  </Label>
                </div>
                {!findAccommodation && (
                  <div className="space-y-2">
                    <Label htmlFor="hotel_address">Hotel / Accommodation Address</Label>
                    <Input
                      id="hotel_address"
                      placeholder="Enter address or search..."
                      value={hotelAddress}
                      onChange={(e) => setHotelAddress(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      We&apos;ll use this to help plan your itinerary
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-base font-medium mb-4">Interests</h3>
              <div className="grid grid-cols-2 gap-3">
                {interestOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={interests.includes(option.value)}
                      onCheckedChange={() => toggleInterest(option.value)}
                    />
                    <Label htmlFor={option.value} className="font-normal cursor-pointer text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

