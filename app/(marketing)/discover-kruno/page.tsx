import { Suspense } from "react";
import { DiscoverKrunoPage } from "@/components/landing/discover-kruno-page";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { buildCanonicalUrl, buildLanguageAlternates, getLocalizedPath } from "@/lib/seo/urls";

export const metadata: Metadata = buildMetadata({
  title: "Discover Kruno – AI Travel Planner",
  description: "Create a clear trip plan in minutes with Kruno's AI travel planner.",
  path: "/discover-kruno",
  alternates: {
    canonical: buildCanonicalUrl(getLocalizedPath("/discover-kruno", "en")),
    languages: buildLanguageAlternates("/discover-kruno"),
  },
});

export default function DiscoverKrunoRoute() {
  return (
    <Suspense fallback={null}>
      <DiscoverKrunoPage />
    </Suspense>
  );
}
