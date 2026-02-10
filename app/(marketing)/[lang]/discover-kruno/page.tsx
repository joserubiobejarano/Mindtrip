import { Suspense } from "react";
import type { Metadata } from "next";
import { DiscoverKrunoPage } from "@/components/landing/discover-kruno-page";
import { buildMetadata } from "@/lib/seo/metadata";
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
  const path = getLocalizedPath("/discover-kruno", lang);
  return buildMetadata({
    title: copy.discoverMetaTitle,
    description: copy.discoverMetaDescription,
    path,
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: buildCanonicalUrl(path),
      languages: buildLanguageAlternates("/discover-kruno"),
    },
    openGraphLocale: lang === "es" ? "es_ES" : "en_US",
    openGraphAlternateLocales: lang === "es" ? ["en_US"] : ["es_ES"],
  });
}

export default async function LocalizedDiscoverKrunoRoute({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) {
    notFound();
  }
  return (
    <Suspense fallback={null}>
      <DiscoverKrunoPage isSignedIn={false} />
    </Suspense>
  );
}
