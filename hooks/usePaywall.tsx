"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { PaywallModal } from "@/components/billing/PaywallModal";

interface PaywallContextType {
  openPaywall: (options?: PaywallOptions) => void;
  closePaywall: () => void;
}

interface PaywallOptions {
  reason?: string;
  source?: string;
  tripId?: string;
}

interface PaywallState {
  isOpen: boolean;
  reason?: string;
  source?: string;
  tripId?: string;
}

const PaywallContext = createContext<PaywallContextType | undefined>(undefined);

export function PaywallProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PaywallState>({
    isOpen: false,
  });

  const openPaywall = useCallback((options?: PaywallOptions) => {
    const { reason, source, tripId } = options || {};
    
    setState({
      isOpen: true,
      reason,
      source,
      tripId,
    });

    // Log paywall opening
    console.log("[Paywall] Opened:", {
      source,
      reason,
      tripId,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const closePaywall = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  return (
    <PaywallContext.Provider value={{ openPaywall, closePaywall }}>
      {children}
      <PaywallModal
        open={state.isOpen}
        onClose={closePaywall}
        tripId={state.tripId}
      />
    </PaywallContext.Provider>
  );
}

export function usePaywall() {
  const context = useContext(PaywallContext);
  if (context === undefined) {
    throw new Error("usePaywall must be used within a PaywallProvider");
  }
  return context;
}
