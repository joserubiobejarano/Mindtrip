import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";
import { cityPages } from "@/lib/seo/cities";
import { influencerPages } from "@/lib/seo/influencers";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const locales = ["en", "es"];

  const staticRoutes = [
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
  ];

  const staticEntries = staticRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const marketingRoutes = ["", "/cities", "/influencers", "/discover-kruno"];
  const marketingEntries = marketingRoutes.flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    }))
  );

  const cityEntries = cityPages.flatMap((city) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}/cities/${city.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  );

  const influencerEntries = influencerPages.flatMap((influencer) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}/influencers/${influencer.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  );

  return [...staticEntries, ...marketingEntries, ...cityEntries, ...influencerEntries];
}
