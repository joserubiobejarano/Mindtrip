import type { MetadataRoute } from "next";
import type { CitySeo } from "@/lib/seo/cities";

/**
 * Builds sitemap entries for city guide pages, segmented by contentLevel (full vs lite).
 * Prepared for future sitemap segmentation by content type; not yet used in app/sitemap.ts.
 */
export function getSitemapEntriesByContentType(
  cityPages: CitySeo[],
  baseUrl: string,
  locales: string[]
): {
  byContentLevel: {
    full: MetadataRoute.Sitemap;
    lite: MetadataRoute.Sitemap;
  };
} {
  const now = new Date();
  const full: MetadataRoute.Sitemap = [];
  const lite: MetadataRoute.Sitemap = [];

  for (const city of cityPages) {
    const entries = locales.map((locale) => ({
      url: `${baseUrl}/${locale}/cities/${city.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8 as const,
    }));

    if (city.contentLevel === "full") {
      full.push(...entries);
    } else {
      lite.push(...entries);
    }
  }

  return { byContentLevel: { full, lite } };
}
