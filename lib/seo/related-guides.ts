import type { CitySeo } from "./cities";
import { cityPages } from "./cities";
import type { RelatedItinerary } from "@/lib/itinerary/city-itineraries";
import type { ItineraryLocale } from "@/lib/i18n/itinerary";
import { POPULAR_CITY_SLUGS } from "./countries";
import { getCityItinerary } from "@/lib/itinerary/city-itineraries";

/**
 * Deterministically derive up to 6 related guides for a city.
 * Strategy: 2 same-country, 2 popular cities, 2 broader alternatives.
 * Preserves existing itinerary-related items when valid, then fills gaps.
 */
export function getRelatedGuides(
  city: CitySeo,
  locale: ItineraryLocale,
  existing: RelatedItinerary[]
): RelatedItinerary[] {
  const validSlugs = new Set<string>();
  const result: RelatedItinerary[] = [];

  const isValid = (slug: string) => {
    if (slug === city.slug || validSlugs.has(slug)) return false;
    const other = getCityItinerary(locale, slug);
    return !!other;
  };

  const toRelated = (slug: string): RelatedItinerary | null => {
    const itinerary = getCityItinerary(locale, slug);
    if (!itinerary) return null;
    return {
      slug: itinerary.slug,
      city: itinerary.city,
      days: itinerary.days,
      description: itinerary.hero.subtitle ?? "",
    };
  };

  // 1. Keep existing related (up to 6, valid only)
  for (const item of existing) {
    if (result.length >= 6) break;
    if (item.slug && isValid(item.slug)) {
      const r = toRelated(item.slug);
      if (r) {
        result.push(r);
        validSlugs.add(item.slug);
      }
    }
  }

  // 2. Same-country
  const sameCountry = city.country;
  const allCities = getCitiesByCountry(sameCountry);
  for (const c of allCities) {
    if (result.length >= 6) break;
    if (isValid(c.slug)) {
      const r = toRelated(c.slug);
      if (r) {
        result.push(r);
        validSlugs.add(c.slug);
      }
    }
  }

  // 3. Popular cities
  for (const slug of POPULAR_CITY_SLUGS) {
    if (result.length >= 6) break;
    if (isValid(slug)) {
      const r = toRelated(slug);
      if (r) {
        result.push(r);
        validSlugs.add(slug);
      }
    }
  }

  // 4. Broader alternatives (any remaining valid city)
  const remaining = getAllCitySlugs().filter(
    (s) => s !== city.slug && isValid(s)
  );
  for (const slug of remaining) {
    if (result.length >= 6) break;
    const r = toRelated(slug);
    if (r) {
      result.push(r);
      validSlugs.add(slug);
    }
  }

  return result;
}

/** Get city slugs for a country */
function getCitiesByCountry(country: string): CitySeo[] {
  return cityPages.filter((c) => c.country === country);
}

/** Get all city slugs */
function getAllCitySlugs(): string[] {
  return cityPages.map((c) => c.slug);
}
