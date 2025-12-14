"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export type PaywallModalProps = {
  open: boolean;
  onClose: () => void;
  tripId?: string;
};

const BENEFITS = [
  "Longer trips (more than 14 days)",
  "Higher swipe limits (100 per trip vs 10 free)",
  "Multi-city itineraries",
  "Advanced Explore filters (budget & distance)",
  "Higher itinerary regeneration limits",
  "Unlimited active trips",
  "Future collaboration tools (polls, comments, shared editing)",
];

type PricingOption = "annual" | "per-trip";

export function PaywallModal({
  open,
  onClose,
  tripId,
}: PaywallModalProps) {
  const [selectedPricing, setSelectedPricing] = useState<PricingOption>("annual");
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  // Get current URL for returnUrl
  const getReturnUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return tripId ? `/trips/${tripId}` : "/settings";
  };

  const handleContinue = async () => {
    setIsLoading(true);
    const returnUrl = getReturnUrl();

    try {
      if (selectedPricing === "annual") {
        // Annual subscription checkout
        const response = await fetch("/api/billing/checkout/subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ returnUrl }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create checkout session");
        }

        const { url } = await response.json();
        if (url) {
          window.location.href = url;
        }
      } else {
        // Per-trip checkout
        if (!tripId) {
          throw new Error("Trip ID is required for per-trip unlock");
        }

        const response = await fetch("/api/billing/checkout/trip", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tripId, returnUrl }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create checkout session");
        }

        const { url } = await response.json();
        if (url) {
          window.location.href = url;
        }
      }
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      addToast({
        variant: "destructive",
        title: "Failed to start checkout",
        description: error.message || "Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Kruno Pro</DialogTitle>
          <DialogDescription>
            Unlock premium features and get the most out of your travel planning.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Feature List */}
          <div className="space-y-2">
            {BENEFITS.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Pricing Selector */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Choose your plan</Label>
            <RadioGroup
              value={selectedPricing}
              onValueChange={(value) => setSelectedPricing(value as PricingOption)}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="annual" id="annual" className="mt-1" />
                <Label
                  htmlFor="annual"
                  className="flex-1 cursor-pointer space-y-1"
                >
                  <div className="font-semibold">Annual</div>
                  <div className="text-sm text-muted-foreground">
                    $49.99/year - Unlock Pro features for all your trips
                  </div>
                </Label>
              </div>

              {tripId && (
                <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="per-trip" id="per-trip" className="mt-1" />
                  <Label
                    htmlFor="per-trip"
                    className="flex-1 cursor-pointer space-y-1"
                  >
                    <div className="font-semibold">Per trip</div>
                    <div className="text-sm text-muted-foreground">
                      $6.99 - Unlock Pro features for this trip only
                    </div>
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Not now
            </Button>
            <Button
              onClick={handleContinue}
              disabled={isLoading || (selectedPricing === "per-trip" && !tripId)}
              className="w-full sm:flex-1"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
