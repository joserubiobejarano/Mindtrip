# Adding a City Guide

This guide covers the marketing-only city pages (no in-app itinerary UI).

## Where to add data
- `lib/seo/cities.ts`: add the city to `cityPages` for hub/metadata.
- `lib/itinerary/city-itineraries.ts`: add full guide data under each locale (`en`, `es`).

## Required fields (P0)
- `slug`, `city`, `country`, `days`, `pace`, `idealFor`, `style`
- `pacing` (3 short paragraphs for the “How to enjoy” block)
- `hero.title`, `hero.subtitle`, `hero.image.src`, `hero.image.alt`
- `cityStats` (3-5 items)
- `dayPlans` (length matches `days`; each day has `title`, `summary`, `morning`, `afternoon`, `evening`)
- `imageInfoCards` (3 cards with title, description, image) (still required for day-by-day image context)
- `logistics` (4+ items)
- `checklist` (6+ items)
- `faqs` (7 Q/A pairs)
- `relatedItineraries` (3 items with valid slugs that exist for the locale)
- `primaryCtaHref`, `secondaryCtaHref`

## SEO Copy Rules
- Meta title pattern (EN): `How to spend {days} days in {city} without Rushing`
- Meta title pattern (ES): `Cómo pasar {days} días en {city} sin ir muy apurado.`
- Meta description pattern (EN): `A full day-by-day {city} travel guide designed for first-time visitors. See the essentials, enjoy great food, and avoid overplanning.`
- Meta description pattern (ES): `Una guía de viaje completa de {city}, día a día y diseñada para quienes la visitan por primera vez. Visita lo esencial, disfruta de una excelente comida y evita planificar demasiado.`
- Spanish pages must fully localize all metadata:
  - `<title>`
  - Meta description
  - OpenGraph title and description
  - Twitter title and description
  - Section headings that appear in metadata or schema
  - No English strings allowed in Spanish metadata

## Images

### Hero images
- Use Wikimedia Commons URLs in the format: `https://commons.wikimedia.org/wiki/Special:FilePath/{filename}`
- The system automatically normalizes these URLs via `/api/wikimedia` endpoint (see `lib/images/wikimedia.ts` and `components/itinerary/SafeImage.tsx`)
- Choose city-specific, recognizable landmarks or cityscapes that represent the destination well
- Ensure the image filename exists on Wikimedia Commons before using it
- Avoid broken or generic Unsplash URLs that don't match the city
- Alt text must be descriptive and city-specific, fully localized for Spanish pages

### Image info cards
- Use the same Wikimedia Commons format for consistency
- Select images that show different aspects of the city (neighborhoods, landmarks, local life)
- Ensure all image URLs are valid and city-relevant

## Guardrails to expect in dev
- Missing sections or invalid image URLs will trigger `console.warn` in dev.
- Related links are checked for missing/unknown slugs.

## How to test locally
1. Run `npm run dev`.
2. Open:
   - `http://localhost:3000/cities/<slug>`
   - `http://localhost:3000/es/cities/<slug>`
   - `http://localhost:3000/cities`
   - `http://localhost:3000/es/cities`
3. Check the dev console for `[Guide QA]` warnings.
4. Verify hero image, stats, pacing block, FAQ, and related cards render.

## URLs to verify before shipping
- `/cities/<slug>`
- `/es/cities/<slug>`
- `/cities`
- `/es/cities`
