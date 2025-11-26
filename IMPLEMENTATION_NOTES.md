# Implementation Notes

## Completed Tasks

All requested features have been implemented. Here's a summary:

### A. Homepage Header & Hero Date Pickers ✅

1. **Removed duplicate navbar**: Removed `AppHeader` from root layout (`app/layout.tsx`). The homepage now has a single navbar with logo, nav links, and auth buttons.

2. **Date range picker**: Created a new reusable `DateRangePicker` component (`components/date-range-picker.tsx`) that opens a calendar popover. Updated `HeroSearch` to use this component instead of separate date inputs.

3. **Hero search wired**: The hero search form already uses the existing `createTrip` hook, which creates trips and redirects to `/trips/[tripId]`.

### B. Inspiration Images ✅

Destination cards already use `next/image` via `ImageWithFallback`. Added `images.unsplash.com` to `next.config.mjs` to allow Unsplash images to load properly.

### C. Sign-in Flow & "My trips" ✅

1. **Post-login redirect**: Updated all auth redirects to go to `/` (homepage) instead of `/trips`:
   - `components/app-header.tsx`
   - `app/sign-in/[[...index]]/page.tsx`
   - `app/sign-up/[[...index]]/page.tsx`

2. **"My trips" in user menu**: Added "My trips" link to the homepage navbar when signed in, and also to `app-header.tsx` for app pages.

3. **Removed auto-redirect**: Removed the `useEffect` that automatically redirected signed-in users to `/trips` on the homepage.

### D. Smart Itinerary Persistence + Hotel/Flight Banner ✅

1. **Itinerary persistence**: 
   - Updated `app/api/ai-itinerary/route.ts` to check for existing itinerary before generating
   - Updated `components/itinerary-tab.tsx` to load existing itinerary from trip data immediately
   - The itinerary is saved to the `trips.itinerary` JSONB column (already exists via migration)

2. **Hotel/Flight banner**: Updated `components/hotel-search-banner.tsx` to show two side-by-side cards (Hotels and Flights) with the new design style. The banner already appears in both Itinerary and Explore tabs.

### E. App Layout Design Updates ✅

1. **Map width vs panel**: Updated `components/trip-shell.tsx` to use 40/60 split (map/panel) on desktop using flex ratios.

2. **Design tokens**: Applied homepage design tokens throughout:
   - Purple primary color for active tabs
   - Orange CTA buttons
   - Rounded corners (rounded-xl, rounded-2xl)
   - Shadows and borders matching homepage style
   - Updated loading state with purple gradient background

3. **UX tweaks**: Enhanced the "Generating your itinerary..." state with purple gradient background and bold text.

## Required Actions

### 1. Install Missing Package

You need to install the Radix UI Popover package:

```bash
npm install @radix-ui/react-popover
```

### 2. Database Migration

The `itinerary` column should already exist in your `trips` table (from `database/migrations/add-itinerary-column.sql`). If not, run:

```sql
-- Add itinerary column to trips table to store the AI generated story/plan
ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS itinerary JSONB;
```

### 3. Verify Image Configuration

The `next.config.mjs` has been updated to allow Unsplash images. If you're using other image sources, you may need to add them to the `remotePatterns` array.

## Notes

- The date range picker uses a popover that opens above the search bar. On mobile, it should fit within the viewport.
- The itinerary persistence ensures that once generated, the itinerary is reused on future visits unless explicitly regenerated.
- All design tokens (purple primary, orange CTA, rounded corners, shadows) are now consistent between homepage and app pages.
- The map/panel split is 40/60 on desktop and stacks vertically on mobile.

