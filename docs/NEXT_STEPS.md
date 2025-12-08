# Kruno - Next Steps & Implementation Plan

> **Last Updated:** January 2025  
> **Focus:** Explore Feature Implementation

## 🎯 Current Priority: Phase 17 - Day-Level Integration & Advanced Filters

Phases 15 and 16 of the Explore feature have been completed! Phase 17 backend is also complete. This document outlines what's been implemented and what remains.

---

## ✅ Phase 15: Explore Feature - Tinder-Style Place Discovery (COMPLETE)

**Status:** ✅ **COMPLETE** - All core features have been implemented and are functional. Additional enhancements include undo functionality, day-level filtering, and Pro tier filters.

### What Was Implemented:

#### ✅ 1. Database Schema Updates

**Completed:**
- `explore_sessions` table created with full schema
- Migration file: `database/migrations/supabase-add-explore-sessions-table.sql`
- Includes: `liked_place_ids`, `discarded_place_ids`, `swipe_count`, `last_swipe_at`, indexes, RLS policies, triggers
- Unique constraint on `(trip_id, user_id)` for session management

#### ✅ 2. API Endpoints (ALL COMPLETE)

**Completed Endpoints:**

##### ✅ 2.1 Get Places to Explore
**Location:** `app/api/trips/[tripId]/explore/places/route.ts`
**Endpoint:** `GET /api/trips/[tripId]/explore/places`

**Query Parameters (Implemented):**
- `limit`: Number of places to return (default: 20)
- `offset`: Pagination offset
- `includeItineraryPlaces`: Boolean - include places already in itinerary (default: false)
- `neighborhood`: Filter by neighborhood (optional)
- `category`: Filter by place category (optional)
- `timeOfDay` or `time_of_day`: Filter by time of day (morning/afternoon/evening) (optional)
- `day_id`: Filter by specific day - auto-detects day's neighborhood (optional)
- `budget`: Filter by price level (0-4) - Pro tier only (optional)
- `maxDistance`: Filter by maximum distance in meters - Pro tier only (optional)
- `excludePlaceId`: Multiple - exclude specific place IDs (optional)

**Response:**
```typescript
{
  places: ExplorePlace[];
  hasMore: boolean;
  totalCount: number;
}

interface ExplorePlace {
  place_id: string;  // Google place_id
  name: string;
  photo_url: string | null;
  category: string;  // museum, viewpoint, café, etc.
  neighborhood: string;
  district: string | null;
  rating: number;
  user_ratings_total: number;
  tags: string[];  // "Locals love this", "Trending now", etc.
  price_level?: number;  // 0-4
  types: string[];  // Google Places types
}
```

##### ✅ 2.2 Record Swipe Action
**Location:** `app/api/trips/[tripId]/explore/swipe/route.ts`
**Endpoint:** `POST /api/trips/[tripId]/explore/swipe`

**Features Implemented:**
- Records like/dislike actions
- **NEW: Undo action** - Reverse last swipe (action: 'undo')
- Enforces daily swipe limits (50 for free tier, unlimited for Pro)
- Daily reset logic (resets at midnight UTC)
- Validates subscription status
- Returns swipe count and remaining swipes
- Returns undonePlaceId when undo action is used

##### ✅ 2.3 Get Explore Session
**Location:** `app/api/trips/[tripId]/explore/session/route.ts`
**Endpoint:** `GET /api/trips/[tripId]/explore/session`

**Features Implemented:**
- Returns liked/discarded places arrays
- Returns swipe count and remaining swipes
- Auto-creates session if it doesn't exist
- Calculates remaining swipes based on subscription tier

##### ✅ 2.4 Clear Explore Session
**Endpoint:** `DELETE /api/trips/[tripId]/explore/session`

**Features Implemented:**
- Clears liked and discarded arrays
- Resets swipe count
- Keeps session record for tracking

##### ✅ 2.5 User Subscription Status
**Location:** `app/api/user/subscription-status/route.ts`
**Endpoint:** `GET /api/user/subscription-status`

**Features Implemented:**
- Returns user's subscription tier (Pro or free)
- Returns: `{ isPro: boolean }`
- Used by frontend to enable/disable Pro features

#### ✅ 3. Frontend Components (ALL COMPLETE)

##### ✅ 3.1 SwipeableCard Component
**Location:** `components/explore/SwipeableCard.tsx`
**Status:** ✅ Implemented

**Features Implemented:**
- Framer Motion animations for swipe gestures
- Card displays: name, photo, category, neighborhood, rating, tags
- Swipe right = like, swipe left = dislike, swipe up = details
- Button alternatives for accessibility
- Loading states

