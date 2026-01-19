"use client";

import { useEffect, useRef, useState } from "react";
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
import { useLanguage } from "@/components/providers/language-provider";
import { getStoredCoupon } from "@/lib/attribution/client";
import { trackUmamiEvent } from "@/lib/analytics/umami";

export type ProPaywallModalProps = {
  open: boolean;
  onClose: () => void;
  tripId?: string;
  context?: string;
};

const CONTEXT_KEYS: Record<string, string> = {
  "multi-city": "paywall_context_multi_city",
  "swipes": "paywall_context_swipes",
  "filters": "paywall_context_filters",
  "trip-limit": "paywall_context_trip_limit",
  "trip-duration": "paywall_context_trip_duration",
};

const BENEFIT_KEYS = [
  "paywall_benefit_longer_trips",
  "paywall_benefit_swipe_limits",
  "paywall_benefit_multi_city",
  "paywall_benefit_advanced_filters",
  "paywall_benefit_regeneration_limits",
  "paywall_benefit_unlimited_trips",
  "paywall_benefit_collaboration",
];

export function ProPaywallModal({
  open,
  onClose,
  context,
}: ProPaywallModalProps) {
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const { addToast } = useToast();
  const { t } = useLanguage();
  const wasOpenRef = useRef(false);

  const subtitle = context && CONTEXT_KEYS[context]
    ? t(CONTEXT_KEYS[context] as any)
    : t("paywall_default_subtitle");

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      trackUmamiEvent("upgrade_clicked", {
        source: "pro_paywall_modal",
        context,
      });
    }
    wasOpenRef.current = open;
  }, [open, context]);

  const handleSubscriptionCheckout = async () => {
    setIsLoadingSubscription(true);
    try {
      const couponCode = getStoredCoupon();
      const body = couponCode ? { couponCode } : {};
      const response = await fetch("/api/billing/checkout/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout session");
      }

      const { url } = await response.json();
      if (url) {
        trackUmamiEvent("checkout_started", { source: "pro_paywall_modal", context });
        window.location.href = url;
      }
    } catch (error: any) {
      console.error("Error creating subscription checkout:", error);
      addToast({
        variant: "destructive",
        title: t("paywall_error_checkout_title"),
        description: error.message || t("paywall_error_checkout_desc"),
      });
      setIsLoadingSubscription(false);
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
        title: t("paywall_error_portal_title"),
        description: error.message || t("paywall_error_portal_desc"),
      });
      setIsLoadingPortal(false);
    }
  };

  const isLoading = isLoadingSubscription || isLoadingPortal;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("paywall_title")}</DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Benefits List */}
          <div className="space-y-2">
            {BENEFIT_KEYS.map((benefitKey, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{t(benefitKey as any)}</span>
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
                  {t("paywall_loading")}
                </>
              ) : (
                t("paywall_button_upgrade")
              )}
            </Button>
          </div>

          {/* Manage Subscription Link */}
          <div className="pt-2 border-t">
            <button
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="text-sm text-muted-foreground hover:text-foreground underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingPortal ? t("paywall_loading") : t("paywall_button_manage_subscription")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
