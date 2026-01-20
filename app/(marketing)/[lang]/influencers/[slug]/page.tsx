import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { influencerPages, getInfluencerBySlug } from "@/lib/seo/influencers";
import { StructuredData } from "@/components/seo/StructuredData";
import { getSiteUrl } from "@/lib/seo/site";
import {
  buildCanonicalUrl,
  buildLanguageAlternates,
  getLocalizedPath,
  isSupportedLocale,
  SUPPORTED_LOCALES,
} from "@/lib/seo/urls";
import { getMarketingCopy } from "@/lib/i18n/marketing";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((lang) =>
    influencerPages.map((influencer) => ({ lang, slug: influencer.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) {
    return {};
  }
  const influencer = getInfluencerBySlug(slug);
  const path = getLocalizedPath(`/influencers/${slug}`, lang);
  const copy = getMarketingCopy(lang);
  if (!influencer) {
    return buildMetadata({
      title: copy.influencersMetaTitle,
      description: copy.influencersMetaDescription,
      path,
      alternates: {
        canonical: buildCanonicalUrl(path),
        languages: buildLanguageAlternates(`/influencers/${slug}`),
      },
      openGraphLocale: lang === "es" ? "es_ES" : "en_US",
      openGraphAlternateLocales: lang === "es" ? ["en_US"] : ["es_ES"],
    });
  }

  const title =
    lang === "es"
      ? `Guías de viaje de ${influencer.name} | Kruno`
      : `${influencer.name} Travel Guides | Kruno`;

  return buildMetadata({
    title,
    description: influencer.description,
    path,
    alternates: {
      canonical: buildCanonicalUrl(path),
      languages: buildLanguageAlternates(`/influencers/${influencer.slug}`),
    },
    openGraphLocale: lang === "es" ? "es_ES" : "en_US",
    openGraphAlternateLocales: lang === "es" ? ["en_US"] : ["es_ES"],
  });
}

export default async function LocalizedInfluencerPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) {
    notFound();
  }
  const influencer = getInfluencerBySlug(slug);
  if (!influencer) {
    notFound();
  }

  const copy = getMarketingCopy(lang);
  const siteUrl = getSiteUrl();
  const basePath = getLocalizedPath("", lang);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${siteUrl}${basePath}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: copy.influencersHubTitle,
          item: `${siteUrl}${basePath}/influencers`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: influencer.name,
          item: `${siteUrl}${basePath}/influencers/${influencer.slug}`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      name:
        lang === "es"
          ? `Perfil de viaje de ${influencer.name}`
          : `${influencer.name} travel profile`,
      description: influencer.description,
      mainEntity: {
        "@type": "Person",
        name: influencer.name,
        description: influencer.niche,
        url: `${siteUrl}${basePath}/influencers/${influencer.slug}`,
        sameAs: influencer.profileUrl ? [influencer.profileUrl] : undefined,
      },
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-10">
      <StructuredData data={structuredData} id={`kruno-influencer-ld-${lang}`} />
      <div className="space-y-4">
        <div className="text-sm uppercase tracking-wide text-muted-foreground">
          {influencer.niche}
        </div>
        <h1 className="text-4xl font-bold">{influencer.name}</h1>
        <p className="text-lg text-muted-foreground">{influencer.description}</p>
        <p className="text-sm text-muted-foreground">
          {copy.influencerDetailFocusLabel} {influencer.locationFocus}
        </p>
      </div>
      <div className="rounded-2xl border border-border/40 p-6 bg-background">
        <h2 className="text-xl font-semibold">{copy.influencerDetailPlanTitle}</h2>
        <p className="mt-2 text-muted-foreground">{copy.influencerDetailPlanBody}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={basePath || "/"}
            className="inline-flex items-center rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
          >
            {copy.influencerDetailPlanCta}
          </Link>
          <Link
            href={`${basePath}/influencers`}
            className="inline-flex items-center rounded-full border border-border px-6 py-2 text-sm font-medium"
          >
            {copy.influencerDetailBrowseAll}
          </Link>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold">{copy.influencerDetailMore}</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {influencerPages
            .filter((other) => other.slug !== influencer.slug)
            .map((other) => (
              <Link key={other.slug} href={`${basePath}/influencers/${other.slug}`} className="text-sm text-primary">
                {other.name}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
