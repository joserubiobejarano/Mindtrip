import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { cityPages } from "@/lib/seo/cities";
import { StructuredData } from "@/components/seo/StructuredData";
import { getSiteUrl } from "@/lib/seo/site";
import { buildCanonicalUrl, buildLanguageAlternates, getLocalizedPath } from "@/lib/seo/urls";

export const metadata: Metadata = buildMetadata({
  title: "City Travel Guides – Kruno",
  description: "Browse smart city travel guides from Kruno.",
  path: "/cities",
  alternates: {
    canonical: buildCanonicalUrl(getLocalizedPath("/cities", "en")),
    languages: buildLanguageAlternates("/cities"),
  },
});

export default function CitiesPage() {
  const siteUrl = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "City travel guides",
    itemListElement: cityPages.map((city, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/cities/${city.slug}`,
      name: `${city.name} ${city.days}-day travel guide`,
    })),
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-16">
      <StructuredData data={structuredData} id="kruno-cities-list" />
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">City travel guides</h1>
        <p className="text-lg text-muted-foreground">
          Pick a city to explore a ready-to-use travel guide and plan faster with Kruno.
        </p>
      </div>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {cityPages.map((city) => (
          <Link
            key={city.slug}
            href={`/cities/${city.slug}`}
            className="rounded-2xl border-[3px] border-foreground p-6 hover:border-primary/60 transition-colors"
          >
            <div className="text-sm uppercase tracking-wide text-muted-foreground">
              {city.country}
            </div>
            <h2 className="text-2xl font-semibold mt-2">
              {city.name} · {city.days}-day travel guide
            </h2>
            <p className="mt-3 text-muted-foreground">{city.description}</p>
            <div className="mt-4 text-sm text-primary">View guide →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
