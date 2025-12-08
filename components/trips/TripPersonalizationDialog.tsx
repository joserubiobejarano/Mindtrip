"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OriginCityAutocomplete, type OriginCityOption } from "@/components/origin-city-autocomplete";
import { AccommodationAutocomplete, type AccommodationOption } from "@/components/accommodation-autocomplete";
import { TripPersonalizationPayload } from "@/types/trip-personalization";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TripPersonalizationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (personalization: TripPersonalizationPayload) => void;
  destinationPlaceId: string;
  destinationName: string;
  startDate: string;
  endDate: string;
}

const INTEREST_CATEGORIES = [
  { id: "food", label: "Food & restaurants" },
  { id: "cafes", label: "Cafés & brunch" },
  { id: "museums", label: "Museums & culture" },
  { id: "parks", label: "Parks & nature" },
  { id: "nightlife", label: "Nightlife & bars" },
  { id: "neighborhoods", label: "Local neighborhoods" },
  { id: "shopping", label: "Shopping" },
  { id: "landmarks", label: "Landmarks & must-see" },
];

const TRANSPORT_MODES = [
  { value: "plane", label: "Plane" },
  { value: "train", label: "Train" },
  { value: "bus", label: "Bus" },
  { value: "car", label: "Car" },
  { value: "unknown", label: "Not sure yet" },
] as const;

export function TripPersonalizationDialog({
  isOpen,
  onClose,
  onComplete,
  destinationPlaceId,
  destinationName,
  startDate,
  endDate,
}: TripPersonalizationDialogProps) {
  const [step, setStep] = useState(1);

  // Step 1: Trip basics
  const [travelers, setTravelers] = useState(1);
  const [originCity, setOriginCity] = useState<OriginCityOption | null>(null);
  const [hasAccommodation, setHasAccommodation] = useState(false);
  const [accommodation, setAccommodation] = useState<AccommodationOption | null>(null);

  // Step 2: Arrival details
  const [arrivalTransportMode, setArrivalTransportMode] = useState<"plane" | "train" | "bus" | "car" | "unknown" | undefined>();
  const [arrivalTimeLocal, setArrivalTimeLocal] = useState("");

  // Step 3: Interests
  const [interests, setInterests] = useState<string[]>([]);

  const handleSkip = () => {
    const defaultPayload: TripPersonalizationPayload = {
      travelers: 1,
      hasAccommodation: false,
    };
    onComplete(defaultPayload);
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setTravelers(1);
    setOriginCity(null);
    setHasAccommodation(false);
    setAccommodation(null);
    setArrivalTransportMode(undefined);
    setArrivalTimeLocal("");
    setInterests([]);
    onClose();
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    const payload: TripPersonalizationPayload = {
      travelers: Math.max(1, travelers),
      originCityPlaceId: originCity?.placeId || null,
      originCityName: originCity?.name || null,
      hasAccommodation,
      accommodationPlaceId: hasAccommodation ? (accommodation?.placeId || null) : null,
      accommodationName: hasAccommodation ? (accommodation?.name || null) : null,
      accommodationAddress: hasAccommodation ? (accommodation?.address || null) : null,
      arrivalTransportMode: arrivalTransportMode || undefined,
      arrivalTimeLocal: arrivalTimeLocal || null,
      interests: interests.length > 0 ? interests : undefined,
    };
    onComplete(payload);
    handleClose();
  };

  const toggleInterest = (interestId: string) => {
    setInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const canProceed = () => {
    if (step === 1) {
      return travelers >= 1;
    }
    return true; // Steps 2 and 3 are optional
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Let's personalize your trip"}
            {step === 2 && "How and when are you arriving?"}
            {step === 3 && "What are you most interested in?"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "These details help us build a better itinerary."}
            {step === 2 && "Help us plan your first day more effectively."}
            {step === 3 && "We'll prioritize these when building your plan."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Step 1: Trip Basics */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Travelers */}
              <div className="space-y-2">
                <Label htmlFor="travelers">Number of travelers</Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setTravelers(Math.max(1, travelers - 1))}
                    disabled={travelers <= 1}
                  >
                    -
                  </Button>
                  <Input
                    id="travelers"
                    type="number"
                    min="1"
                    value={travelers}
                    onChange={(e) => setTravelers(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setTravelers(travelers + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Origin City */}
              <div className="space-y-2">
                <Label htmlFor="origin-city">Where are you traveling from?</Label>
                <OriginCityAutocomplete
                  value={originCity}
                  onChange={setOriginCity}
                  placeholder="City of departure (e.g. Malaga)"
                />
                <p className="text-xs text-muted-foreground">Optional, but helps us provide better recommendations</p>
              </div>

              {/* Accommodation */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-accommodation"
                    checked={hasAccommodation}
                    onCheckedChange={(checked) => {
                      setHasAccommodation(checked === true);
                      if (!checked) {
                        setAccommodation(null);
                      }
                    }}
                  />
                  <Label htmlFor="has-accommodation" className="cursor-pointer">
                    I don&apos;t have accommodation yet
                  </Label>
                </div>
                {!hasAccommodation && (
                  <div className="space-y-2">
                    <Label htmlFor="accommodation">
                      Accommodation in {destinationName}
                    </Label>
                    <AccommodationAutocomplete
                      value={accommodation}
                      onChange={setAccommodation}
                      placeholder="Search hotels or addresses..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Arrival Details */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Transport Mode */}
              <div className="space-y-3">
                <Label>How are you getting there?</Label>
                <div className="flex flex-wrap gap-2">
                  {TRANSPORT_MODES.map((mode) => (
                    <Button
                      key={mode.value}
                      type="button"
                      variant={arrivalTransportMode === mode.value ? "default" : "outline"}
                      onClick={() => setArrivalTransportMode(mode.value)}
                      className="rounded-full"
                    >
                      {mode.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Arrival Time */}
              <div className="space-y-2">
                <Label htmlFor="arrival-time">What time do you arrive?</Label>
                <Input
                  id="arrival-time"
                  type="time"
                  value={arrivalTimeLocal}
                  onChange={(e) => setArrivalTimeLocal(e.target.value)}
                  placeholder="e.g. 20:30"
                />
                <p className="text-xs text-muted-foreground">Optional - local time at destination</p>
              </div>
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {INTEREST_CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    type="button"
                    variant={interests.includes(category.id) ? "default" : "outline"}
                    onClick={() => toggleInterest(category.id)}
                    className={cn(
                      "rounded-full justify-start",
                      interests.includes(category.id) && "bg-primary text-primary-foreground"
                    )}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
          <div className="flex gap-2">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip personalization
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {step === 3 ? "Generate my itinerary" : "Next"}
              {step < 3 && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

