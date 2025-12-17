# Pro vs Free Users - Feature Comparison

This document outlines the differences between Pro and Free users in MindTrip (Kruno). This serves as a reference to ensure consistent implementation of feature restrictions and benefits.

## Overview

- **Free Plan**: Designed for casual travelers planning single-city trips with basic features
- **Pro Plan**: Enhanced features for frequent travelers, multi-city trips, and advanced planning needs

## Feature Comparison

### 1. Trip Creation & Structure

#### Free Users
- ✅ Single-city trips only
- ✅ Up to 14 days per trip
- ❌ Cannot create multi-city trips (trip segments)
- ❌ Cannot add multiple cities to a single trip

#### Pro Users
- ✅ Single-city trips
- ✅ **Multi-city trips** - Plan trips across multiple cities/countries
- ✅ **Trip Segments** - Add multiple cities with different durations
- ✅ Longer trips (up to 30+ days)
- ✅ AI helps structure stops and days across multiple destinations

**Implementation Notes:**
- Multi-city feature is gated by `isProForThisTrip` check (account Pro OR trip Pro)
- Trip segments API endpoints (`/api/trips/[tripId]/segments`) require Pro status
- New trip dialog shows Pro badge on "Add City" button for non-Pro users

---

### 2. Explore Feature Usage Limits

The Explore feature allows users to discover places and add them to their itinerary. Limits are tracked per user per trip.

#### Free Users
- **Swipe limit**: 10 swipes per trip
  - Swipes = like/dislike actions on place cards
  - Tracked in `trip_members.swipe_count`
- **Change limit**: 5 changes per trip
  - Changes = replacing activities in the itinerary
  - Tracked in `trip_members.change_count`
  - Enforced in `/api/trips/[tripId]/activities/[activityId]/replace` endpoint
  - Change actions are more computationally expensive and impactful. Free users are intentionally limited to encourage thoughtful edits and reduce accidental overuse.
- **Search add limit**: 5 places per trip
  - Search adds = places added via search functionality
  - Tracked in `trip_members.search_add_count`

#### Pro Users
- **Swipe limit**: 100 swipes per trip (10x increase)
- **Change limit**: **Unlimited** (no restrictions)
- **Search add limit**: **Unlimited** (no restrictions)

**Implementation Notes:**
- Limits are defined in `lib/supabase/user-subscription.ts`
- Usage is tracked in `trip_members` table (`swipe_count`, `change_count`, `search_add_count`)
- Migration file: `database/migrations/add-explore-usage-limits-to-trip-members.sql`
- Limits are checked via `getUsageLimits(isPro)` function
- Pro status is checked at trip level: `isProForThisTrip` (account Pro OR trip Pro)
- Usage counts are incremented when actions are performed
- Limits are enforced in API endpoints before allowing actions

**Constants:**
```typescript
FREE_SWIPE_LIMIT_PER_TRIP = 10
PRO_SWIPE_LIMIT_PER_TRIP = 100
FREE_CHANGE_LIMIT = 5
PRO_CHANGE_LIMIT = Infinity
FREE_SEARCH_ADD_LIMIT = 5
PRO_SEARCH_ADD_LIMIT = Infinity
```

---

### 3. Explore Filters

Advanced filtering options for place discovery in the Explore tab.

#### Free Users
- ✅ Category filter (All, Attractions, Museums, Restaurants, Parks, Nightlife)
- ✅ Show places already in itinerary toggle
- ❌ **Budget and distance filters hidden** (not rendered at all)
  - A small inline message is shown instead: "Unlock advanced filters with Pro"

#### Pro Users
- ✅ All category filters
- ✅ Show places already in itinerary toggle
- ✅ **Budget filter** - Filter by price level ($, $$, $$$, $$$$)
- ✅ **Distance filter** - Filter by distance (1km, 2km, 5km, 10km)

**Implementation Notes:**
- Filters are implemented in `components/explore/ExploreFilters.tsx`
- Budget and distance filters are not rendered at all for Free users in MVP
- A small inline message is shown instead: "Unlock advanced filters with Pro"
- Pro status is checked via `effectiveIsPro` (account Pro OR trip Pro)

---

### 4. Smart Itinerary Regeneration

AI-powered itinerary regeneration with daily limits.

