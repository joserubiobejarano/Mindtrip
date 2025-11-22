"use client";

import { useState, useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [budgetLevel, setBudgetLevel] = useState("comfort");
  const [dailyBudget, setDailyBudget] = useState<string>("");
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

  const router = useRouter();
  const supabase = createClient();
  
  // Auto-fill title when destination is selected and title is empty
  useEffect(() => {
    if (destination && !title.trim()) {
      setTitle(`Trip to ${destination.placeName}`);
    }
  }, [destination]); // Only depend on destination, not title, to avoid re-triggering

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setDestination(null);
      setTitle("");
      setStartDate("");
      setEndDate("");
      setCurrency("EUR");
      setBudgetLevel("comfort");
      setDailyBudget("");
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
      if (!title || !startDate || !endDate || !currency) {
        throw new Error("Please fill in all required fields");
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        throw new Error("End date must be after start date");
      }

      // Prepare daily budget - convert to number or null
      const dailyBudgetNum = dailyBudget ? parseFloat(dailyBudget) : null;

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
          budget_level: budgetLevel,
          daily_budget: dailyBudgetNum,
          interests: interests.length > 0 ? interests : null,
          destination_name: destination?.placeName || null,
          destination_country: destinationCountry || null,
          destination_place_id: destination?.id || null,
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

      onOpenChange(false);
      onSuccess();
      router.push(`/trips/${trip.id}`);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
          <DialogDescription>
            Plan your next adventure. You can add activities later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="destination">Where to?</Label>
              <DestinationAutocomplete
                value={destination}
                onChange={setDestination}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Trip Title</Label>
              <Input
                id="title"
                placeholder="e.g., Summer in Paris"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
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
              <Label>Budget Level</Label>
              <RadioGroup value={budgetLevel} onValueChange={setBudgetLevel}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="backpacker" id="backpacker" />
                  <Label htmlFor="backpacker" className="font-normal cursor-pointer">
                    Backpacker
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="budget" id="budget" />
                  <Label htmlFor="budget" className="font-normal cursor-pointer">
                    Budget
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comfort" id="comfort" />
                  <Label htmlFor="comfort" className="font-normal cursor-pointer">
                    Comfort
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="luxury" id="luxury" />
                  <Label htmlFor="luxury" className="font-normal cursor-pointer">
                    Luxury
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily_budget">Daily Budget (approx.)</Label>
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

            <div className="space-y-2">
              <Label>Interests</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
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

