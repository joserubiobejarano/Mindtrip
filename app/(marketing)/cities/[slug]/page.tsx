import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { cityPages, getCityBySlug } from "@/lib/seo/cities";
import { StructuredData } from "@/components/seo/StructuredData";
import { getSiteUrl } from "@/lib/seo/site";
import { buildCanonicalUrl, buildLanguageAlternates, getLocalizedPath } from "@/lib/seo/urls";

export function generateStaticParams() {
  return cityPages.map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) {
    const canonicalPath = getLocalizedPath(`/cities/${slug}`, "en");
    return buildMetadata({
      title: "City Itinerary – Kruno",
      description: "Browse AI-generated city itineraries from Kruno.",
      path: `/cities/${slug}`,
      alternates: {
        canonical: buildCanonicalUrl(canonicalPath),
        languages: buildLanguageAlternates(`/cities/${slug}`),
      },
    });
  }

  const canonicalPath = getLocalizedPath(`/cities/${city.slug}`, "en");
  return buildMetadata({
    title: `${city.name} ${city.days}-Day Itinerary | Kruno`,
    description: city.description,
    path: `/cities/${city.slug}`,
    alternates: {
      canonical: buildCanonicalUrl(canonicalPath),
      languages: buildLanguageAlternates(`/cities/${city.slug}`),
    },
  });
}

export default async function CityItineraryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "City itineraries",
          item: `${siteUrl}/cities`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `${city.name} itinerary`,
          item: `${siteUrl}/cities/${city.slug}`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: `${city.name} ${city.days}-day itinerary`,
      description: city.description,
      touristType: "Leisure",
      itinerary: {
        "@type": "ItemList",
        itemListElement: city.highlights.map((highlight, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: highlight,
        })),
      },
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-10">
      <StructuredData data={structuredData} id="kruno-city-ld" />
      <div className="space-y-4">
        <div className="text-sm uppercase tracking-wide text-muted-foreground">
          {city.country}
        </div>
        <h1 className="text-4xl font-bold">
          {city.name} {city.days}-day itinerary
        </h1>
        <p className="text-lg text-muted-foreground">{city.description}</p>
      </div>
      <div>
        <h2 className="text-2xl font-semibold">Top highlights</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {city.highlights.map((highlight) => (
            <li key={highlight} className="rounded-xl border border-border/40 p-4">
              {highlight}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-border/40 p-6 bg-background">
        <h3 className="text-xl font-semibold">Plan this trip in Kruno</h3>
        <p className="mt-2 text-muted-foreground">
          Turn this outline into a personalized plan with dates, preferences, and AI recommendations.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
          >
            Start planning
          </Link>
          <Link
            href="/cities"
            className="inline-flex items-center rounded-full border border-border px-6 py-2 text-sm font-medium"
          >
            Browse all cities
          </Link>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold">Explore more cities</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {cityPages
            .filter((other) => other.slug !== city.slug)
            .map((other) => (
              <Link
                key={other.slug}
                href={`/cities/${other.slug}`}
                className="text-sm text-primary"
              >
                {other.name}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
