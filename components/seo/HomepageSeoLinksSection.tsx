import Link from "next/link";
import { getLocalizedPath } from "@/lib/seo/urls";
import { getMarketingCopy } from "@/lib/i18n/marketing";
import { getCityBySlug } from "@/lib/seo/cities";
import {
  countryHubs,
  POPULAR_CITY_SLUGS,
  getCountrySlug,
  getCountryName,
} from "@/lib/seo/countries";
import type { SupportedLocale } from "@/lib/seo/urls";

type HomepageSeoLinksSectionProps = {
  lang: SupportedLocale;
};

const pillLinkClass =
  "rounded-full border border-border/60 bg-white px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-primary/60 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2";

const ctaLinkClass =
  "inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-md";

export function HomepageSeoLinksSection({ lang }: HomepageSeoLinksSectionProps) {
  const copy = getMarketingCopy(lang);
  const basePath = getLocalizedPath("", lang);

  const popularCities = POPULAR_CITY_SLUGS.map((slug) => getCityBySlug(slug)).filter(
    (city): city is NonNullable<typeof city> => city != null
  );

  return (
    <section
      className="py-20 px-6"
      style={{ backgroundColor: "hsl(var(--cream))" }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Popular travel guides */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 transition-shadow duration-300 hover:shadow-md">
          <div className="space-y-3 mb-5">
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "'Patrick Hand', cursive" }}
            >
              {copy.popularTravelGuidesTitle}
            </h2>
            <p className="text-muted-foreground">
              {copy.popularTravelGuidesSubtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {popularCities.map((city) => (
              <Link
                key={city.slug}
                href={`${basePath}/cities/${city.slug}`}
                className={pillLinkClass}
              >
                {city.name}
              </Link>
            ))}
            <Link href={`${basePath}/cities`} className={ctaLinkClass}>
              {copy.exploreCitiesCta}
            </Link>
          </div>
        </div>

        {/* Browse by country */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 transition-shadow duration-300 hover:shadow-md">
          <div className="space-y-3 mb-5">
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "'Patrick Hand', cursive" }}
            >
              {copy.browseByCountryTitle}
            </h2>
            <p className="text-muted-foreground">
              {copy.browseByCountrySubtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {countryHubs.map((country) => (
              <Link
                key={country.slugEn}
                href={`${basePath}/countries/${getCountrySlug(country, lang)}`}
                className={pillLinkClass}
              >
                {getCountryName(country, lang)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