##### ✅ 3.2 ExploreDeck Component
**Location:** `components/explore/ExploreDeck.tsx`
**Status:** ✅ Implemented

**Features Implemented:**
- Manages card stack
- Handles swipe gestures
- Tracks liked/discarded places
- Shows swipe counter and limits
- "Add to itinerary" button (disabled until swipes made)
- Empty state when no more places

##### ✅ 3.3 ExploreTab Component (Updated)
**Location:** `components/explore-tab.tsx`
**Status:** ✅ Updated with new functionality

**Features Implemented:**
- Integrates SwipeableCard and ExploreDeck
- ExploreFilters component integration
- Filter options (neighborhood, category, time of day)
- Swipe limit indicator
- Integration with trip context
- "Add to itinerary" button with regeneration flow

##### ✅ 3.4 Additional Components
**Location:** `components/explore/`
**Status:** ✅ Implemented

- `ExploreFilters.tsx` - Filter UI component
- `SwipeCounter.tsx` - Swipe counter and limits display

#### ✅ 4. Google Places Integration

**Location:** `lib/google/explore-places.ts`
**Status:** ✅ Implemented

**Functions Implemented:**
- `getPlacesToExplore(tripId, filters)` - Fetch places for destination
- `enrichPlaceWithTags(place, rating, userRatingsTotal)` - Add tags like "Locals love this", "Trending now"
- `getPlaceCategory(types)` - Map Google types to readable categories
- `getNeighborhoodFromPlace(place, address)` - Extract neighborhood/district

**Implementation Details:**
- Uses Google Places Text Search API
- Filters by destination coordinates (trip center_lat/center_lng)
- Sorts by rating and review count
- Returns top 50 places
- Includes photo URLs from Google Places
- Supports advanced filters (budget, maxDistance) for Pro tier
- Supports day-level filtering (day_id parameter)

#### ✅ 5. Swipe Limit Logic

**Location:** `lib/supabase/user-subscription.ts` & API routes
**Status:** ✅ Implemented

**Free Tier Implementation:**
- 50 swipes per day (configurable via `getUserDailySwipeLimit()`)
- Reset at midnight (UTC)
- Daily reset logic checks `last_swipe_at` timestamp
- Shows counter: remaining swipes
- Returns limit reached status when limit hit

**Pro Tier Implementation:**
- Unlimited swipes (Infinity limit)
- No counter shown
- Subscription checking via `getUserSubscriptionStatus()`
- Pro tier users get access to advanced filters (budget, maxDistance)

**Functions:**
- `getUserSubscriptionStatus(userId)` - Returns `{ isPro: boolean }`
- `getUserDailySwipeLimit(userId)` - Returns daily limit (50 for free, Infinity for Pro)

#### ✅ 6. React Hooks

**Location:** `hooks/use-explore.ts`
**Status:** ✅ Implemented

**Hooks Implemented:**
- `useExplorePlaces(tripId, filters)` - Fetch places with React Query
- `useExploreSession(tripId)` - Get/sync session state
- `useSwipeAction(tripId)` - Handle swipes with optimistic updates

**Features:**
- Optimistic UI updates
- Automatic query invalidation
- Error handling with toast notifications
- Loading states

---

## ✅ Phase 16: Itinerary Regeneration with Liked Places (COMPLETE)

**Status:** ✅ **COMPLETE** - All features have been implemented and are functional.

### What Was Implemented:

#### ✅ 1. Update Smart Itinerary Generator

**Location:** `app/api/trips/[tripId]/smart-itinerary/route.ts`
**Status:** ✅ Updated

**Request Body Support:**
```typescript
{
  must_include_place_ids?: string[];  // Liked places from Explore ✅
  already_planned_place_ids?: string[];  // Places already in itinerary ✅
  preserve_structure?: boolean;  // Try to keep existing day structure ✅
}
```

**Logic Implemented:**
1. ✅ Fetches place details from Google Places API for `must_include_place_ids`
2. ✅ Includes liked places in itinerary generation prompt
3. ✅ Prioritizes places in appropriate time slots
4. ✅ Re-clusters by neighborhood with existing places
5. ✅ Preserves day structure when `preserve_structure=true`
6. ✅ Avoids duplication with existing places
7. ✅ Clears liked places after successful regeneration

#### ✅ 2. Place Integration Service

**Location:** `lib/supabase/explore-integration.ts`
**Status:** ✅ Implemented

**Functions Implemented:**
- ✅ `getLikedPlacesForTrip(tripId, userId)` - Get liked places from explore session
- ✅ `getPlacesInItinerary(tripId)` - Extract place names from SmartItinerary
- ✅ `clearLikedPlacesAfterRegeneration(tripId, userId)` - Clear after regeneration

