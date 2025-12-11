"use client";

import { useState, useEffect } from "react";
import { getCookieConsent } from "@/lib/utils/cookie-consent";

/**
 * React hook to get and track cookie consent status
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState<"all" | "essential" | null>(null);

  useEffect(() => {
    // Set initial value
    setConsent(getCookieConsent());

    // Listen for storage changes (in case consent is updated in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "kruno_cookie_consent") {
        setConsent(getCookieConsent());
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events (for same-tab updates)
    const handleCustomStorageChange = () => {
      setConsent(getCookieConsent());
    };

    window.addEventListener("cookieConsentChanged", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cookieConsentChanged", handleCustomStorageChange);
    };
  }, []);

  return {
    consent,
    hasFullConsent: consent === "all",
    hasEssentialConsent: consent === "essential",
    hasAnyConsent: consent !== null,
  };
}
