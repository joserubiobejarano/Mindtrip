import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { influencerPages } from "@/lib/seo/influencers";
import { StructuredData } from "@/components/seo/StructuredData";
import { getSiteUrl } from "@/lib/seo/site";
import { buildCanonicalUrl, buildLanguageAlternates, getLocalizedPath } from "@/lib/seo/urls";

export const metadata: Metadata = buildMetadata({
  title: "Influencer Itineraries – Kruno",
  description: "Discover travel itineraries curated by influencers and creators on Kruno.",
  path: "/influencers",
  alternates: {
    canonical: buildCanonicalUrl(getLocalizedPath("/influencers", "en")),
    languages: buildLanguageAlternates("/influencers"),
  },
});

export default function InfluencersPage() {
  const siteUrl = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Influencer itineraries",
    itemListElement: influencerPages.map((influencer, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/influencers/${influencer.slug}`,
      name: influencer.name,
    })),
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <StructuredData data={structuredData} id="kruno-influencers-list" />
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Influencer itineraries</h1>
        <p className="text-lg text-muted-foreground">
          Hand-picked itinerary frameworks and travel styles from creators you can trust.
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {influencerPages.map((influencer) => (
          <Link
            key={influencer.slug}
            href={`/influencers/${influencer.slug}`}
            className="rounded-2xl border border-border/40 p-6 hover:border-primary/60 transition-colors"
          >
            <div className="text-sm uppercase tracking-wide text-muted-foreground">
              {influencer.niche}
            </div>
            <h2 className="text-2xl font-semibold mt-2">
              {influencer.name}
            </h2>
            <p className="mt-3 text-muted-foreground">{influencer.description}</p>
            <div className="mt-4 text-sm text-primary">View profile →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
