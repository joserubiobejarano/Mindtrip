import { HomePageClient } from "@/components/home-page-client";
import { StructuredData } from "@/components/seo/StructuredData";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig, getSiteUrl } from "@/lib/seo/site";
import type { Metadata } from "next";
import { buildCanonicalUrl, buildLanguageAlternates, getLocalizedPath } from "@/lib/seo/urls";
import { auth } from "@clerk/nextjs/server";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const canonicalPath = getLocalizedPath("/", "en");
  const resolvedSearchParams = await searchParams;
  return buildMetadata({
    title: siteConfig.title,
    description: siteConfig.description,
    path: "/",
    searchParams: resolvedSearchParams,
    alternates: {
      canonical: buildCanonicalUrl(canonicalPath, resolvedSearchParams),
      languages: buildLanguageAlternates("/"),
    },
  });
}

export default async function HomePage() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);
  const siteUrl = getSiteUrl();
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/cities?query={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.name,
      url: siteUrl,
      logo: `${siteUrl}/icon.svg`,
    },
  ];

  return (
    <>
      <StructuredData data={structuredData} id="kruno-home-ld" />
      <HomePageClient isSignedIn={isSignedIn} />
    </>
  );
}
