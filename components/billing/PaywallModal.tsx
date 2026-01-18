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
import { Label } from "@/components/ui/label";
import { Loader2, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useLanguage } from "@/components/providers/language-provider";
import { getStoredCoupon } from "@/lib/attribution/client";

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

export function PaywallModal({
  open,
  onClose,
  tripId,
}: PaywallModalProps) {
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
    const couponCode = getStoredCoupon();

    try {
      const response = await fetch("/api/billing/checkout/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ returnUrl, couponCode: couponCode || undefined }),
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
            <div className="rounded-lg border p-4">
              <div className="font-semibold">{t("paywall_modal_annual")}</div>
              <div className="text-sm text-muted-foreground">
                {t("paywall_modal_annual_desc")}
              </div>
            </div>
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
              disabled={isLoading}
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