#### Free Users
- **Regeneration limit**: 2 regenerations per day per trip
- Can regenerate itinerary with new preferences
- Can include/exclude specific places

#### Pro Users
- **Regeneration limit**: 5 regenerations per day per trip (2.5x increase)
- Same regeneration features as free users

**Implementation Notes:**
- Limits enforced in `app/api/trips/[tripId]/smart-itinerary/route.ts`
- Daily count tracked in `trip_regeneration_stats` table
- Limit checked via `getTripProStatus()` - uses `isProForThisTrip`
- Returns 429 error when limit exceeded with message indicating Pro upgrade

**Constants:**
```typescript
Free: maxRegenerationsPerDay = 2
Pro: maxRegenerationsPerDay = 5
```

---

### 5. Trip-Level Pro Status

In addition to account-level Pro subscriptions, individual trips can be unlocked with Pro features.

#### Account-Level Pro (`profiles.is_pro`)
- User has active Pro subscription
- Applies to all trips owned by the user
- Set via Stripe webhook when subscription is active/trialing

#### Trip-Level Pro (`trips.has_trip_pro`)
- Individual trip can be unlocked with Pro features
- Allows non-Pro users to access Pro features for specific trips
- Useful for one-time trip planning without full subscription

#### Effective Pro Status (`isProForThisTrip`)
- **Formula**: `isAccountPro OR isTripPro`
- Used throughout the app to determine if Pro features should be enabled
- Implemented in `lib/supabase/pro-status.ts` via `getTripProStatus()`

**Implementation Notes:**
- Both account Pro and trip Pro grant the same feature access
- Trip Pro is checked first, then account Pro
- Trip Pro status is stored in `trips.has_trip_pro` column
- Trip Pro can be purchased via checkout flow (`/api/billing/checkout/trip`)

---

## Pro Status Checking

### How to Check Pro Status

#### Account-Level Pro
```typescript
import { getUserSubscriptionStatus } from '@/lib/supabase/user-subscription';

const { isPro } = await getUserSubscriptionStatus(userId);
// Returns: { isPro: boolean }
```

#### Trip-Level Pro (Recommended)
```typescript
import { getTripProStatus } from '@/lib/supabase/pro-status';

const { isProForThisTrip } = await getTripProStatus(supabase, userId, tripId);
// Returns: { isAccountPro, isTripPro, isProForThisTrip }
```

**Best Practice**: Always use `isProForThisTrip` when checking Pro features for a specific trip, as it accounts for both account Pro and trip Pro.

---

## Database Schema

### Pro Status Storage

#### `profiles` table
- `is_pro` (BOOLEAN) - Account-level Pro subscription status
- Default: `false`
- Updated via Stripe webhook (`/api/billing/webhook`)

#### `trips` table
- `has_trip_pro` (BOOLEAN) - Trip-level Pro unlock status
- Default: `false`
- Can be set via checkout flow

#### `trip_members` table (Usage Tracking)
- `swipe_count` (INTEGER) - Number of swipe actions per user per trip
- `change_count` (INTEGER) - Number of change/replace actions per user per trip
- `search_add_count` (INTEGER) - Number of search add actions per user per trip
- All default to 0

---

## UI Indicators

### Pro Badges
- Orange badge with "Pro" text for Pro features
- Gray badge with "Pro" text for locked features
- Lock icon (🔒) shown next to locked Pro features

### Paywall Modal
- Shown when free users attempt to use Pro features
- Implemented in `components/pro/ProPaywallModal.tsx`
- Context-aware messaging based on feature being accessed

### Disabled States
- Pro-only features show paywall modal when accessed
- Filters are hidden (not rendered) for Free users in MVP

---

## API Endpoints

### Pro-Gated Endpoints

#### Trip Segments (Multi-City)
- `POST /api/trips/[tripId]/segments` - Create segment (Pro only)
- `PATCH /api/trips/[tripId]/segments` - Update segment (Pro only)
- `DELETE /api/trips/[tripId]/segments` - Delete segment (Pro only)
- Returns 403 with `plan_required: 'pro_or_trip_unlock'` if not Pro

#### Smart Itinerary
- `POST /api/trips/[tripId]/smart-itinerary` - Regenerate itinerary
  - Enforces daily regeneration limits (2 free, 5 Pro)
  - Returns 429 when limit exceeded

