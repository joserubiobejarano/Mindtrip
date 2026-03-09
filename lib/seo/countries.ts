import type { SupportedLocale } from "./urls";
import { cityPages } from "./cities";
import type { CitySeo } from "./cities";

export type CountryHub = {
  /** English slug (used in /en/countries/[slug]) */
  slugEn: string;
  /** Spanish slug (used in /es/countries/[slug]) */
  slugEs: string;
  /** English display name */
  nameEn: string;
  /** Spanish display name */
  nameEs: string;
  /** Country name in cityPages (for grouping cities) */
  countryName: string;
};

export const countryHubs: CountryHub[] = [
  { slugEn: "italy", slugEs: "italia", nameEn: "Italy", nameEs: "Italia", countryName: "Italy" },
  { slugEn: "spain", slugEs: "espana", nameEn: "Spain", nameEs: "España", countryName: "Spain" },
  { slugEn: "france", slugEs: "francia", nameEn: "France", nameEs: "Francia", countryName: "France" },
  { slugEn: "germany", slugEs: "alemania", nameEn: "Germany", nameEs: "Alemania", countryName: "Germany" },
  { slugEn: "portugal", slugEs: "portugal", nameEn: "Portugal", nameEs: "Portugal", countryName: "Portugal" },
];

/** Popular city slugs for homepage "Popular travel guides" section */
export const POPULAR_CITY_SLUGS = [
  "paris",
  "rome",
  "barcelona",
  "london",
  "amsterdam",
  "prague",
] as const;

export function getCountrySlug(country: CountryHub, locale: SupportedLocale): string {
  return locale === "es" ? country.slugEs : country.slugEn;
}

export function getCountryName(country: CountryHub, locale: SupportedLocale): string {
  return locale === "es" ? country.nameEs : country.nameEn;
}

export function getCountryBySlug(slug: string): CountryHub | undefined {
  return countryHubs.find(
    (c) => c.slugEn === slug || c.slugEs === slug
  );
}

export function getCitiesForCountry(country: CountryHub): CitySeo[] {
  return cityPages.filter((c) => c.country === country.countryName);
}
