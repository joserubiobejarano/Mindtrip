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
import { useLanguage } from "@/components/providers/language-provider";

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
  const { t } = useLanguage();

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
      alert(t("paywall_error_checkout_title") + ": " + t("paywall_error_checkout_desc"));
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
      alert(t("paywall_error_checkout_title") + ": " + t("paywall_error_checkout_desc"));
      setIsLoadingTrip(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("paywall_dialog_upgrade_title").replace("{featureName}", featureName)}</DialogTitle>
          <DialogDescription>
            {message || t("paywall_dialog_default_message").replace("{featureName}", featureName)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {tripId && (
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold">{t("paywall_dialog_unlock_trip_title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("paywall_dialog_unlock_trip_desc")}
              </p>
              <p className="text-lg font-bold">{t("paywall_dialog_unlock_trip_price")}</p>
              <Button
                onClick={handleTripUnlock}
                disabled={isLoadingTrip || isLoadingSubscription}
                className="w-full"
              >
                {isLoadingTrip ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("paywall_loading")}
                  </>
                ) : (
                  t("paywall_dialog_unlock_trip_button")
                )}
              </Button>
            </div>
          )}

          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">{t("paywall_dialog_pro_yearly_title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("paywall_dialog_pro_yearly_desc")}
            </p>
            <p className="text-lg font-bold">{t("paywall_dialog_pro_yearly_price")}</p>
            <Button
              onClick={handleSubscriptionCheckout}
              disabled={isLoadingTrip || isLoadingSubscription}
              variant="default"
              className="w-full"
            >
              {isLoadingSubscription ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("paywall_loading")}
                </>
              ) : (
                t("paywall_dialog_pro_button")
              )}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("paywall_dialog_cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
