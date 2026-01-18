import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { influencerPages, getInfluencerBySlug } from "@/lib/seo/influencers";
import { StructuredData } from "@/components/seo/StructuredData";
import { getSiteUrl } from "@/lib/seo/site";
import { buildCanonicalUrl, buildLanguageAlternates, getLocalizedPath } from "@/lib/seo/urls";

export function generateStaticParams() {
  return influencerPages.map((influencer) => ({ slug: influencer.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const influencer = getInfluencerBySlug(slug);
  if (!influencer) {
    const canonicalPath = getLocalizedPath(`/influencers/${slug}`, "en");
    return buildMetadata({
      title: "Influencer Itineraries – Kruno",
      description: "Discover travel itineraries curated by creators on Kruno.",
      path: `/influencers/${slug}`,
      alternates: {
        canonical: buildCanonicalUrl(canonicalPath),
        languages: buildLanguageAlternates(`/influencers/${slug}`),
      },
    });
  }

  const canonicalPath = getLocalizedPath(`/influencers/${influencer.slug}`, "en");
  return buildMetadata({
    title: `${influencer.name} Travel Itineraries | Kruno`,
    description: influencer.description,
    path: `/influencers/${influencer.slug}`,
    alternates: {
      canonical: buildCanonicalUrl(canonicalPath),
      languages: buildLanguageAlternates(`/influencers/${influencer.slug}`),
    },
  });
}

export default async function InfluencerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const influencer = getInfluencerBySlug(slug);
  if (!influencer) {
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
          name: "Influencer itineraries",
          item: `${siteUrl}/influencers`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: influencer.name,
          item: `${siteUrl}/influencers/${influencer.slug}`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      name: `${influencer.name} travel profile`,
      description: influencer.description,
      mainEntity: {
        "@type": "Person",
        name: influencer.name,
        description: influencer.niche,
        url: `${siteUrl}/influencers/${influencer.slug}`,
        sameAs: influencer.profileUrl ? [influencer.profileUrl] : undefined,
      },
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-10">
      <StructuredData data={structuredData} id="kruno-influencer-ld" />
      <div className="space-y-4">
        <div className="text-sm uppercase tracking-wide text-muted-foreground">
          {influencer.niche}
        </div>
        <h1 className="text-4xl font-bold">{influencer.name}</h1>
        <p className="text-lg text-muted-foreground">{influencer.description}</p>
        <p className="text-sm text-muted-foreground">
          Focus area: {influencer.locationFocus}
        </p>
      </div>
      <div className="rounded-2xl border border-border/40 p-6 bg-background">
        <h2 className="text-xl font-semibold">Plan a trip with this style</h2>
        <p className="mt-2 text-muted-foreground">
          Use this creator-inspired style to build a custom itinerary with Kruno&apos;s AI planner.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
          >
            Start planning
          </Link>
          <Link
            href="/influencers"
            className="inline-flex items-center rounded-full border border-border px-6 py-2 text-sm font-medium"
          >
            Browse all creators
          </Link>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold">More creators</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {influencerPages
            .filter((other) => other.slug !== influencer.slug)
            .map((other) => (
              <Link
                key={other.slug}
                href={`/influencers/${other.slug}`}
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