#### ✅ 3. UI Updates

**Explore Tab Updates:**
- ✅ Shows progress during regeneration (loading state)
- ✅ Displays success message with count of added places
- ✅ Navigates to itinerary tab after regeneration
- ✅ Handles errors gracefully with toast notifications

**Integration:**
- ✅ "Add to itinerary" button in ExploreTab calls regeneration API
- ✅ Passes `must_include_place_ids` from session
- ✅ Uses `preserve_structure: true` to maintain day organization

#### ✅ 4. Day-Level Bulk Add API

**Location:** `app/api/trips/[tripId]/days/[dayId]/activities/bulk-add-from-swipes/route.ts`
**Endpoint:** `POST /api/trips/[tripId]/days/[dayId]/activities/bulk-add-from-swipes`

**Features Implemented:**
- ✅ Add multiple places to specific day and time slot
- ✅ Body: `{ place_ids: string[], slot: 'morning' | 'afternoon' | 'evening' }`
- ✅ Fetches place details from Google Places API
- ✅ Enriches places with photos, descriptions, tags
- ✅ Avoids duplicates (checks existing places in slot)
- ✅ Updates SmartItinerary directly
- ✅ Returns count of added places

---

---

## Phase 17: Day-Level Integration & Advanced Filters

**Status:** ✅ **COMPLETE** - All backend and UI features implemented

### ✅ Completed Backend Features

1. **Day-Level Bulk Add API** ✅
   - Endpoint: `POST /api/trips/[tripId]/days/[dayId]/activities/bulk-add-from-swipes`
   - Adds places directly to specific day and time slot
   - Location: `app/api/trips/[tripId]/days/[dayId]/activities/bulk-add-from-swipes/route.ts`

2. **Day-Level Filtering** ✅
   - Support for `day_id` parameter in Explore API
   - Auto-detects day's neighborhood for filtering
   - Location: `app/api/trips/[tripId]/explore/places/route.ts`

3. **User Subscription System** ✅
   - `is_pro` column added to profiles table
   - Migration file: `database/migrations/add-is-pro-to-profiles.sql`
   - Subscription status API: `/api/user/subscription-status`
   - Helper functions: `lib/supabase/user-subscription.ts`

4. **Advanced Filters (Pro Tier)** ✅
   - Budget filter (price level: 0-4)
   - MaxDistance filter (meters)
   - Implemented in Explore API and ExploreFilters component

5. **Daily Swipe Limits** ✅
   - 50 swipes/day for free tier
   - Unlimited for Pro tier
   - Daily reset logic at midnight UTC

### ✅ Completed UI Features

### 1. Day-Level "Add Activities" Button ✅

**Implementation:** Integrated into `components/itinerary-tab.tsx`

**Features Implemented:**
- ✅ Button on each time slot (morning/afternoon/evening) in itinerary view
- ✅ Opens Explore drawer/sheet (`components/ui/sheet`)
- ✅ Pre-filters by:
  - Day's neighborhood (from areaCluster)
  - Time of day (morning/afternoon/evening)
  - Area cluster information from existing places

**Integration:**
- Uses `ExploreDeck` component in `mode='day'`
- Passes `dayId`, `slot`, and `areaCluster` to filter places
- Immediate add-to-day: swiping right adds place directly to that day/slot
- Location: `components/itinerary-tab.tsx` (lines 657-673, 871-907)

### 2. Advanced Filters (Pro Tier)

**New Component:** `components/explore/ExploreFilters.tsx`

**Filters:**
- **Vibe**: Romantic, Family-friendly, Adventurous, Relaxed, Party, etc.
- **Budget**: $, $$, $$$, $$$$
- **Distance**: Within X km/miles of trip center
- **Theme**: Food, Culture, Nature, Nightlife, Shopping, etc.
- **Accessibility**: Wheelchair accessible, etc.

**Implementation:**
- Store filter preferences in explore_sessions
- Apply filters to Google Places API queries
- Show active filters in UI
- Clear filters button

### 3. Multi-City Explore (Pro Tier)

**Updates Needed:**
- Support multiple destinations in one trip
- Allow switching between cities in Explore
- Maintain separate swipe counts per city
- Aggregate liked places across cities

### 4. Travel Stats & Badges (Pro Tier)

