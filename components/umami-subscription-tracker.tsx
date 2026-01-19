"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trackUmamiEvent } from "@/lib/analytics/umami";

const STORAGE_PREFIX = "kruno_umami_subscription_success";

export function UmamiSubscriptionTracker() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("session_id");

  useEffect(() => {
    if (!sessionId || typeof window === "undefined") return;

    try {
      const storageKey = `${STORAGE_PREFIX}:${sessionId}`;
      if (window.sessionStorage.getItem(storageKey) === "1") return;
      window.sessionStorage.setItem(storageKey, "1");
    } catch {
      // Ignore storage errors.
    }

    trackUmamiEvent("subscription_success", { source: "stripe_success" });
  }, [sessionId]);

  return null;
}
