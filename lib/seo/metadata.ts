import type { Metadata } from "next";
import { siteConfig } from "./site";
import { buildCanonicalUrl } from "./urls";

type SeoMetadataOptions = {
  title: string;
  description: string;
  path: string;
  searchParams?: Record<string, string | string[] | undefined>;
  robots?: Metadata["robots"];
  images?: Metadata["openGraph"] extends { images?: infer T } ? T : never;
  alternates?: Metadata["alternates"];
  openGraphLocale?: string;
  openGraphAlternateLocales?: string[];
};

const defaultImages = [
  {
    url: "/itinerary-preview.svg",
    width: 1200,
    height: 630,
    alt: "Kruno trip itinerary preview",
  },
];

export function buildMetadata({
  title,
  description,
  path,
  searchParams,
  robots,
  images,
  alternates,
  openGraphLocale,
  openGraphAlternateLocales,
}: SeoMetadataOptions): Metadata {
  const canonical = buildCanonicalUrl(path, searchParams);
  const ogImages = images ?? defaultImages;
  const resolvedAlternates = alternates
    ? {
        ...alternates,
        canonical: alternates.canonical ?? canonical,
      }
    : {
        canonical,
      };
  const resolvedOgLocale = openGraphLocale ?? "en_US";
  const resolvedOgAlternateLocales = openGraphAlternateLocales ?? ["es_ES"];

  return {
    title,
    description,
    alternates: resolvedAlternates,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
      locale: resolvedOgLocale,
      alternateLocale: resolvedOgAlternateLocales,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages,
    },
    robots,
  };
}
