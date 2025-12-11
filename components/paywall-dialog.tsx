"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PaywallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId?: string;
  featureName?: string;
  message?: string;
}

export function PaywallDialog({
  open,
  onOpenChange,
  tripId,
  featureName = "this feature",
  message,
}: PaywallDialogProps) {
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [isLoadingTrip, setIsLoadingTrip] = useState(false);

  const handleSubscriptionCheckout = async () => {
    if (!tripId) return;
    
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
    } catch (error) {
      console.error("Error creating subscription checkout:", error);
      alert("Failed to start checkout. Please try again.");
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
    } catch (error) {
      console.error("Error creating trip unlock checkout:", error);
      alert("Failed to start checkout. Please try again.");
      setIsLoadingTrip(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade to Unlock {featureName}</DialogTitle>
          <DialogDescription>
            {message || `You need Kruno Pro to use ${featureName}. Choose an option below:`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {tripId && (
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold">Unlock This Trip</h3>
              <p className="text-sm text-muted-foreground">
                Unlock Pro features for this trip only
              </p>
              <p className="text-lg font-bold">$6.99</p>
              <Button
                onClick={handleTripUnlock}
                disabled={isLoadingTrip || isLoadingSubscription}
                className="w-full"
              >
                {isLoadingTrip ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Unlock This Trip"
                )}
              </Button>
            </div>
          )}

          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">Kruno Pro (Yearly)</h3>
            <p className="text-sm text-muted-foreground">
              Unlock Pro features for all your trips
            </p>
            <p className="text-lg font-bold">$49.99/year</p>
            <Button
              onClick={handleSubscriptionCheckout}
              disabled={isLoadingTrip || isLoadingSubscription}
              variant="default"
              className="w-full"
            >
              {isLoadingSubscription ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Get Kruno Pro"
              )}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
