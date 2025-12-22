"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { PaywallProvider } from "@/hooks/usePaywall";
import { LanguageProvider } from "@/components/providers/language-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <PaywallProvider>{children}</PaywallProvider>
        </ToastProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

