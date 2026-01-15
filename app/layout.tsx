import type { Metadata } from "next";
import { Inter, Patrick_Hand } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-patrick-hand",
});

export const metadata: Metadata = {
  title: "Kruno - Travel Planner",
  description: "Plan your trips collaboratively",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // If no publishable key, render without Clerk (for build time)
  if (!publishableKey) {
    return (
      <html lang="en" className={patrickHand.variable}>
        <body className={inter.className}>
          <Providers>{children}</Providers>
          <CookieConsentBanner />
          {/* TODO: Load analytics scripts only if consent === 'all' */}
          {/* Example: {hasFullConsent() && <Script src="..." />} */}
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={patrickHand.variable}>
      <body className={inter.className}>
        <ClerkProvider publishableKey={publishableKey}>
          <Providers>{children}</Providers>
          <CookieConsentBanner />
          {/* TODO: Load analytics scripts only if consent === 'all' */}
          {/* Example: {hasFullConsent() && <Script src="..." />} */}
        </ClerkProvider>
      </body>
    </html>
  );
}

