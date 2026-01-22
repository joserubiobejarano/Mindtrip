# Guide Quality Checklist

Use this checklist before shipping any new city guide. The bar is "Rome quality."

## P0 (must-have)
- Hero section includes title, subtitle, and a valid hero image URL.
- City stats section includes 3-5 stats with clear labels.
- Image cards section includes 3 cards with title, description, and image.
- Day plans count matches the number of days and each day has all fields filled.
- FAQ section includes 7 Q/A pairs with full-length answers.
- Related itineraries section includes 3 links with valid slugs.
- All image URLs are valid (https or local `/` paths).
- Primary and secondary CTA links are set.

## P1 (recommended)
- Spanish localization is complete and matches the English structure.
- Related itineraries are varied (not all the same city/country).
- Logistics includes at least 4 entries covering timing, transit, and tickets.
- Checklist includes at least 6 actionable items.
- Descriptions avoid repetition across sections.

## P2 (nice-to-have)
- Seasonality tips include shoulder-season guidance.
- One or two local tips add personality without adding length.
- Image choices show different times of day or neighborhoods.

## SEO
- Follow the "SEO Copy Rules" in `docs/ADDING_A_CITY_GUIDE.md`, including fully localized Spanish metadata.

## Ship / No-Ship rule
- Ship only if all P0 checks pass and there are no missing sections or broken images in dev.
- If any P0 item fails, it is a No-Ship until fixed.
