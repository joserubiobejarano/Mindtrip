import type { CitySeo } from "@/lib/seo/cities";

/**
 * Validates that no two indexed city guides share the same primaryKeyword.
 * Logs [Guide SEO] warnings in dev when duplicates are detected.
 */
export function checkPrimaryKeywordUniqueness(cityPages: CitySeo[]): void {
  const byKeyword = new Map<string, string[]>();

  for (const city of cityPages) {
    const kw = city.primaryKeyword;
    const slugs = byKeyword.get(kw) ?? [];
    slugs.push(city.slug);
    byKeyword.set(kw, slugs);
  }

  for (const [keyword, slugs] of byKeyword) {
    if (slugs.length > 1) {
      console.warn(
        `[Guide SEO] Duplicate primaryKeyword: "${keyword}" used by slugs: ${slugs.join(", ")}`
      );
    }
  }
}
