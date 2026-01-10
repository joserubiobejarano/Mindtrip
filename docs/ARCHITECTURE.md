# Kruno - Architecture Documentation

> **Last Updated:** January 2025  
> **Focus:** System Architecture & Data Flow

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Data Flow](#data-flow)
4. [Explore Feature Architecture](#explore-feature-architecture)
5. [Itinerary Generation Flow](#itinerary-generation-flow)
6. [Database Schema](#database-schema)
7. [API Architecture](#api-architecture)
8. [Frontend Architecture](#frontend-architecture)
9. [Integration Points](#integration-points)

---

## System Overview

Kruno is a full-stack Next.js application with the following architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js 15)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │  Components  │  │    Hooks    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js API Routes                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Trip APIs   │  │  Explore APIs │  │   AI APIs    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Supabase   │  │   OpenAI     │  │ Google Places│
│  (Database)  │  │    API       │  │     API      │
└──────────────┘  └──────────────┘  └──────────────┘
        │
        ▼
┌──────────────┐
│    Clerk     │
│ (Auth)       │
└──────────────┘
```

---

## Architecture Diagram

### High-Level Architecture

```
User Browser
    │
    ├─► Next.js App Router (Frontend)
    │   ├─► React Components
    │   ├─► React Query (State Management)
    │   └─► Framer Motion (Animations)
    │
    ├─► Next.js API Routes (Backend)
    │   ├─► /api/trips/* (Trip Management)
    │   ├─► /api/explore/* (Explore Feature)
    │   ├─► /api/ai/* (AI Features)
    │   └─► /api/accommodation/* (Hotels)
    │
    └─► External Services
        ├─► Supabase (Database + Realtime)
        ├─► Clerk (Authentication)
        ├─► OpenAI (AI Generation)
        ├─► Google Places API (Places Data)
        └─► Google Maps (Maps & Places)
```

### Data Flow Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  1. Create Trip / Search City       │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  2. Generate Smart Itinerary        │
│     (OpenAI + Google Places)        │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  3. Display Itinerary                │
│     (SmartItinerary format)          │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  4. User Swipes Places in Explore   │
│     (Tinder-style interface)        │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  5. Store Liked Places              │
│     (explore_sessions table)         │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  6. Regenerate Itinerary            │
│     (with liked places)              │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  7. Updated Itinerary Display       │
└─────────────────────────────────────┘
```

---

## Data Flow

### New Product Flow (With Explore Feature)

1. **Trip Creation**
   - User creates trip with city + dates
   - Trip stored in `trips` table
   - Days auto-generated in `days` table

2. **Initial Itinerary Generation**
   - User triggers itinerary generation
   - API: `POST /api/trips/[tripId]/smart-itinerary`
   - OpenAI generates SmartItinerary structure
   - Google Places API enriches with photos
   - Stored in `smart_itineraries` table

3. **Explore Session Creation**
   - User opens Explore tab
   - API: `GET /api/trips/[tripId]/explore/places`
   - Fetches places from Google Places API
   - Filters out places already in itinerary
   - Creates/loads `explore_sessions` record

4. **Swipe Actions**
   - User swipes on place cards
   - API: `POST /api/trips/[tripId]/explore/swipe`
   - Updates `liked_places` or `discarded_places` arrays
   - Increments `swipe_count`
   - Checks swipe limits (free tier)

5. **Itinerary Regeneration**
   - User clicks "Add to itinerary"
   - API: `POST /api/trips/[tripId]/smart-itinerary`
   - Body includes `must_include_place_ids`
   - OpenAI regenerates with new places
   - Re-clusters by neighborhood
   - Updates `smart_itineraries` table

6. **Display Updated Itinerary**
   - Frontend fetches updated SmartItinerary
   - Displays with new places highlighted
   - Shows success notification

---

## Explore Feature Architecture

### Component Hierarchy

```
ExploreTab
├── ExploreFilters (optional - Pro tier)
├── ExploreDeck
│   ├── SwipeableCard (stack of cards)
│   │   ├── PlaceImage
│   │   ├── PlaceInfo
│   │   │   ├── PlaceName
│   │   │   ├── Category
│   │   │   ├── Neighborhood
│   │   │   ├── Rating
│   │   │   └── Tags
│   │   └── SwipeActions
│   └── EmptyState
├── SwipeCounter
└── AddToItineraryButton
```

### State Management

```typescript
// Explore Tab State
interface ExploreState {
  places: ExplorePlace[];
  currentIndex: number;
  likedPlaces: string[];  // place_ids
  discardedPlaces: string[];
  swipeCount: number;
  remainingSwipes: number;
  isLoading: boolean;
  hasMore: boolean;
  filters: ExploreFilters;
}
```

### API Integration Flow

```
Frontend Component
    │
    ├─► useExplorePlaces() hook
    │   └─► GET /api/trips/[tripId]/explore/places
    │       └─► Google Places API
    │
    ├─► handleSwipe() function
    │   └─► POST /api/trips/[tripId]/explore/swipe
    │       └─► Update explore_sessions table
    │
    └─► handleAddToItinerary() function
        └─► POST /api/trips/[tripId]/smart-itinerary
            ├─► Get liked places from explore_sessions
            ├─► Get existing places from smart_itineraries
            ├─► Call OpenAI with must_include_place_ids
            └─► Update smart_itineraries table
```

---

## Itinerary Generation Flow

### Smart Itinerary Generation

```
User Action: Generate/Regenerate Itinerary
    │
    ▼
POST /api/trips/[tripId]/smart-itinerary
    │
    ├─► Load Trip Data
    │   └─► trips table
    │
    ├─► Load Days
    │   └─► days table
    │
    ├─► Load Saved Places (optional)
    │   └─► saved_places table
    │
    ├─► Load Liked Places (if regenerating)
    │   └─► explore_sessions.liked_places
    │
    ├─► Build OpenAI Prompt
    │   ├─► Trip details
    │   ├─► Days information
    │   ├─► Saved places
    │   └─► Must include places (from Explore)
    │
    ├─► Call OpenAI API
    │   └─► GPT-4o-mini with JSON mode
    │
    ├─► Validate Response
    │   └─► Zod schema validation
    │
    ├─► Enrich with Photos
    │   └─► Google Places API (place photos)
    │
    └─► Save to Database
        └─► smart_itineraries table
```

### Itinerary Regeneration with Liked Places

```
User Clicks "Add to Itinerary"
    │
    ▼
1. Get Liked Places
   └─► explore_sessions.liked_places
    │
    ▼
2. Get Existing Places
   └─► smart_itineraries.content (extract place_ids)
    │
    ▼
3. Fetch Place Details
   └─► Google Places API (Place Details)
    │
    ▼
4. Build Regeneration Prompt
   ├─► Original itinerary structure
   ├─► Must include: liked places
   ├─► Already planned: existing places
   └─► Instructions: re-cluster, preserve structure
    │
    ▼
5. Call OpenAI
   └─► Generate updated SmartItinerary
    │
    ▼
6. Validate & Enrich
   ├─► Zod validation
   └─► Photo enrichment
    │
    ▼
7. Update Database
   └─► smart_itineraries table
    │
    ▼
8. Clear Explore Session (optional)
   └─► Reset liked_places array
```

---

## Database Schema

### Core Tables

**trips**
- Stores trip information
- Links to days, activities, members

**days**
- Auto-generated days for trip date range
- Links to activities

**activities**
- Activities/places in itinerary
- Links to places table

**places**
- Place information (Google Places data)
- Can be linked to multiple activities

**smart_itineraries**
- Cached AI-generated itineraries
- JSONB column stores SmartItinerary structure
- `trip_segment_id` column for multi-city trips (NULL for single-city trips)

**advisor_messages** ✅ **NEW**
- Travel Advisor chat history (pre-trip planning)
- Schema: `id`, `user_id`, `role` ('user' | 'assistant'), `content`, `created_at`
- Indexes: `idx_advisor_messages_user_created`, `idx_advisor_messages_user_id`
- RLS policies for user access
- Migration file: `database/migrations/supabase-add-advisor-messages.sql`

**trip_regeneration_stats** ✅ **NEW**
- Tracks daily regeneration counts per trip for Smart Itinerary regeneration limits
- Schema: `id`, `trip_id`, `date`, `count`, `created_at`, `updated_at`
- UNIQUE constraint on (trip_id, date) for per-day tracking
- Indexes: `idx_trip_regeneration_stats_trip_id`, `idx_trip_regeneration_stats_date`, `idx_trip_regeneration_stats_trip_date`
- Used to enforce daily regeneration limits (2 for free tier, 5 for Pro tier)
- Migration file: `database/migrations/supabase-add-regeneration-stats.sql`

**trip_segments** ✅ **NEW**
- Multi-city trip segments
- Each segment represents a city/portion of trip with date range
- Pro tier feature
- Schema: `id`, `trip_id`, `order_index`, `city_place_id`, `city_name`, `start_date`, `end_date`, `transport_type`, `notes`

**trip_members** ✅ **UPDATED**
- Trip collaborators and membership
- Usage tracking columns: `swipe_count`, `change_count`, `search_add_count` ✅ **NEW**
- Tracks per-user-per-trip usage for Explore features
- Migration file: `database/migrations/add-explore-usage-limits-to-trip-members.sql`
- Index: `idx_trip_members_usage` for performance

**trips** ✅ **UPDATED**
- Trip-level Pro unlock fields: `has_trip_pro`, `stripe_trip_payment_id` ✅ **NEW**
- `has_trip_pro`: Boolean flag for trip-level Pro unlock (one-time payment)
- `stripe_trip_payment_id`: Stores Stripe payment intent ID for trip unlock
- Migration file: `database/migrations/add-trip-pro-fields-to-trips.sql`
- Indexes: `idx_trips_has_trip_pro`, `idx_trips_stripe_trip_payment_id`

**profiles** ✅ **UPDATED**
- Billing fields: `stripe_customer_id` ✅ **NEW**
- Stores Stripe customer ID for subscription management
- Migration file: `database/migrations/add-stripe-customer-id-to-profiles.sql`

### New Tables for Explore Feature ✅ **IMPLEMENTED**

**explore_sessions** ✅
- **Location:** Migration file: `database/migrations/supabase-add-explore-sessions-table.sql`
- **Status:** ✅ Created and ready for use
- **Schema:**
  - `id` UUID PRIMARY KEY
  - `trip_id` UUID REFERENCES trips(id) ON DELETE CASCADE
  - `user_id` TEXT NOT NULL (Clerk user ID)
  - `liked_place_ids` TEXT[] DEFAULT '{}' (Google place_ids)
  - `discarded_place_ids` TEXT[] DEFAULT '{}' (Google place_ids)
  - `swipe_count` INTEGER DEFAULT 0
  - `last_swipe_at` TIMESTAMPTZ (for daily reset logic)
  - `created_at` TIMESTAMPTZ
  - `updated_at` TIMESTAMPTZ (auto-updated via trigger)
  - UNIQUE constraint on (trip_id, user_id)
  - Indexes: `idx_explore_sessions_trip_user`, `idx_explore_sessions_user_id`, `idx_explore_sessions_last_swipe` (from supabase-add-explore-indexes.sql)

**profiles.is_pro** ✅
- **Location:** Migration file: `database/migrations/add-is-pro-to-profiles.sql`
- **Status:** ✅ Implemented
- **Schema:**
  - `is_pro` BOOLEAN NOT NULL DEFAULT false
  - Index: `idx_profiles_is_pro` (for faster Pro user lookups)
  - Used by subscription status API to determine user tier

**profiles.clerk_user_id** ✅ **NEW**
- **Location:** Migration files: 
  - `database/migrations/add-clerk-user-id-to-profiles.sql` - Adds column and backfills data
  - `database/migrations/add-unique-index-clerk-user-id.sql` - Adds unique index
- **Status:** ✅ Implemented
- **Schema:**
  - `clerk_user_id` TEXT (nullable initially for existing records)
  - Unique index: `idx_profiles_clerk_user_id` (enforces one profile per Clerk user)
  - Regular index: `idx_profiles_clerk_user_id_lookup` (for performance)
  - Backfills existing profiles that had Clerk IDs in the `id` column
  - Enables proper profile lookup by Clerk user ID without UUID conflicts

**user_travel_stats** (Future - Pro tier)
```sql
CREATE TABLE user_travel_stats (
  user_id TEXT PRIMARY KEY,
  total_places_liked INTEGER,
  total_places_visited INTEGER,
  countries_visited TEXT[],
  categories_explored TEXT[],
  badges_earned TEXT[],
  updated_at TIMESTAMP
);
```

### Relationships

```
trips
  ├─► days (1:N)
  ├─► activities (1:N)
  ├─► trip_members (1:N)
  ├─► smart_itineraries (1:1 or 1:N with segments)
  ├─► explore_sessions (1:N)
  └─► trip_segments (1:N) ✅ NEW

trip_segments ✅ NEW
  ├─► trips (N:1)
  ├─► days (1:N)
  ├─► smart_itineraries (1:1)
  └─► explore_sessions (1:N)

explore_sessions
  └─► trips (N:1)
  └─► trip_segments (N:1) ✅ NEW
  └─► user_id → profiles (N:1)

activities
  ├─► days (N:1)
  └─► places (N:1)

days
  ├─► trips (N:1)
  └─► trip_segments (N:1) ✅ NEW (NULL for single-city trips)

smart_itineraries
  ├─► trips (N:1)
  └─► trip_segments (N:1) ✅ NEW (NULL for single-city trips)
```

---

## API Architecture

### API Route Structure

```
/app/api/
├── trips/
│   ├── route.ts                      # ✅ NEW: GET (list trips), POST (create trip)
│   └── [tripId]/
│       ├── route.ts                  # ✅ NEW: DELETE (delete trip with cascade cleanup)
│       ├── assistant/                # ✅ NEW: Enhanced Trip Assistant (with moderation)
│       ├── chat/                     # Trip Assistant (legacy)
│       ├── segments/                 # ✅ NEW: Trip segments API (multi-city trips, Pro tier)
│       ├── itinerary-chat/           # Itinerary editing
│       ├── smart-itinerary/          # Itinerary generation
│       │   └── place/                # Place updates
│       ├── activities/               # ✅ NEW: Activity management
│       │   └── [activityId]/
│       │       └── replace/         # ✅ NEW: Replace activity with usage limits
│       └── explore/                  # ✅ IMPLEMENTED: Explore feature
│           ├── places/               # ✅ GET: Fetch places
│           ├── swipe/                # ✅ POST: Record swipe (like/dislike/undo)
│           └── session/              # ✅ GET/DELETE: Session management
│       └── days/                     # ✅ IMPLEMENTED: Day-level integration (Backend Complete)
│           └── [dayId]/
│               └── activities/
│                   └── bulk-add-from-swipes/  # ✅ POST: Add places to day/slot (morning/afternoon/evening)
├── places/                           # ✅ NEW: Places API
│   └── city-autocomplete/            # ✅ NEW: City autocomplete (GET/POST)
├── user/
│   ├── subscription-status/          # ✅ GET: User subscription status (checks is_pro column)
│   └── link-trip-invitations/        # ✅ POST: Link email invitations to user accounts
├── advisor/                          # ✅ NEW: Travel Advisor (pre-trip planning)
│   └── route.ts                      # ✅ GET/POST: Advisor chat history and messages
├── billing/                          # ✅ NEW: Billing and subscription management
│   ├── checkout/
│   │   ├── subscription/            # ✅ POST: Create Stripe checkout for Pro subscription
│   │   └── trip/                    # ✅ POST: Create Stripe checkout for trip Pro unlock
│   ├── portal/                      # ✅ GET: Stripe customer portal session
│   └── webhook/                     # ✅ POST: Stripe webhook handler for subscription events
├── images/                           # ✅ NEW: Image caching system
│   └── cache-place-image/           # ✅ POST: Cache place images in Supabase Storage
├── ai/
│   └── plan-day/                    # AI day planning
├── ai-itinerary/                    # Legacy itinerary (updated with segment support)
├── accommodation/
│   └── find/                        # Hotel search
└── intent/
    └── travel/                      # Future: Intent detection
```

### API Response Patterns

**Success Response:**
```typescript
{
  data: T;
  success: true;
}
```

**Error Response:**
```typescript
{
  error: string;
  details?: any;
  status: number;
}
```

### Authentication

- All API routes use Clerk authentication
- User ID extracted from Clerk session
- RLS policies enforce data access

---

## Frontend Architecture

### Component Structure

```
app/
├── (auth)/                          # Auth pages
├── trips/
│   └── [tripId]/
│       └── page.tsx                 # Trip detail page
│           └── TripShell
│               └── TripTabs
│                   ├── ItineraryTab ✅ **ENHANCED**
│                   ├── ExploreTab (updated) ✅
│                   ├── ExpensesTab
│                   └── ChecklistsTab
└── components/
    ├── app-header.tsx                # ✅ NEW: Unified app header with Logo
    ├── ui/
    │   └── logo.tsx                  # ✅ NEW: Reusable Logo component
    ├── itinerary-tab.tsx             # ✅ ENHANCED: Day-level Explore integration
    ├── day-accordion-header.tsx      # ✅ NEW: Accordion-style day headers
    ├── explore/                      # ✅ IMPLEMENTED: Explore components
    │   ├── SwipeableCard.tsx ✅
    │   ├── ExploreDeck.tsx ✅
    │   ├── ExploreFilters.tsx ✅
    │   └── SwipeCounter.tsx ✅
    └── itinerary/
        └── (day-level integration now in itinerary-tab.tsx) ✅
```

### State Management

**React Query (TanStack Query)**
- Server state management
- Caching and refetching
- Optimistic updates

**Local State (useState)**
- UI state (modals, drawers)
- Form state
- Component-specific state

**Supabase Realtime**
- Real-time updates for:
  - Activities
  - Places
  - Checklists
  - Trip members

### Hooks Structure

```
hooks/
├── use-trip.ts                      # Trip data
├── use-activities.ts                # Activities
├── use-days.ts                      # Days
├── use-realtime-activities.ts       # Real-time activities
├── use-realtime-checklists.ts       # Real-time checklists
└── use-explore.ts                   # ✅ IMPLEMENTED: Explore feature
    ├── useExplorePlaces() ✅ (supports day-level filtering, Pro tier filters)
    ├── useExploreSession() ✅
    └── useSwipeAction() ✅ (supports undo functionality)
```

### Utilities & Helpers

```
lib/
├── routes.ts                        # ✅ NEW: Route helper utilities (getTripUrl)
├── supabase/                        # Supabase clients and helpers
│   ├── user-subscription.ts         # Subscription status checking
│   └── explore-integration.ts       # Explore feature integration
├── google/                          # Google Places integration
└── auth/
    └── getProfileId.ts              # Profile ID lookup (uses clerk_user_id)
```

---

## Integration Points

### Google Places API

**Endpoints Used:**
- Text Search (hotel search)
- Nearby Search (places in destination)
- Place Details (place information)
- Place Photos (place images)

**Rate Limits:**
- Monitor usage
- Implement caching
- Batch requests when possible

### OpenAI API

**Usage:**
- Smart Itinerary generation
- Day planning
- Trip Assistant chat
- Itinerary editing

**Models:**
- GPT-4o-mini (primary)
- JSON mode for structured responses

**Caching:**
- Store generated itineraries in database
- Regenerate only when needed

### Google Maps

**Services:**
- Map display (Google Maps API)
- Places search and autocomplete
- Place details and photos
- Hotel search

### Supabase

**Features:**
- PostgreSQL database
- Realtime subscriptions
- Row Level Security (RLS)
- Storage (if needed)

### Clerk

**Features:**
- Authentication
- User management
- Session management
- OAuth providers (Google)

---

## Data Flow: Explore Feature

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Opens Explore Tab                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  GET /api/trips/[tripId]/explore/places                    │
│  - Fetch places from Google Places API                     │
│  - Filter by destination                                    │
│  - Exclude places in itinerary (if toggle on)               │
│  - Apply filters (neighborhood, category, etc.)             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Display Swipeable Cards                                     │
│  - Show one card at a time                                  │
│  - Display place info, photo, rating, tags                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  User Swipes (Right = Like, Left = Dislike)                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  POST /api/trips/[tripId]/explore/swipe                     │
│  - Update explore_sessions table                            │
│  - Add to liked_places or discarded_places                  │
│  - Increment swipe_count                                    │
│  - Check swipe limits                                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  User Clicks "Add to Itinerary"                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  POST /api/trips/[tripId]/smart-itinerary                   │
│  - Get liked_places from explore_sessions                   │
│  - Get existing places from smart_itineraries               │
│  - Regenerate itinerary with must_include_place_ids          │
│  - Re-cluster by neighborhood                                │
│  - Update smart_itineraries table                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Display Updated Itinerary                                   │
│  - Show new places highlighted                                │
│  - Show success notification                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Performance Considerations

### Caching Strategy

1. **Google Places API**
   - Cache place details
   - Cache place photos
   - TTL: 24 hours

2. **OpenAI Responses**
   - Store in `smart_itineraries` table
   - Only regenerate when needed

3. **React Query**
   - Cache API responses
   - Stale time: 5 minutes
   - Refetch on window focus

### Optimization

1. **Lazy Loading**
   - Load place cards on demand
   - Virtual scrolling for large lists

2. **Image Optimization**
   - Use Google Places photo API with size limits
   - Lazy load images
   - Use Next.js Image component

3. **Database Queries**
   - Use indexes on foreign keys
   - Limit result sets
   - Use pagination

---

## Security Considerations

### Authentication
- All API routes require authentication
- Clerk handles session management
- RLS policies enforce data access

### Data Validation
- Zod schemas for API inputs
- TypeScript for type safety
- Sanitize user inputs

### API Keys
- Never expose API keys to client
- Use environment variables
- Rotate keys regularly

### Rate Limiting
- Implement swipe limits (free tier)
- Monitor API usage
- Handle rate limit errors gracefully

---

## Implementation Status

### ✅ Explore Feature - COMPLETE (Phases 15-16)

**Phase 15: Tinder-Style Place Discovery** ✅
- Database: `explore_sessions` table created and migrated with indexes
- API: All endpoints implemented (`/api/trips/[tripId]/explore/*`)
- Frontend: All components implemented (ExploreDeck, SwipeableCard, ExploreFilters, SwipeCounter)
- Hooks: use-explore.ts with React Query integration
- Integration: Google Places API for place discovery (`lib/google/explore-places.ts`)
- Subscription: User subscription checking (`lib/supabase/user-subscription.ts`)
- User API: `/api/user/subscription-status` endpoint
- Features: Undo swipe, day-level filtering, Pro tier filters (budget, maxDistance)

**Phase 16: Itinerary Regeneration** ✅
- Smart itinerary generator updated to support `must_include_place_ids`
- Preserve structure option implemented (`preserve_structure` parameter)
- Re-clustering logic implemented
- Integration helpers: `lib/supabase/explore-integration.ts`
- Clear liked places after successful regeneration
- Day-level bulk add: `/api/trips/[tripId]/days/[dayId]/activities/bulk-add-from-swipes`

**Phase 17: Day-Level Integration** ✅ **COMPLETE**

**Phase 18: Multi-City Trip Support** ✅ **COMPLETE**
- Database: `trip_segments` table created
- API: All segment endpoints implemented (`/api/trips/[tripId]/segments`)
- Frontend: Multi-city trip creation in TripPersonalizationDialog
- Integration: Days, itineraries, and explore sessions support segments
- Pro tier restriction implemented

**Phase 19: Trip Personalization** ✅ **COMPLETE**
- Database: Trip personalization fields added to `trips` table
- Frontend: TripPersonalizationDialog component
- Features: Origin city, travelers, accommodation, arrival info, interests

**Phase 20: Enhanced Trip Assistant** ✅ **COMPLETE**
- API: New `/api/trips/[tripId]/assistant` endpoint
- Features: Chat moderation, segment-aware responses, day-aware responses
- Multi-city trip context support

**Phase 21: Travel Advisor (Pre-Trip Planning)** ✅ **COMPLETE**
- API: `/api/advisor` endpoint (GET and POST)
- Database: `advisor_messages` table for chat history
- Features: Pre-trip planning, daily message limits, chat moderation
- Onboarding flow that creates trips directly from advisor
- Integration with homepage search
- Transport guidance for multi-city and regional trips
- Migration file: `database/migrations/supabase-add-advisor-messages.sql`

**Billing & Subscriptions** ✅ **NEW** (January 2025)
- **Complete Stripe Integration**: Full billing system for Pro subscriptions and trip-level unlocks
- **API Endpoints**:
  - `POST /api/billing/checkout/subscription` - Create Stripe checkout for account-level Pro subscription
  - `POST /api/billing/checkout/trip` - Create Stripe checkout for trip-level Pro unlock (one-time payment)
  - `GET /api/billing/portal` - Get Stripe customer portal session for subscription management
  - `POST /api/billing/webhook` - Handle Stripe webhook events (subscription created/updated/deleted, checkout completed)
- **Database Schema**:
  - `profiles.stripe_customer_id` - Stripe customer ID for subscription management
  - `profiles.is_pro` - Account-level Pro subscription status (updated via webhook)
  - `trips.has_trip_pro` - Trip-level Pro unlock status (one-time payment)
  - `trips.stripe_trip_payment_id` - Payment intent ID for trip unlock tracking
- **Migration Files**:
  - `add-stripe-customer-id-to-profiles.sql` - Adds `stripe_customer_id` column
  - `add-is-pro-to-profiles.sql` - Adds `is_pro` column with index
  - `add-trip-pro-fields-to-trips.sql` - Adds `has_trip_pro` and `stripe_trip_payment_id` columns
- **Webhook Events Handled**:
  - `checkout.session.completed` - Activates trip Pro unlock
  - `customer.subscription.created` - Sets `is_pro = true`
  - `customer.subscription.updated` - Updates `is_pro` based on status
  - `customer.subscription.deleted` - Sets `is_pro = false`
- **Pro Status Logic**: `isProForThisTrip = isAccountPro OR isTripPro` (implemented in `lib/supabase/pro-status.ts`)

**Image Caching System** ✅ **NEW** (January 2025)
- **Production-Proof Image Storage**: Stores place images in Supabase Storage for stable URLs
- **API Endpoint**: `POST /api/images/cache-place-image` - Caches images from multiple sources
- **Health Check**: `GET /api/debug/image-cache-health` - Verifies system configuration
- **Image Sources** (priority order):
  1. Google Places Photo API (if `photoRef` provided)
  2. Unsplash search API (fallback)
  3. Mapbox static map API (last resort, uses coordinates)
- **Storage Details**:
  - Bucket: `place-images` (PUBLIC, must be created manually in Supabase Dashboard)
  - File path format: `place-images/{provider}/{sha1_hash}.jpg`
  - Deterministic paths prevent duplicate uploads
  - Always stored as `.jpg` extension
- **Requirements**:
  - `SUPABASE_SERVICE_ROLE_KEY` (REQUIRED) - Used for uploads (bypasses RLS)
  - `GOOGLE_MAPS_API_KEY` (recommended) - For Google Places photos
  - `UNSPLASH_ACCESS_KEY` (optional) - For Unsplash fallback
  - `MAPBOX_ACCESS_TOKEN` (optional) - For Mapbox static maps
- **See [images.md](./images.md) for complete documentation**

**Trip Regeneration Stats** ✅ **NEW** (January 2025)
- **Database**: `trip_regeneration_stats` table for tracking daily regeneration counts per trip
- **Daily Limits**: 2 regenerations/day for free tier, 5 for Pro tier
- **Migration File**: `database/migrations/supabase-add-regeneration-stats.sql`
- **Usage**: Enforced in Smart Itinerary regeneration endpoint (`/api/trips/[tripId]/smart-itinerary`)
- **Schema**: UNIQUE constraint on (trip_id, date) for per-day tracking

**Security Architecture** ✅ **NEW** (January 2025)
- **Centralized Auth Helpers** (`lib/auth/`):
  - `requireAuth()` - Ensures user is authenticated
  - `requirePro()` - Ensures account-level Pro subscription
  - `requireTripAccess()` - Ensures user has access to trip (owner or member)
  - `requireTripOwner()` - Ensures user owns the trip
  - `requireTripPro()` - Ensures user has Pro (account or trip-level)
- **Input Validation** (`lib/validation/`):
  - Zod schemas for all API route inputs (`api-schemas.ts`)
  - Validation helpers: `validateBody()`, `validateQuery()`, `validateParams()`
  - Strict mode: Unknown fields are rejected
  - Type-safe validated data
- **Rate Limiting** (`lib/rate-limit/`):
  - In-memory rate limiter (can upgrade to Redis for multi-instance)
  - Protected endpoints: AI endpoints (10/min, 100/hour), Places (30/min, 500/hour), Assistant/Chat (20/min, 200/hour)
  - Rate limit headers in responses
- **XSS Protection**:
  - DOMPurify sanitization for user-generated content
  - Sanitization functions: `sanitizeHtml()`, `escapeHtml()`, `sanitizeUserContent()`, `sanitizeChatMessage()`
- **See [SECURITY.md](./SECURITY.md) for complete documentation**

**UI Components & Infrastructure** ✅ **NEW** (January 2025)
- **App Header Component**: Unified header with Logo, navigation, and user controls (`components/app-header.tsx`)
- **Logo Component**: Reusable branding component (`components/ui/logo.tsx`)
- **Enhanced Itinerary Tab**: Day-level Explore integration, usage limits, photo resolution (`components/itinerary-tab.tsx`)
- **AI Itinerary Enhancements**: Segment support, food limits, better photo matching (`app/api/ai-itinerary/route.ts`)
- **Google Places Utilities**: Enhanced photo fetching, city resolution, landmark detection (`lib/google/places-server.ts`)

**Infrastructure & UX Improvements** ✅ **NEW** (January 2025)
- Trip deletion: DELETE `/api/trips/[tripId]` endpoint with owner verification and cascade cleanup
- Route helpers: `lib/routes.ts` with `getTripUrl()` for centralized URL construction
- Clerk user ID migrations: Profile lookup improvements with `clerk_user_id` column and unique index
- Enhanced trip list: Past trips section, delete button, automatic invitation linking
- **City Autocomplete**: Enhanced destination search with Google Places Autocomplete
  - API: `/api/places/city-autocomplete` (GET and POST)
  - Component: `DestinationAutocomplete` for improved UX
  - Integrated into trip creation dialog
  - Supports location biasing for better results
- **Usage Limits System**: Per-user-per-trip usage tracking
  - Migration: `add-explore-usage-limits-to-trip-members.sql`
  - Tracks `swipe_count`, `change_count`, `search_add_count` per user per trip
  - Enforces limits based on Pro/free tier (see PRO_VS_FREE.md for limits)
- **Activity Replace Feature**: Smart replacement with context-aware suggestions
  - Endpoint: `/api/trips/[tripId]/activities/[activityId]/replace`
  - Usage limit enforcement (5 changes for free, unlimited for Pro)
  - Food place limit enforcement (max 1 per slot)
  - Past-day lock protection
  - Uses Explore Places API to find contextually relevant replacements
- **AI Itinerary Enhancements**: Segment support and food limits
  - Supports `trip_segment_id` for multi-city trips
  - Enforces max 1 food place per time slot (morning/afternoon/evening)
  - Improved photo matching with saved places
  - Better food place detection using Google Places types
- **Migration files**:
  - `database/migrations/add-clerk-user-id-to-profiles.sql`
  - `database/migrations/add-unique-index-clerk-user-id.sql`
  - `database/migrations/add-explore-usage-limits-to-trip-members.sql`

---

## Recent Changes Summary (January 2025)

### Added
- **Billing & Subscriptions System**: Complete Stripe integration with subscription and trip-level Pro unlocks
- **Image Caching System**: Production-proof image storage in Supabase Storage with multi-provider fallback
- **Trip Regeneration Stats**: Daily regeneration limit tracking per trip
- **Security Architecture**: Centralized auth helpers, input validation, rate limiting, XSS protection
- **Activity Replace Feature**: Smart activity replacement with usage limits and context-aware suggestions
- **City Autocomplete**: Enhanced destination search with Google Places Autocomplete API
- **Usage Limits System**: Per-user-per-trip tracking for swipes, changes, and search adds

### Changed
- **Pro vs Free Limits**: Updated swipe limits from 50/day to 10 per trip (free tier), 100 per trip (Pro tier)
- **Change Limits**: Added change_count limits (5 for free, unlimited for Pro)
- **Search Add Limits**: Added search_add_count limits (5 for free, unlimited for Pro)
- **Security**: All API routes now use centralized auth helpers and Zod validation
- **AI Itinerary**: Enhanced with food place limits (max 1 per time slot) and better detection

### Removed
- None (no features removed in this update)

**Last Updated:** January 2025

