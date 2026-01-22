import { getSiteUrl } from "./site";

const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "igshid",
  "mc_cid",
  "mc_eid",
  "msclkid",
]);

type SearchParams = Record<string, string | string[] | undefined>;

export const SUPPORTED_LOCALES = ["en", "es"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(value: string): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale);
}

export function getLocalizedPath(pathname: string, locale: SupportedLocale): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (normalized === "/") {
    return `/${locale}`;
  }
  return `/${locale}${normalized}`;
}

export function buildLanguageAlternates(pathname: string): Record<string, string> {
  return {
    en: buildCanonicalUrl(getLocalizedPath(pathname, "en")),
    es: buildCanonicalUrl(getLocalizedPath(pathname, "es")),
    "x-default": buildCanonicalUrl(getLocalizedPath(pathname, "en")),
  };
}

function normalizeParamValue(value: string | string[] | undefined): string | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
}

export function buildCanonicalUrl(
  pathname: string,
  searchParams?: SearchParams,
  allowParams: string[] = []
): string {
  const url = new URL(pathname, getSiteUrl());
  if (!searchParams) return url.toString();

  for (const [key, value] of Object.entries(searchParams)) {
    if (TRACKING_PARAMS.has(key)) continue;
    if (allowParams.length > 0 && !allowParams.includes(key)) continue;
    const normalized = normalizeParamValue(value);
    if (normalized) {
      url.searchParams.set(key, normalized);
    }
  }

  return url.toString();
}
