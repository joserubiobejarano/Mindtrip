import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { cityPages } from "@/lib/seo/cities";
import { getCityItinerary } from "@/lib/itinerary/city-itineraries";
import type { ItineraryLocale } from "@/lib/i18n/itinerary";
import { StructuredData } from "@/components/seo/StructuredData";
import { getSiteUrl } from "@/lib/seo/site";
import {
  buildCanonicalUrl,
  buildLanguageAlternates,
  getLocalizedPath,
  isSupportedLocale,
} from "@/lib/seo/urls";
import { getMarketingCopy } from "@/lib/i18n/marketing";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) {
    return {};
  }
  const copy = getMarketingCopy(lang);
  const path = getLocalizedPath("/cities", lang);
  return buildMetadata({
    title: copy.citiesMetaTitle,
    description: copy.citiesMetaDescription,
    path,
    alternates: {
      canonical: buildCanonicalUrl(path),
      languages: buildLanguageAlternates("/cities"),
    },
    openGraphLocale: lang === "es" ? "es_ES" : "en_US",
    openGraphAlternateLocales: lang === "es" ? ["en_US"] : ["es_ES"],
  });
}

export default async function LocalizedCitiesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) {
    notFound();
  }
  const copy = getMarketingCopy(lang);
  const siteUrl = getSiteUrl();
  const basePath = getLocalizedPath("", lang);
  const cityCards = cityPages.map((city) => {
    const itinerary = lang === "es" ? getCityItinerary(lang as ItineraryLocale, city.slug) : undefined;
    return {
      ...city,
      name: itinerary?.city ?? city.name,
      country: itinerary?.country ?? city.country,
      days: itinerary?.days ?? city.days,
      description: itinerary?.hero.subtitle ?? city.description,
    };
  });
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: copy.citiesHubTitle,
    itemListElement: cityCards.map((city, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}${basePath}/cities/${city.slug}`,
      name:
        lang === "es"
          ? `Guía de ${city.name} en ${city.days} días`
          : `${city.name} ${city.days}-day travel guide`,
    })),
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-16">
      <StructuredData data={structuredData} id={`kruno-cities-list-${lang}`} />
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">{copy.citiesHubTitle}</h1>
        <p className="text-lg text-muted-foreground">{copy.citiesHubSubtitle}</p>
      </div>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {cityCards.map((city) => (
          <Link
            key={city.slug}
            href={`${basePath}/cities/${city.slug}`}
            className="rounded-2xl border-[3px] border-foreground p-6 hover:border-primary/60 transition-colors"
          >
            <div className="text-sm uppercase tracking-wide text-muted-foreground">
              {city.country}
            </div>
            <h2 className="text-2xl font-semibold mt-2">
              {city.name} ·{" "}
              {lang === "es"
                ? `guía de ${city.days} días`
                : `${city.days}-day travel guide`}
            </h2>
            <p className="mt-3 text-muted-foreground">{city.description}</p>
            <div className="mt-4 text-sm text-primary">{copy.cityCardCta}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
