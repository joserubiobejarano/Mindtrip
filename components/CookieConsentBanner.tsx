"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if consent has been given
    const consent = localStorage.getItem("kruno_cookie_consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = (consentType: "all" | "essential") => {
    localStorage.setItem("kruno_cookie_consent", consentType);
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg p-4 md:p-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-foreground">
            Kruno uses cookies to improve your experience. You can accept all cookies or keep only essential ones.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAccept("essential")}
            className="min-h-[44px] touch-manipulation"
          >
            Only essential
          </Button>
          <Button
            size="sm"
            onClick={() => handleAccept("all")}
            className="min-h-[44px] touch-manipulation"
          >
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
