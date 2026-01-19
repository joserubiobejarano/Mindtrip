import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Inter, Patrick_Hand } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { UmamiSubscriptionTracker } from "@/components/umami-subscription-tracker";
import { siteConfig, getSiteUrl } from "@/lib/seo/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-patrick-hand",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteConfig.title,
    template: "%s | Kruno",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: getSiteUrl(),
    siteName: siteConfig.name,
    type: "website",
    locale: "en_US",
    alternateLocale: ["es_ES"],
    images: [
      {
        url: "/itinerary-preview.svg",
        width: 1200,
        height: 630,
        alt: "Kruno trip itinerary preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/itinerary-preview.svg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const shouldLoadUmami =
    process.env.NODE_ENV === "production" && Boolean(umamiWebsiteId);
  const umamiScript = shouldLoadUmami ? (
    <Script
      src="https://cloud.umami.is/script.js"
      data-website-id={umamiWebsiteId}
      strategy="afterInteractive"
    />
  ) : null;

  // If no publishable key, render without Clerk (for build time)
  if (!publishableKey) {
    return (
      <html lang="en" className={patrickHand.variable}>
        <body className={inter.className}>
          <Providers>{children}</Providers>
          <Suspense fallback={null}>
            <UmamiSubscriptionTracker />
          </Suspense>
          <CookieConsentBanner />
          {/* TODO: Load analytics scripts only if consent === 'all' */}
          {/* Example: {hasFullConsent() && <Script src="..." />} */}
          {umamiScript}
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={patrickHand.variable}>
      <body className={inter.className}>
        <ClerkProvider publishableKey={publishableKey}>
          <Providers>{children}</Providers>
          <Suspense fallback={null}>
            <UmamiSubscriptionTracker />
          </Suspense>
          <CookieConsentBanner />
          {/* TODO: Load analytics scripts only if consent === 'all' */}
          {/* Example: {hasFullConsent() && <Script src="..." />} */}
          {umamiScript}
        </ClerkProvider>
      </body>
    </html>
  );
}

