# City Guide SEO Data Model Refactor – Report

**Date:** January 2025  
**Scope:** Marketing-only city guide data model; no template, layout, or app logic changes.

---

## 1. Fields added

The following fields were added to `CitySeo` in [lib/seo/cities.ts](lib/seo/cities.ts):

| Field | Type | Description |
|-------|------|-------------|
| `intent` | `"informational" \| "mixed" \| "transactional"` | Search intent; affects indexing and CTAs (doc-only for now). |
| `contentLevel` | `"full" \| "lite"` | Full = Rome-quality depth; lite = lighter or hub-only. |
| `primaryKeyword` | `string` | Canonical target phrase (e.g. `"3 days in Paris"`) for uniqueness checks. |

Shared types `GuideIntent` and `GuideContentLevel` were also added and exported from the same file.

---

## 2. Guides marked full vs lite

| contentLevel | Slugs |
|--------------|-------|
| **full** | `rome`, `paris` |
| **lite** | All other 38 cities: `barcelona`, `london`, `lisbon`, `prague`, `vienna`, `budapest`, `seville`, `berlin`, `florence`, `venice`, `milan`, `munich`, `dublin`, `edinburgh`, `copenhagen`, `stockholm`, `athens`, `porto`, `krakow`, `zurich`, `brussels`, `valencia`, `oslo`, `reykjavik`, `istanbul`, `naples`, `nice`, `warsaw`, `granada`, `lyon`, `salzburg`, `rotterdam`, `bergen`, `bologna`, `bruges`, `dubrovnik`, `helsinki`, `innsbruck`, `riga`, `split`, `tallinn`, `vilnius`. |

---

## 3. Keyword or intent conflicts

- **Primary keyword uniqueness:** `checkPrimaryKeywordUniqueness` (in [lib/seo/guide-seo-validation.ts](lib/seo/guide-seo-validation.ts)) runs in dev when `cityPages` is loaded. With current data, all `primaryKeyword` values are unique (`"{days} days in {name}"` per city). **No duplicate primaryKeyword targets were detected;** no `[Guide SEO]` warnings.
- **Intent:** All guides use `intent: "mixed"`. **No intent conflicts.**

---

## 4. Other deliverables

- **Dev validation:** Duplicate `primaryKeyword` across indexed city guides triggers `[Guide SEO]` warnings in development.
- **Docs:** [ADDING_A_CITY_GUIDE.md](ADDING_A_CITY_GUIDE.md) updated with when to use full vs lite, how intent affects indexing/CTAs, minimum content depth for full guides, and SEO data model (`intent`, `contentLevel`, `primaryKeyword`). [GUIDE_QUALITY_CHECKLIST.md](GUIDE_QUALITY_CHECKLIST.md) updated to require these fields and uniqueness of `primaryKeyword`.
- **Sitemap segmentation:** [lib/seo/sitemap-segmentation.ts](lib/seo/sitemap-segmentation.ts) provides `getSitemapEntriesByContentType(cityPages, baseUrl, locales)` returning `{ byContentLevel: { full, lite } }`. **Not yet used** in `app/sitemap.ts`; prepared for future use.
