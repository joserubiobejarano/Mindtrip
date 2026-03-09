import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  buildCanonicalUrl,
  getLocalizedPath,
  isSupportedLocale,
  SUPPORTED_LOCALES,
} from "@/lib/seo/urls";
import { getMarketingCopy } from "@/lib/i18n/marketing";
import {
  countryHubs,
  getCountryBySlug,
  getCountryName,
  getCitiesForCountry,
} from "@/lib/seo/countries";
import { getCityItinerary } from "@/lib/itinerary/city-itineraries";
import type { ItineraryLocale } from "@/lib/i18n/itinerary";
import { StructuredData } from "@/components/seo/StructuredData";
import { getSiteUrl } from "@/lib/seo/site";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((lang) =>
    countryHubs.map((country) => ({
      lang,
      slug: lang === "es" ? country.slugEs : country.slugEn,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) return {};
  const country = getCountryBySlug(slug);
  if (!country) return {};
  const countryName = getCountryName(country, lang);
  const path = getLocalizedPath(`/countries/${slug}`, lang);
  const title =
    lang === "es"
      ? `Guías de viaje en ${countryName} – Kruno`
      : `Travel guides in ${countryName} – Kruno`;
  const description =
    lang === "es"
      ? `Explora guías de viaje por ciudad en ${countryName}. Planifica tu viaje con itinerarios día a día y consejos prácticos.`
      : `Explore city travel guides in ${countryName}. Plan your trip with day-by-day itineraries and practical tips.`;
  return buildMetadata({
    title,
    description,
    path,
    alternates: {
      canonical: buildCanonicalUrl(path),
      languages: {
        en: buildCanonicalUrl(getLocalizedPath(`/countries/${country.slugEn}`, "en")),
        es: buildCanonicalUrl(getLocalizedPath(`/countries/${country.slugEs}`, "es")),
        "x-default": buildCanonicalUrl(getLocalizedPath(`/countries/${country.slugEn}`, "en")),
      },
    },
    openGraphLocale: lang === "es" ? "es_ES" : "en_US",
    openGraphAlternateLocales: lang === "es" ? ["en_US"] : ["es_ES"],
  });
}

export default async function CountryHubPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) notFound();
  const country = getCountryBySlug(slug);
  if (!country) notFound();

  const copy = getMarketingCopy(lang);
  const siteUrl = getSiteUrl();
  const basePath = getLocalizedPath("", lang);
  const countryName = getCountryName(country, lang);
  const cities = getCitiesForCountry(country);
  const cityCards = cities.map((city) => {
    const itinerary = getCityItinerary(lang as ItineraryLocale, city.slug);
    return {
      ...city,
      name: itinerary?.city ?? city.name,
      days: itinerary?.days ?? city.days,
      description: itinerary?.hero.subtitle ?? city.description,
    };
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${countryName} city travel guides`,
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
      <StructuredData data={structuredData} id={`kruno-country-hub-${lang}`} />
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">
          {lang === "es" ? `Guías de viaje en ${countryName}` : `Travel guides in ${countryName}`}
        </h1>
        <p className="text-lg text-muted-foreground">
          {lang === "es" ? copy.countryHubIntro : copy.countryHubIntro}
        </p>
      </div>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {cityCards.map((city) => (
          <Link
            key={city.slug}
            href={`${basePath}/cities/${city.slug}`}
            className="rounded-2xl border-[3px] border-foreground p-6 hover:border-primary/60 transition-colors"
          >
            <h2 className="text-2xl font-semibold mt-2">
              {city.name} ·{" "}
              {lang === "es"
                ? `guía de ${city.days} días`
                : `${city.days}-day travel guide`}
            </h2>
            <p className="mt-3 text-muted-foreground">{city.description}</p>
            <div className="mt-4 text-sm text-primary">{copy.countryHubCityGuideLabel}</div>
          </Link>
        ))}
      </div>
      <div className="mt-12">
        <Link
          href={`${basePath}/cities`}
          className="text-primary font-medium hover:underline"
        >
          {copy.cityDetailBrowseAll}
        </Link>
      </div>
    </div>
  );
}