#### Explore Features
- `POST /api/trips/[tripId]/explore/swipe` - Swipe on places
  - Enforces swipe limits (10 free, 100 Pro)
  - Increments `trip_members.swipe_count`
- `POST /api/trips/[tripId]/explore/places` - Search places
  - Budget/distance filters only work for Pro users
- `POST /api/trips/[tripId]/activities/[activityId]/replace` - Replace activity ✅ **NEW**
  - Enforces change limits (5 free, unlimited Pro)
  - Increments `trip_members.change_count`
  - Returns 403 error when limit reached
  - Uses Explore Places API to find contextually relevant replacements
  - Enforces food place limit (max 1 per time slot)
  - Prevents modifying past days
- `POST /api/trips/[tripId]/days/[dayId]/activities/bulk-add-from-swipes` - Bulk add
  - Enforces search add limits (5 free, unlimited Pro)
  - Increments `trip_members.search_add_count`

---

## Error Messages

### Common Pro-Related Errors

#### 403 Forbidden - Pro Required
```json
{
  "error": "Pro subscription or trip unlock required for multi-city trips",
  "plan_required": "pro_or_trip_unlock"
}
```

#### 429 Too Many Requests - Limit Exceeded
```json
{
  "error": "regeneration_limit_reached",
  "maxPerDay": 2,
  "isPro": false,
  "message": "You've already reshaped this itinerary a few times today. Take a break and come back later or unlock Pro to keep refining."
}
```

#### Usage Limit Messages (Frontend)
- Swipe limit: `"You've reached the swipe limit (X/10). Unlock Kruno Pro to see more places."`
- Change limit: `"You've reached the change limit (X/5). Unlock Kruno Pro to see more places."`
- Search add limit: `"You've reached the add limit (X/5). Unlock Kruno Pro to see more places."`

---

## Future Pro Features (Planned)

Based on `docs/monetization.md`, additional Pro features may include:

- **Advanced routing & optimization** - Reduce backtracking, smart grouping
- **Collaboration & group travel** - Shared editing, polls, voting, comments
- **Unlimited active trips** - Free: 2 trips, Pro: unlimited
- **Version history / undo** - Undo AI changes, view previous versions
- **AI Concierge+** - Higher chat limits, deeper context, preference memory
- **Exports** - Google Maps, PDF, Calendar (ICS)
- **Imports** - Import bookings from email (Gmail parsing)
- **Offline / PWA** - Cached itineraries for offline mobile use
- **Custom tags & filters** - Tag activities with custom categories

---

## Testing Checklist

When implementing or modifying Pro features, verify:

- [ ] Free users cannot access Pro-gated features
- [ ] Pro users can access all Pro features
- [ ] Trip Pro unlocks features for that specific trip
- [ ] Account Pro unlocks features for all user's trips
- [ ] Usage limits are enforced correctly
- [ ] Paywall modal appears for locked features
- [ ] Error messages are clear and actionable
- [ ] UI indicators (badges, locks) are visible
- [ ] API endpoints return correct status codes
- [ ] Database constraints prevent unauthorized access

---

## Notes

- All Pro checks should gracefully default to free tier if status cannot be determined
- Pro status is cached in some components - ensure proper invalidation on subscription changes
- Stripe webhook updates `profiles.is_pro` automatically on subscription events
- Trip Pro can be purchased independently of account Pro subscription

---

**Last Updated**: Based on codebase analysis as of current date
**Maintained By**: Development Team
**Related Docs**: 
- `docs/monetization.md` - Monetization strategy
- `docs/ARCHITECTURE.md` - System architecture
- `lib/supabase/user-subscription.ts` - Subscription utilities
- `lib/supabase/pro-status.ts` - Pro status checking

---

## MVP Scope Notes

For MVP, Pro gating prioritizes usage-based limits over aggressive feature locking.

The goal is to let Free users experience the core value of MindTrip while naturally encountering limits that encourage upgrading, without overwhelming them with locked UI states.

Key MVP principles:
- **Usage limits** are the primary gating mechanism (swipes, changes, search adds, regenerations)
- **Feature hiding** is preferred over disabled states (e.g., filters not rendered vs. disabled inputs)
- **Soft messaging** focuses on value and upgrade benefits rather than technical restrictions
- **Core experience** remains accessible to Free users to demonstrate product value
