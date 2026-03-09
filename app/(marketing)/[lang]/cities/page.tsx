import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { cityPages } from "@/lib/seo/cities";
import { countryHubs, getCountrySlug, getCountryName, getCitiesForCountry } from "@/lib/seo/countries";
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
import type { SupportedLocale } from "@/lib/seo/urls";
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

  const loc = lang as SupportedLocale;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-16">
      <StructuredData data={structuredData} id={`kruno-cities-list-${lang}`} />
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">{copy.citiesHubTitle}</h1>
        <p className="text-lg text-muted-foreground">{copy.citiesHubSubtitle}</p>
      </div>

      {/* Country index block */}
      <div className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold">{copy.citiesHubBrowseByCountry}</h2>
        <div className="flex flex-wrap gap-3">
          {countryHubs.map((country) => (
            <Link
              key={country.slugEn}
              href={`${basePath}/countries/${getCountrySlug(country, loc)}`}
              className="rounded-full border border-border/60 px-4 py-2 text-sm hover:border-primary/60 transition-colors"
            >
              {getCountryName(country, loc)}
            </Link>
          ))}
        </div>
      </div>

      {/* Grouped city sections by country */}
      <div className="mt-12 space-y-10">
        {countryHubs.map((country) => {
          const countryCities = getCitiesForCountry(country);
          if (countryCities.length === 0) return null;
          const cards = countryCities.map((city) => {
            const itinerary = lang === "es" ? getCityItinerary(lang as ItineraryLocale, city.slug) : getCityItinerary("en", city.slug);
            return {
              ...city,
              name: itinerary?.city ?? city.name,
              country: itinerary?.country ?? city.country,
              days: itinerary?.days ?? city.days,
              description: itinerary?.hero.subtitle ?? city.description,
            };
          });
          return (
            <section key={country.slugEn}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-semibold">{getCountryName(country, loc)}</h2>
                <Link
                  href={`${basePath}/countries/${getCountrySlug(country, loc)}`}
                  className="text-sm text-primary hover:underline"
                >
                  {copy.cityCardCta}
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((city) => (
                  <Link
                    key={city.slug}
                    href={`${basePath}/cities/${city.slug}`}
                    className="rounded-2xl border-[3px] border-foreground p-6 hover:border-primary/60 transition-colors"
                  >
                    <h3 className="text-2xl font-semibold mt-2">
                      {city.name} ·{" "}
                      {lang === "es"
                        ? `guía de ${city.days} días`
                        : `${city.days}-day travel guide`}
                    </h3>
                    <p className="mt-3 text-muted-foreground">{city.description}</p>
                    <div className="mt-4 text-sm text-primary">{copy.cityCardCta}</div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* Cities in countries not in countryHubs (e.g. UK, Greece, etc.) */}
        {(() => {
          const hubCountryNames = new Set(countryHubs.map((c) => c.countryName));
          const otherCities = cityCards.filter((c) => !hubCountryNames.has(c.country));
          if (otherCities.length === 0) return null;
          const byCountry = otherCities.reduce<Record<string, typeof otherCities>>((acc, c) => {
            if (!acc[c.country]) acc[c.country] = [];
            acc[c.country].push(c);
            return acc;
          }, {});
          return Object.entries(byCountry).map(([countryName, cities]) => (
            <section key={countryName}>
              <h2 className="text-2xl font-semibold mb-4">{countryName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`${basePath}/cities/${city.slug}`}
                    className="rounded-2xl border-[3px] border-foreground p-6 hover:border-primary/60 transition-colors"
                  >
                    <h3 className="text-2xl font-semibold mt-2">
                      {city.name} ·{" "}
                      {lang === "es"
                        ? `guía de ${city.days} días`
                        : `${city.days}-day travel guide`}
                    </h3>
                    <p className="mt-3 text-muted-foreground">{city.description}</p>
                    <div className="mt-4 text-sm text-primary">{copy.cityCardCta}</div>
                  </Link>
                ))}
              </div>
            </section>
          ));
        })()}
      </div>
    </div>
  );
}
