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
import { Loader2, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export type ProPaywallModalProps = {
  open: boolean;
  onClose: () => void;
  tripId?: string;
  context?: string;
};

const CONTEXT_MESSAGES: Record<string, string> = {
  "multi-city": "Multi-city trips are a Pro feature.",
  "swipes": "You've reached the swipe limit. Upgrade to continue discovering more places.",
  "filters": "Advanced filters (budget & distance) are a Pro feature.",
};

const BENEFITS = [
  "Longer trips (more than 14 days)",
  "Higher swipe limits (100 per trip vs 10 free)",
  "Multi-city itineraries",
  "Advanced Explore filters (budget & distance)",
  "Higher regeneration limits",
  "Unlimited active trips",
  "Future collaboration features (polls, comments, etc.)",
];

export function ProPaywallModal({
  open,
  onClose,
  tripId,
  context,
}: ProPaywallModalProps) {
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [isLoadingTrip, setIsLoadingTrip] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const { addToast } = useToast();

  const subtitle = context && CONTEXT_MESSAGES[context]
    ? CONTEXT_MESSAGES[context]
    : "Upgrade to unlock premium features and get the most out of Kruno.";

  const handleSubscriptionCheckout = async () => {
    setIsLoadingSubscription(true);
    try {
      const response = await fetch("/api/billing/checkout/subscription", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout session");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error("Error creating subscription checkout:", error);
      addToast({
        variant: "destructive",
        title: "Failed to start checkout",
        description: error.message || "Please try again.",
      });
      setIsLoadingSubscription(false);
    }
  };

  const handleTripUnlock = async () => {
    if (!tripId) return;

    setIsLoadingTrip(true);
    try {
      const response = await fetch("/api/billing/checkout/trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tripId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout session");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error("Error creating trip unlock checkout:", error);
      addToast({
        variant: "destructive",
        title: "Failed to start checkout",
        description: error.message || "Please try again.",
      });
      setIsLoadingTrip(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to open billing portal");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error("Error opening billing portal:", error);
      addToast({
        variant: "destructive",
        title: "Failed to open billing portal",
        description: error.message || "Please try again.",
      });
      setIsLoadingPortal(false);
    }
  };

  const isLoading = isLoadingSubscription || isLoadingTrip || isLoadingPortal;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Unlock Kruno Pro</DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Benefits List */}
          <div className="space-y-2">
            {BENEFITS.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSubscriptionCheckout}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoadingSubscription ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Upgrade to Kruno Pro"
              )}
            </Button>

            {tripId && (
              <Button
                onClick={handleTripUnlock}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoadingTrip ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Unlock this trip only"
                )}
              </Button>
            )}
          </div>

          {/* Manage Subscription Link */}
          <div className="pt-2 border-t">
            <button
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="text-sm text-muted-foreground hover:text-foreground underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingPortal ? "Loading..." : "Manage existing subscription"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