**New Tables:**
```sql
CREATE TABLE user_travel_stats (
  user_id TEXT PRIMARY KEY,
  total_places_liked INTEGER DEFAULT 0,
  total_places_visited INTEGER DEFAULT 0,
  countries_visited TEXT[] DEFAULT '{}',
  categories_explored TEXT[] DEFAULT '{}',
  badges_earned TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  badge_type TEXT NOT NULL,  -- 'country', 'category', 'milestone'
  badge_value TEXT NOT NULL,  -- Country code, category name, etc.
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## ✅ Implementation Timeline (Phases 15-16 Complete)

### ✅ Week 1-2: Database & API Foundation (COMPLETE)
- [x] Create explore_sessions table migration
- [x] Implement GET /api/trips/[tripId]/explore/places endpoint
- [x] Implement POST /api/trips/[tripId]/explore/swipe endpoint
- [x] Implement GET /api/trips/[tripId]/explore/session endpoint
- [x] Test API endpoints

### ✅ Week 3-4: Frontend Components (COMPLETE)
- [x] Create SwipeableCard component
- [x] Create ExploreDeck component
- [x] Update ExploreTab with swipe functionality
- [x] Implement swipe gestures with Framer Motion
- [x] Add button alternatives
- [x] Test swipe interactions

### ✅ Week 5-6: Google Places Integration (COMPLETE)
- [x] Create explore-places service
- [x] Implement place fetching logic
- [x] Add tag enrichment ("Locals love this", etc.)
- [x] Implement filtering logic
- [x] Add caching for performance (React Query)

### ✅ Week 7-8: Itinerary Regeneration (COMPLETE)
- [x] Update smart itinerary generator API
- [x] Implement must_include_place_ids logic
- [x] Implement re-clustering with new places
- [x] Add place integration service
- [x] Test regeneration flow

### ✅ Week 9-10: Day-Level Integration (COMPLETE)
- [x] Day-level bulk add API endpoint ✅
- [x] Day-level filtering in Explore API ✅
- [x] User subscription system (is_pro column) ✅
- [x] Subscription status API endpoint ✅
- [x] Daily swipe limit logic (50 for free, unlimited for Pro) ✅
- [x] Advanced filters for Pro tier (budget, maxDistance) ✅
- [x] Add "Add activities" button to days (UI component) ✅
- [x] Create drawer/sheet for day-specific Explore ✅
- [x] Test day-level flow end-to-end ✅
- [x] Trip invitation linking feature ✅

### ✅ Week 11-12: Day-Level Integration & Polish (COMPLETE)
- [x] Implement advanced filters (Pro tier) - Budget and maxDistance ✅
- [x] Add swipe limit logic ✅
- [x] Day-level "Add activities" button in itinerary UI ✅
- [x] Day-level Explore drawer/sheet integration ✅
- [x] Pre-filtering by day's neighborhood and time slot ✅
- [x] Immediate add-to-day on swipe right in day mode ✅
- [x] Full ExploreDeck day mode integration ✅
- [x] Trip invitation linking API and UI integration ✅
- [ ] Implement travel stats tracking (Future)
- [ ] Add badges system (Future)
- [ ] Additional advanced filters (vibe, theme, accessibility) (Future)
- [ ] Performance optimization
- [ ] Testing and bug fixes

---

## Technical Considerations

### Performance
- Cache Google Places API responses
- Batch place detail fetches
- Lazy load place cards
- Optimize swipe animations

### User Experience
- Smooth swipe animations
- Instant feedback on swipe actions
- Clear visual indicators for limits
- Helpful error messages
- Undo functionality (future)

### Data Management
- Store minimal data (place_ids, not full place objects)
- Fetch place details on-demand
- Clean up old explore sessions
- Handle API rate limits gracefully

### Testing
- Unit tests for swipe logic
- Integration tests for API endpoints
- E2E tests for full flow
- Performance tests for large place lists

---

## Dependencies

### New Packages Needed
- `framer-motion` (already installed) - For swipe animations
- `react-spring` (optional) - Alternative animation library
- `react-use-gesture` (optional) - Enhanced gesture handling

### API Quotas
- Google Places API: Nearby Search, Place Details
- Monitor usage and implement caching
- Consider upgrading API tier if needed

---

## Success Metrics

### Engagement
- Average swipes per session
- Places liked per trip
- Time spent in Explore tab
- Conversion from Explore to itinerary update

### Business
- Free tier swipe limit effectiveness
- Pro tier upgrade rate from Explore
- User retention after Explore feature launch

### Technical
- API response times
- Swipe gesture responsiveness
- Error rates
- Cache hit rates

---

## Future Enhancements (Post-MVP)

- Undo last swipe
- Swipe history/review
- Share liked places with trip members
- Collaborative swiping (group decisions)
- AI-powered place recommendations based on swipe patterns
- Swipe analytics dashboard
- Social features (see what friends liked)

---

**Next Action:** Start with database schema and API endpoints (Week 1-2)

