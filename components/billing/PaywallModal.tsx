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
import { useLanguage } from "@/components/providers/language-provider";

export type PaywallModalProps = {
  open: boolean;
  onClose: () => void;
  tripId?: string;
};

const BENEFIT_KEYS = [
  "paywall_benefit_longer_trips",
  "paywall_benefit_swipe_limits",
  "paywall_benefit_multi_city",
  "paywall_benefit_advanced_filters",
  "paywall_benefit_regeneration_limits_alt",
  "paywall_benefit_unlimited_trips",
  "paywall_benefit_collaboration_alt",
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
  const { t } = useLanguage();

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
        title: t("paywall_error_checkout_title"),
        description: error.message || t("paywall_error_checkout_desc"),
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("paywall_modal_title")}</DialogTitle>
          <DialogDescription>
            {t("paywall_modal_subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Feature List */}
          <div className="space-y-2">
            {BENEFIT_KEYS.map((benefitKey, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{t(benefitKey as any)}</span>
              </div>
            ))}
          </div>

          {/* Pricing Selector */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">{t("paywall_modal_choose_plan")}</Label>
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
                  <div className="font-semibold">{t("paywall_modal_annual")}</div>
                  <div className="text-sm text-muted-foreground">
                    {t("paywall_modal_annual_desc")}
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
                    <div className="font-semibold">{t("paywall_modal_per_trip")}</div>
                    <div className="text-sm text-muted-foreground">
                      {t("paywall_modal_per_trip_desc")}
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
              {t("paywall_button_not_now")}
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
                  {t("paywall_loading")}
                </>
              ) : (
                t("paywall_button_continue")
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
