# Brand Assets

This directory contains the brand logo and related assets.

## Logo Files

- `/public/icon.svg` - The main Kruno logo SVG file (used throughout the UI)

This logo is used for:
- Navbar logo (40x40px display)
- Header logo (32x32px display)
- Footer logo (40x40px display)
- Itinerary header logo (32x32px display)

Note: Favicon and app icons are configured separately in `app/layout.tsx` using `/favicon.ico` and `/apple-touch-icon.png`.

## Usage

The logo is referenced via absolute path: `/icon.svg`

All Image components using the logo must include width and height props (no fill usage).
