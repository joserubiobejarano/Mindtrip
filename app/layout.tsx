import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Inter, JetBrains_Mono, League_Spartan, Patrick_Hand, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { UmamiSubscriptionTracker } from "@/components/umami-subscription-tracker";
import { siteConfig, getSiteUrl } from "@/lib/seo/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-patrick-hand",
  display: "swap",
});
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-playfair-display",
  display: "swap",
});
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});
const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: ["900"],
  variable: "--font-league-spartan",
  display: "swap",
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

  return (
    <html
      lang="en"
      className={[
        patrickHand.variable,
        playfairDisplay.variable,
        jetBrainsMono.variable,
        leagueSpartan.variable,
      ].join(" ")}
    >
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

