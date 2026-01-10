# Kruno Development Roadmap

This document tracks the development progress of the Kruno travel planning application.

## ✅ Completed Features

### Phase 1 - Project Setup & Foundation
- [x] Next.js 15 with App Router setup
- [x] TypeScript configuration
- [x] Tailwind CSS styling system
- [x] shadcn/ui component library integration
- [x] Split layout design (40% sidebar, 60% map)
- [x] Supabase backend integration
- [x] Clerk authentication (Email/Password + Google OAuth)
- [x] Environment configuration

### Phase 2 - Data Model & Trip Management
- [x] Complete database schema (11 tables)
- [x] Row Level Security (RLS) policies
- [x] Trip creation, listing, and management
- [x] Auto-generation of days for trip date ranges
- [x] Trip member invitations and collaboration
- [x] Database migrations for schema updates
- [x] Trip invitation linking (link email invitations to user accounts after signup)
- [x] Trip deletion with cascade cleanup
- [x] Route helper utilities for URL construction
- [x] Clerk user ID migration and profile lookup improvements
- [x] City autocomplete for destination search (Google Places Autocomplete)
- [x] Usage limits tracking system (swipe_count, change_count, search_add_count)

### Phase 3 - Itinerary Builder & Map Integration
- [x] Day selector with date display
- [x] Activity CRUD operations (create, read, update, delete)
- [x] Google Maps integration
- [x] Interactive map with markers and popups
- [x] Place search using Google Places API
- [x] Activity-to-place linking
- [x] Collaborative trip editing
- [x] Realtime sync for activities
- [x] Activity ordering and time management

### Phase 4 - Explore Tab
- [x] Destination autocomplete search
- [x] Place discovery and exploration
- [x] Add places to itinerary functionality
- [x] Enhanced city autocomplete with Google Places Autocomplete API
- [x] Activity replace feature with usage limits and smart suggestions

### Phase 5 - Expenses & Checklists
- [x] Expense tracking with category support
- [x] Automatic balance calculation per person
- [x] Expense sharing among trip members
- [x] Multiple checklists per trip
- [x] Checklist items with checkbox states
- [x] Realtime sync for checklists
- [x] Multi-currency support

### Phase 6 - Sharing & Export
- [x] Public trip sharing with unique slugs
- [x] Read-only public view
- [x] Subtle watermark on public pages
- [x] PDF export functionality

### Phase 7 - AI-Powered Features
- [x] AI day planning using OpenAI GPT-4o-mini
- [x] Automatic activity suggestions based on trip details
- [x] Context-aware planning (considers budget, interests, existing activities)
- [x] One-click day planning from itinerary tab

### Phase 8 - User Settings & Preferences
- [x] User profile settings page
- [x] Display name customization
- [x] Default currency selection (30+ currencies)
- [x] Profile synchronization with Clerk

### Phase 9 - Advanced Map Features
- [x] Route visualization on map
- [x] Visual route lines connecting activities on map
- [x] Automatic route calculation for day itineraries
- [x] Place saving/bookmarking functionality
- [x] Saved places list in Explore tab
- [x] Quick access to saved places

### Phase 10 - Code Organization & Cleanup
- [x] Removed dead code (legacy itinerary-panel component)
- [x] Organized documentation files into `docs/` folder
- [x] Organized database files into `database/` folder
- [x] Created development roadmap
- [x] Created mobile app roadmap

### Phase 10.5 - UI Components & Infrastructure ✅ **NEW**
- [x] App Header component (`components/app-header.tsx`) with Logo, navigation, and user controls
- [x] Logo component (`components/ui/logo.tsx`) for consistent branding
- [x] Enhanced Itinerary Tab component with day-level Explore integration
- [x] Day-level "Add activities" buttons on each time slot (morning/afternoon/evening)
- [x] ExploreDeck integration in itinerary view for day-specific place discovery
- [x] Usage limits display and enforcement in itinerary UI
- [x] Photo resolution with cached image support
- [x] Past-day lock protection in itinerary editing
- [x] Activity count limits per day enforcement
- [x] Accordion-style day headers (`DayAccordionHeader` component)

### Phase 11 - AI-Powered Trip Assistant & Smart Features
- [x] Trip Assistant chat interface (AI-powered conversational assistant)
- [x] Chat message persistence and history
- [x] Context-aware trip assistance (considers trip details, dates, destination)
- [x] Smart Itinerary generation (full multi-day AI-generated itineraries)
- [x] Day-by-day itinerary with sections (Morning, Afternoon, Evening)
- [x] Activity suggestions with photos and descriptions
- [x] Hero image galleries for each day
- [x] Smart itinerary caching and regeneration
- [x] Integration with saved places in itinerary generation

### Phase 14 - Enhanced Smart Itinerary System
- [x] Structured itinerary schema using Zod validation (itinerary-schema.ts)
- [x] Smart itinerary generation with structured JSON format (SmartItinerary type)
- [x] Itinerary chat editing API (natural language editing of existing itineraries via `/api/trips/[tripId]/itinerary-chat`)
- [x] Place-level updates API (mark as visited, remove from itinerary via `/api/trips/[tripId]/smart-itinerary/place`)
- [x] Slot-based day structure (morning, afternoon, evening with grouped places)
- [x] Enhanced itinerary UI with image galleries and lightbox viewer
- [x] Area clustering and neighborhood-based place grouping
- [x] Trip tips and practical micro-tips in daily overviews
- [x] Place photos, descriptions, and tags in structured format
- [x] Dual itinerary system support (legacy AiItinerary format and new SmartItinerary format)
- [x] Automatic photo enrichment from Google Places API for places and days
- [x] Multi-city trip segment support (trip_segment_id parameter)
- [x] Food place limit enforcement (max 1 per time slot)
- [x] Improved food place detection using Google Places types
- [x] Enhanced AI itinerary route with better photo matching and city resolution
- [x] Generic city photo fallback functionality
- [x] Enhanced Google Places server utilities (photo fetching, city resolution, landmark detection)

### Phase 15 - Explore Feature: Tinder-Style Place Discovery ✅
- [x] Database schema for explore_sessions table (migration file created)
- [x] Database indexes for performance (supabase-add-explore-indexes.sql)
- [x] Tinder-style swipe UI for place discovery
- [x] Swipeable card deck component (ExploreDeck) with Framer Motion animations
- [x] Place card design with all required information
- [x] Swipe gestures and button alternatives
- [x] Undo swipe functionality
- [x] Store liked_places and discarded_places arrays
- [x] Toggle to show/hide places already in itinerary
- [x] "Add these to itinerary" button
- [x] Integration with Explore tab in trip detail view
- [x] API endpoints for fetching places and recording swipes
- [x] Daily swipe limits for free tier (50 swipes/day)
- [x] Swipe counter and limits UI
- [x] Subscription status checking (user-subscription.ts)
- [x] User subscription status API endpoint (/api/user/subscription-status)
- [x] Google Places integration for Explore
- [x] Day-level filtering support (filter by day_id)
- [x] Advanced filters for Pro tier (budget, maxDistance)

### Phase 16 - Explore Feature: Itinerary Regeneration with Liked Places ✅
- [x] Backend API for itinerary regeneration with liked places
- [x] Support for must_include_place_ids parameter in itinerary generator
- [x] Support for already_planned_place_ids parameter
- [x] Support for preserve_structure parameter
- [x] Re-clustering by neighborhood with new places
- [x] Duplication avoidance logic
- [x] Preserve day structure when possible (preserve_structure parameter)
- [x] Smart placement of liked places in appropriate time slots
- [x] Update SmartItinerary with new places
- [x] Progress indicators for regeneration
- [x] Clear liked places after successful regeneration
- [x] Day-level bulk add API endpoint (/api/trips/[tripId]/days/[dayId]/activities/bulk-add-from-swipes)
- [x] Add places to specific day and time slot (morning/afternoon/evening)

### Phase 12 - Accommodation & Hotel Search
- [x] Hotel search functionality using Google Places API
- [x] Hotel type filtering (hotel, hostel, apartment)
- [x] Budget range filtering
- [x] Hotel search results with ratings and reviews
- [x] Hotel details view with photos
- [x] Booking.com integration (external links)
- [x] Set accommodation for trip
- [x] Dedicated "Stay" page for accommodation search
- [x] Map integration for hotel locations
- [x] Accommodation auto-suggestion API endpoint (`/api/accommodation/find`)
- [x] Automatic best hotel recommendation based on trip destination

### Phase 13 - Google Places Integration
- [x] Full Google Places API integration
- [x] Place search by text and nearby search
- [x] Place details with photos
- [x] Place type filtering
- [x] Place saving/bookmarking functionality
- [x] Saved places integration with Explore tab
- [x] Place photo fetching for activities and itineraries
- [x] Server-side place photo API

## 🚧 In Progress

**Phase 17 - Explore Feature: Day-Level Integration & Advanced Filters** ✅ **COMPLETE**
- ✅ Backend API endpoints fully implemented
- ✅ Day-level filtering and bulk add working
- ✅ Pro tier filters (budget, maxDistance) implemented
- ✅ User subscription system implemented
- ✅ UI components for day-level integration implemented
  - ✅ "Add activities" button on each day/slot in itinerary view
  - ✅ Day-level Explore drawer/sheet with pre-filtered places
  - ✅ Pre-filters by day's neighborhood and time slot
  - ✅ Immediate add-to-day on swipe right in day mode
  - ✅ Full integration with ExploreDeck in day mode

## ✅ Recently Completed (January 2025)

### Phase 15 - Explore Feature: Tinder-Style Place Discovery ✅
- [x] Database schema for explore_sessions table (migration file created)
- [x] Tinder-style swipe UI for place discovery
- [x] Swipeable card deck component (ExploreDeck) with Framer Motion animations
- [x] Place card design with:
  - Place name, Google place_id, main photo
  - Category (museum, viewpoint, café, etc.)
  - Neighborhood/district
  - Rating + number of reviews
  - "Locals love this" / "Trending now" style tags
- [x] Swipe gestures (swipe right = like, swipe left = dislike, swipe up = details)
- [x] Button alternatives for swiping (left/right/up buttons)
- [x] Store liked_places and discarded_places arrays in explore_sessions table
- [x] Toggle to show/hide places already in itinerary
- [x] "Add these to itinerary" button integration
- [x] Integration with Explore tab in trip detail view
- [x] API endpoints for fetching places to explore (GET /api/trips/[tripId]/explore/places)
- [x] API endpoint for recording swipes (POST /api/trips/[tripId]/explore/swipe)
- [x] API endpoint for session management (GET/DELETE /api/trips/[tripId]/explore/session)
- [x] Daily swipe limits for free tier (50 swipes/day, configurable)
- [x] Swipe counter and limits UI (SwipeCounter component)
- [x] Subscription status checking (user-subscription.ts)
- [x] Google Places integration for Explore (explore-places.ts)
- [x] Explore session hooks (use-explore.ts)
- [x] Explore filters component (ExploreFilters)
- [x] Automatic exclusion of already swiped places
- [x] Automatic exclusion of places already in itinerary

### Phase 16 - Explore Feature: Itinerary Regeneration with Liked Places ✅
- [x] Backend API for itinerary regeneration with liked places
- [x] Support for must_include_place_ids parameter in itinerary generator
- [x] Support for already_planned_place_ids parameter
- [x] Re-clustering by neighborhood with new places
- [x] Duplication avoidance logic
- [x] Preserve day structure when possible (preserve_structure parameter)
- [x] Smart placement of liked places in appropriate time slots
- [x] Update SmartItinerary with new places
- [x] Progress indicators for regeneration (loading states in UI)
- [x] Clear liked places after successful regeneration
- [x] Integration with explore-integration.ts helpers

## 🎯 New Product Flow (Updated Direction)

The product flow has been updated to prioritize the Explore feature:

1. **User searches for city + dates**
2. **App instantly generates Smart Itinerary** (Day/Hour grouped itinerary)
3. **User visits Explore tab:**
   - Sees swipeable place cards (one at a time)
   - Swipe right = interested
   - Swipe left = not interested
   - Swipe up = view details (optional)
4. **After swiping, user clicks "Add these to my itinerary"**
5. **Backend regenerates itinerary with:**
   - `must_include_place_ids` (liked places)
   - `already_planned_place_ids` (existing places)
6. **Result: Updated itinerary that includes user-selected places**

This flow replaces the old explore tab approach and makes place discovery a core, engaging part of the trip planning experience.

## 📋 Planned Features

### Phase 15 - Explore Feature: Tinder-Style Place Discovery ✅ **COMPLETE**
_See "Recently Completed" section above for full details. All features have been implemented._

### Phase 16 - Explore Feature: Itinerary Regeneration with Liked Places ✅ **COMPLETE**
_See "Recently Completed" section above for full details. All features have been implemented._

### Phase 17 - Explore Feature: Day-Level Integration & Advanced Filters ✅ **COMPLETE**
**Backend Complete ✅:**
- [x] Day-level bulk add API endpoint (add places to specific day/slot) ✅
- [x] Day-level filtering support (filter by day_id in Explore API) ✅
- [x] Advanced filters for Pro tier (budget, maxDistance) ✅
- [x] User subscription system (is_pro column in profiles table) ✅
- [x] Subscription status API endpoint (`/api/user/subscription-status`) ✅
- [x] Daily swipe limit logic (50 for free tier, unlimited for Pro) ✅
- [x] Undo swipe functionality ✅

**Frontend/UI Complete ✅:**
- [x] "Add activities" button on each day/slot in itinerary UI ✅
- [x] Pre-filter Explore by day's neighborhood/time of day (UI integration) ✅
- [x] Day-level Explore drawer/sheet with filtered places ✅
- [x] Immediate add-to-day on swipe right in day mode ✅
- [x] Full integration with ExploreDeck component in day mode ✅

### Phase 18 - Multi-City Trip Support (Trip Segments) ✅
- [x] Trip segments table (trip_segments) for multi-city trips
- [x] Each segment represents a city/portion of trip with its own date range
- [x] Segment management API endpoints (GET/POST/PATCH/DELETE `/api/trips/[tripId]/segments`)
- [x] Pro tier restriction for multi-city trips
- [x] Segment-aware days (days linked to trip_segment_id)
- [x] Segment-aware smart itineraries (itineraries per segment)
- [x] Segment-aware explore sessions (explore sessions per segment)
- [x] Multi-city trip creation UI (TripPersonalizationDialog)
- [x] Auto-generation of days for each segment
- [x] Order-based segment management (order_index)
- [x] Migration files for segment support:
  - `supabase-add-trip-segments.sql` - Creates trip_segments table
  - `supabase-add-segment-id-to-days.sql` - Links days to segments
  - `supabase-add-trip-segment-to-itineraries.sql` - Links itineraries to segments
  - `supabase-add-segment-id-to-explore-sessions.sql` - Links explore sessions to segments

### Phase 19 - Trip Personalization ✅
- [x] Enhanced trip creation with personalization fields
- [x] Trip personalization dialog (TripPersonalizationDialog component)
- [x] Additional trip fields:
  - Travelers count
  - Origin city (origin_city_place_id, origin_city_name)
  - Accommodation details (has_accommodation, accommodation_place_id, accommodation_name, accommodation_address)
  - Arrival information (arrival_transport_mode, arrival_time_local)
  - Interests array (user preferences/interests)
- [x] Migration file: `supabase-add-trip-personalization.sql`
- [x] Integration with trip creation flow
- [x] Personalization payload type (TripPersonalizationPayload)

### Phase 20 - Enhanced Trip Assistant & Chat Moderation ✅
- [x] New Trip Assistant API endpoint (`/api/trips/[tripId]/assistant`)
- [x] Enhanced context awareness with segment and day support
- [x] Active segment context (activeSegmentId parameter)
- [x] Active day context (activeDayId parameter)
- [x] Multi-city trip context support
- [x] Segment-aware itinerary loading
- [x] Chat moderation system (`lib/chat-moderation.ts`)
- [x] Topic relevance checking (blocks non-travel topics)
- [x] Automatic redirect messages for off-topic queries
- [x] Improved system prompts for focused travel assistance
- [x] Integration with trip segments for multi-city responses

### Phase 21 - Travel Advisor (Pre-Trip Planning) ✅
- [x] Travel Advisor page (`/advisor`) for pre-trip planning questions
- [x] Travel Advisor API endpoint (`/api/advisor`) with GET and POST methods
- [x] Database table `advisor_messages` for chat history (migration file created)
- [x] Chat message persistence and history
- [x] Daily message limits (3 for free tier, 15 for Pro tier)
- [x] Chat moderation system (blocks non-travel topics)
- [x] Topic relevance checking for advisor conversations
- [x] React hook `use-advisor-chat.ts` for advisor chat integration
- [x] Helper functions in `lib/supabase/advisor-messages.ts`
- [x] Onboarding flow that creates trips directly from advisor
- [x] Integration with homepage search (routes to advisor for travel queries)
- [x] Starter prompts for common travel questions
- [x] Transport guidance for multi-city and regional trips
- [x] Trip creation suggestion after helpful exchanges

**Future Enhancements (Not in Phase 17):**
- [ ] AI suggestions for specific day/time slot
- [ ] Additional advanced filters for Explore (Pro tier):
  - Vibe filters (romantic, family-friendly, adventurous, etc.)
  - Theme filters (food, culture, nature, nightlife, etc.)
  - Accessibility filters
- [ ] Multi-city Explore support (Pro tier)
- [ ] Better clustering with advanced routing (Pro tier)
- [ ] Full travel stats and badges (Pro tier)
- [ ] Offline mode for Explore (Pro tier)
- [ ] Priority itinerary generation (Pro tier)

### Phase 22 - Enhanced User Experience
- [ ] Trip templates and presets
- [ ] Weather integration for trip dates
- [ ] Photo uploads and galleries (user-uploaded photos)
- [ ] Notes and journaling features
- [ ] Trip statistics and analytics
- [ ] Activity photo uploads

### Phase 23 - Advanced Collaboration
- [ ] Real-time chat for trip members (member-to-member chat, not AI)
- [ ] Activity voting/polling system
- [ ] Comment threads on activities
- [ ] Notification system
- [ ] Email invitations for trip members

### Phase 24 - Mobile App Development
- [ ] Native iOS and Android app (see [mobile-roadmap.md](./mobile-roadmap.md))
- [ ] Expo React Native implementation
- [ ] Offline mode support
- [ ] Push notifications
- [ ] Deep linking

### Phase 25 - Web Mobile Optimization
- [ ] Responsive design improvements
- [ ] Mobile-first itinerary view
- [ ] Offline mode support
- [ ] Progressive Web App (PWA) features

### Phase 26 - Advanced Features
- [ ] Budget tracking and alerts
- [ ] Enhanced booking service integrations (beyond Booking.com links)
- [ ] Calendar sync (Google Calendar, iCal)
- [ ] Export to various formats (CSV, JSON - PDF already implemented)
- [ ] Flight search and booking (placeholder page exists)

### Phase 27 - Performance & Scalability
- [ ] Image optimization and CDN
- [ ] Database query optimization
- [ ] Caching strategies
- [ ] Load testing and performance monitoring

## 🐛 Known Issues

_No known issues currently documented_

## 💰 Monetization Strategy (Future - Not Yet Built)

### Free Tier
- Limited daily swipes (30-50)
- Basic card info
- Up to X liked places added per itinerary
- Basic itinerary regeneration

### Pro Tier
- Unlimited swipes
- Advanced filters (vibe, budget, distance, themes)
- Better clustering + advanced routing
- Multi-city Explore
- Full travel stats and badges
- Offline mode
- Priority itinerary generation

See [monetization.md](./monetization.md) for complete strategy.

## 🎮 Behavioral Design Framework (Future Phases)

For later implementation phases:

- **Dopamine micro-dosing** → Swiping, micro badges
- **Onboarding to Aha moment** → Instant itinerary, then Explore
- **Rejection proof design** → Fallback options, undo, AI suggestions
- **Victory visualization** → Animations for matches, badges, trip completion
- **Value-first monetization** → Free core, paid accelerators
- **Post-trip quizzes** → Group engagement & virality
- **Badge system** → Flags for countries, categories, etc.

## 📝 Notes

- The application uses Clerk for authentication instead of Supabase Auth
- Database schema uses TEXT for user IDs to support Clerk's ID format
- Realtime features require enabling replication in Supabase dashboard
- Google Maps API key is required for map display, Places API, hotel search, and place photos
- OpenAI API key is required for AI day planning, smart itineraries, and Trip Assistant chat
- Additional database tables may need to be created manually:
  - `trip_chat_messages` - for Trip Assistant chat history
  - `smart_itineraries` - for cached AI-generated itineraries (stores structured JSON with Zod schema validation)
  - `saved_places` - migration file exists in `database/migrations/supabase-add-saved-places-table.sql`
  - **`explore_sessions`** - ✅ **IMPLEMENTED** For Explore feature (Tinder-style swipe) - Migration file: `database/migrations/supabase-add-explore-sessions-table.sql`
  - **`profiles.is_pro`** - ✅ **IMPLEMENTED** For user subscription status - Migration file: `database/migrations/add-is-pro-to-profiles.sql`
  - **`profiles.clerk_user_id`** - ✅ **IMPLEMENTED** For Clerk user ID lookup - Migration files: 
    - `database/migrations/add-clerk-user-id-to-profiles.sql` - Adds column and backfills data
    - `database/migrations/add-unique-index-clerk-user-id.sql` - Adds unique index
  - **`trip_segments`** - ✅ **IMPLEMENTED** For multi-city trips (Pro tier) - Migration file: `database/migrations/supabase-add-trip-segments.sql`
- **Database Schema** (`database/supabase-schema.sql`) - ✅ **UPDATED** with Clerk authentication support (TEXT for user IDs instead of UUID)
  - **`advisor_messages`** - ✅ **IMPLEMENTED** For Travel Advisor chat history (pre-trip planning) - Migration file: `database/migrations/supabase-add-advisor-messages.sql`
  - **Segment support columns** - ✅ **IMPLEMENTED**:
    - `days.trip_segment_id` - Links days to segments (`supabase-add-segment-id-to-days.sql`)
    - `smart_itineraries.trip_segment_id` - Links itineraries to segments (`supabase-add-trip-segment-to-itineraries.sql`)
    - `explore_sessions.trip_segment_id` - Links explore sessions to segments (`supabase-add-segment-id-to-explore-sessions.sql`)
  - **Trip personalization fields** - ✅ **IMPLEMENTED**:
    - Added to `trips` table via `supabase-add-trip-personalization.sql`:
      - `travelers`, `origin_city_place_id`, `origin_city_name`
      - `has_accommodation`, `accommodation_place_id`, `accommodation_name`, `accommodation_address`
      - `arrival_transport_mode`, `arrival_time_local`, `interests`
- Two itinerary systems are supported:
  - Legacy: `/api/ai-itinerary` - returns AiItinerary format (simpler structure)
  - New: `/api/trips/[tripId]/smart-itinerary` - returns SmartItinerary format (structured with slots, area clusters, trip tips)

## 🔌 API Endpoints Reference

### AI & Itinerary Generation
- `POST /api/ai/plan-day` - Generate AI activity suggestions for a specific day
  - Body: `{ tripId: string, dayId: string }`
  - Returns: `{ activities: PlannedActivity[] }`

- `POST /api/ai-itinerary` - Generate legacy format itinerary (AiItinerary)
  - Body: `{ tripId: string }`
  - Returns: `{ itinerary: AiItinerary, fromCache: boolean }`

- `POST /api/trips/[tripId]/smart-itinerary` - Generate new format smart itinerary (SmartItinerary)
  - Body (optional): `{ must_include_place_ids?: string[], already_planned_place_ids?: string[], preserve_structure?: boolean }`
  - Returns: `SmartItinerary` (structured format with slots, area clusters, trip tips)
  - Supports regeneration with liked places from Explore feature

- `GET /api/trips/[tripId]/smart-itinerary?mode=load` - Load existing smart itinerary
  - Returns: `SmartItinerary` or 404 if not found

- `POST /api/trips/[tripId]/itinerary-chat` - Edit itinerary via natural language chat
  - Body: `{ message: string }`
  - Returns: Updated `SmartItinerary`

- `PATCH /api/trips/[tripId]/smart-itinerary/place` - Update place in itinerary
  - Body: `{ dayId: string, placeId: string, visited?: boolean, remove?: boolean }`
  - Returns: `{ success: boolean }`

### Trip Assistant
- `POST /api/trips/[tripId]/chat` - Send message to Trip Assistant (legacy endpoint)
  - Body: `{ message: string }`
  - Returns: `{ message: string }` (assistant response)
  - Persists conversation history in `trip_chat_messages` table

- `POST /api/trips/[tripId]/assistant` - Enhanced Trip Assistant (NEW) ✅
  - Body: `{ message: string, activeSegmentId?: string, activeDayId?: string }`
  - Returns: `{ reply: string, meta: { usedSegments: string[], suggestions: [] } }`
  - Features:
    - Chat moderation (blocks non-travel topics)
    - Multi-city trip context support
    - Segment-aware responses
    - Day-aware responses
    - Enhanced context loading (segments, itineraries, days, activities)
    - Persists conversation history in `trip_chat_messages` table

### Travel Advisor (Pre-Trip Planning) ✅ NEW
- `GET /api/advisor` - Get advisor chat history
  - Query params: `limit`, `offset` (for pagination)
  - Returns: `{ messages: AdvisorMessage[] }`
  - Fetches chat history from `advisor_messages` table

- `POST /api/advisor` - Send message to Travel Advisor ✅
  - Body: `{ message: string }`
  - Returns: `{ ok: boolean, reply?: string, suggestedAction?: { type: "offer_create_trip" }, error?: string, maxMessagesPerDay?: number, isPro?: boolean, message?: string }`
  - Features:
    - Pre-trip planning assistance (destinations, regions, trip ideas)
    - Daily message limits (3 for free tier, 15 for Pro tier)
    - Chat moderation (blocks non-travel topics)
    - Conversation history (last 15-20 messages)
    - Transport guidance for multi-city and regional trips
    - Trip creation suggestions after helpful exchanges
    - Persists conversation history in `advisor_messages` table

### Accommodation
- `POST /api/accommodation/find` - Find best accommodation for a trip
  - Body: `{ tripId: string }`
  - Returns: `{ accommodation: AccommodationResult }`
  - Automatically saves to trip's `auto_accommodation` field

### Explore Feature
- `GET /api/trips/[tripId]/explore/places` - Fetch places to explore for destination
  - Query params: `limit`, `offset`, `exclude_planned`, `neighborhood`, `category`, `time_of_day`, `timeOfDay`, `day_id`, `budget`, `maxDistance`, `includeItineraryPlaces`, `excludePlaceId` (multiple)
  - Returns: `{ places: ExplorePlace[], hasMore: boolean, totalCount: number }`
  - Automatically excludes already swiped places and places in itinerary
  - Supports day-level filtering (day_id parameter)
  - Pro tier filters: budget, maxDistance

- `POST /api/trips/[tripId]/explore/swipe` - Record swipe action (like/dislike/undo)
  - Body: `{ place_id: string, action: 'like' | 'dislike' | 'undo' }`
  - Returns: `{ success: boolean, swipeCount: number, remainingSwipes: number | null, limitReached: boolean, undonePlaceId?: string }`
  - Enforces daily swipe limits (50 for free tier, unlimited for Pro)
  - Supports undo action to reverse last swipe

- `GET /api/trips/[tripId]/explore/session` - Get current explore session
  - Returns: `{ likedPlaces: string[], discardedPlaces: string[], swipeCount: number, remainingSwipes: number | null, dailyLimit: number | null }`
  - Creates session if it doesn't exist

- `DELETE /api/trips/[tripId]/explore/session` - Clear explore session
  - Returns: `{ success: boolean }`
  - Resets liked/discarded arrays and swipe count

### Day-Level Integration
- `POST /api/trips/[tripId]/days/[dayId]/activities/bulk-add-from-swipes` - Add places to specific day/slot
  - Body: `{ place_ids: string[], slot: 'morning' | 'afternoon' | 'evening' }`
  - Returns: `{ success: boolean, count: number, message: string }`
  - Adds places directly to specified day and time slot in SmartItinerary

### Trip Segments (Multi-City Trips) ✅ NEW
- `GET /api/trips/[tripId]/segments` - Fetch all segments for a trip
  - Returns: `{ segments: TripSegment[] }`
  - Pro tier feature - only Pro users can create multi-city trips

- `POST /api/trips/[tripId]/segments` - Create new segment (Pro-only)
  - Body: `{ cityPlaceId: string, cityName: string, nights: number, transportType?: string, notes?: string }`
  - Returns: `{ segment: TripSegment }`
  - Auto-generates days for the segment
  - Requires Pro subscription

- `PATCH /api/trips/[tripId]/segments` - Update segment (Pro-only)
  - Body: `{ segmentId: string, ...updates }`
  - Returns: `{ segment: TripSegment }`

- `DELETE /api/trips/[tripId]/segments?segmentId=<id>` - Delete segment (Pro-only)
  - Returns: `{ success: boolean }`

### Trip Management
- `DELETE /api/trips/[tripId]` - Delete a trip ✅ **NEW**
  - Deletes trip and all associated data (cascade deletes)
  - Requires trip ownership verification
  - Returns: `{ success: boolean, message: string }`
  - Location: `app/api/trips/[tripId]/route.ts`
  - Integrated into trips list UI with delete button and confirmation dialog

### User Management
- `GET /api/user/subscription-status` - Get user subscription status
  - Returns: `{ isPro: boolean }`
  - Checks user's subscription tier (Pro or free)
  - Uses `is_pro` column in `profiles` table
  - Migration file: `database/migrations/add-is-pro-to-profiles.sql`

- `POST /api/user/link-trip-invitations` - Link trip invitations to user account
  - Links trip_members entries with matching email to current user's account
  - Returns: `{ success: boolean, linkedCount: number }`
  - Called automatically when trips list loads to sync invitations
  - Allows invited users to see trips after signing up
  - Location: `app/api/user/link-trip-invitations/route.ts`

### Billing & Subscriptions ✅ NEW
- `POST /api/billing/checkout/subscription` - Create Stripe checkout session for Pro subscription
  - Body: `{ returnUrl?: string }`
  - Returns: `{ url: string }` (Stripe checkout URL)
  - Creates or retrieves Stripe customer
  - Creates checkout session for yearly Pro subscription
  - Location: `app/api/billing/checkout/subscription/route.ts`

- `POST /api/billing/checkout/trip` - Create Stripe checkout session for trip Pro unlock
  - Body: `{ tripId: string, returnUrl?: string }`
  - Returns: `{ url: string }` (Stripe checkout URL)
  - Creates one-time payment for trip Pro unlock
  - Location: `app/api/billing/checkout/trip/route.ts`

- `GET /api/billing/portal` - Get Stripe customer portal session
  - Returns: `{ url: string }` (Stripe portal URL)
  - Allows users to manage subscription, update payment method, view invoices
  - Location: `app/api/billing/portal/route.ts`

- `POST /api/billing/webhook` - Handle Stripe webhook events
  - Handles subscription events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
  - Updates `profiles.is_pro` based on subscription status
  - Updates `trips.has_trip_pro` for trip unlocks
  - Location: `app/api/billing/webhook/route.ts`

### Image Caching ✅ NEW
- `POST /api/images/cache-place-image` - Cache a place image in Supabase Storage
  - Body: `{ tripId: string, placeId?: string, title: string, city?: string, country?: string, photoRef?: string, lat?: number, lng?: number }`
  - Returns: `{ image_url: string, providerUsed: string, uploadOk: boolean }`
  - Caches image from Google Places, Unsplash, or Mapbox
  - Uses deterministic file paths to prevent duplicates
  - Location: `app/api/images/cache-place-image/route.ts`
  - See [images.md](./images.md) for complete documentation

- `GET /api/debug/image-cache-health` - Check image caching system health
  - Returns: `{ healthy: boolean, hasServiceRoleKey: boolean, canAccessPlaceImagesBucket: boolean, ... }`
  - Location: `app/api/debug/image-cache-health/route.ts`

### Travel Intent (Future)
- `POST /api/intent/travel` - Travel intent detection (placeholder for future use)

## 🔄 Recent Updates (January 2025)

- **2025-01-XX**: UI Components & Infrastructure ✅ **NEW**
  - **App Header Component** (`components/app-header.tsx`):
    - ✅ New unified app header with Logo component
    - ✅ Navigation links (Trips link for signed-in users)
    - ✅ Sign in/Sign up buttons for signed-out users
    - ✅ Settings link and UserButton for signed-in users
    - ✅ Language provider integration for internationalization
    - ✅ Responsive design with container layout
  - **Logo Component** (`components/ui/logo.tsx`):
    - ✅ Reusable Logo component with "Kruno" branding
    - ✅ Orange color scheme with custom font (Patrick Hand)
    - ✅ Used in app header and throughout the application
  - **Enhanced Itinerary Tab** (`components/itinerary-tab.tsx`):
    - ✅ Day-level Explore integration with "Add activities" buttons
    - ✅ ExploreDeck integration for day-specific place discovery
    - ✅ Pre-filtering by day's neighborhood and time slot
    - ✅ Immediate add-to-day functionality (swipe right adds to day/slot)
    - ✅ Usage limits display and enforcement
    - ✅ Photo resolution with cached image support
    - ✅ Past-day lock protection
    - ✅ Activity count limits per day
    - ✅ Enhanced UI with accordion-style day headers
  - **AI Itinerary Route Enhancements** (`app/api/ai-itinerary/route.ts`):
    - ✅ Multi-city trip segment support (`trip_segment_id` parameter)
    - ✅ Food place limit enforcement (max 1 per time slot)
    - ✅ Improved food place detection using Google Places types
    - ✅ Better photo matching with saved places
    - ✅ Enhanced photo deduplication logic
    - ✅ Generic city photo fallback when place photos unavailable
    - ✅ City resolution from coordinates for landmark destinations
  - **Google Places Server Utilities** (`lib/google/places-server.ts`):
    - ✅ Enhanced photo fetching with deduplication support
    - ✅ City resolution from lat/lng coordinates (`getCityFromLatLng`)
    - ✅ Landmark detection (`isLandmark`) for better destination handling
    - ✅ Place photo reference fetching by place_id
    - ✅ Generic city photo fallback functionality
    - ✅ Improved photo URL construction and caching

- **2025-01-XX**: Security Architecture ✅ **NEW**
  - **Centralized Auth System**:
    - ✅ Auth helpers in `lib/auth/` (requireAuth, requirePro, requireTripAccess, requireTripOwner, requireTripPro)
    - ✅ Consistent authorization across all API routes
    - ✅ Proper error handling and status codes
  - **Input Validation**:
    - ✅ Zod schemas for all API inputs (`lib/validation/api-schemas.ts`)
    - ✅ Validation helpers (`validateBody`, `validateQuery`, `validateParams`)
    - ✅ Type-safe validated data
  - **Rate Limiting**:
    - ✅ In-memory rate limiter (`lib/rate-limit/in-memory-limiter.ts`)
    - ✅ Protected endpoints: AI (10/min, 100/hour), Places (30/min, 500/hour), Assistant/Chat (20/min, 200/hour)
    - ✅ Rate limit headers in responses
  - **XSS Protection**:
    - ✅ DOMPurify sanitization for user-generated content
    - ✅ Sanitization functions for different content types
  - **See [SECURITY.md](./SECURITY.md) for complete documentation**

- **2025-01-XX**: Billing & Subscriptions ✅ **NEW**
  - **Stripe Integration**:
    - ✅ Subscription checkout API (`/api/billing/checkout/subscription`)
    - ✅ Trip Pro unlock checkout API (`/api/billing/checkout/trip`)
    - ✅ Stripe webhook handler (`/api/billing/webhook`) for subscription events
    - ✅ Billing portal API (`/api/billing/portal`) for customer self-service
    - ✅ Account-level Pro (`profiles.is_pro`) and trip-level Pro (`trips.has_trip_pro`)
    - ✅ Database migrations: `add-stripe-customer-id-to-profiles.sql`, `add-is-pro-to-profiles.sql`, `add-trip-pro-fields-to-trips.sql`
    - ✅ Automatic subscription status updates via webhook

- **2025-01-XX**: Image Caching System ✅ **NEW**
  - **Supabase Storage Integration**:
    - ✅ Image caching API endpoint (`/api/images/cache-place-image`)
    - ✅ Health check endpoint (`/api/debug/image-cache-health`)
    - ✅ Automatic image caching from Google Places, Unsplash, Mapbox
    - ✅ Deterministic file paths prevent duplicates
    - ✅ Public bucket: `place-images` (must be created manually)
    - ✅ See [images.md](./images.md) for complete documentation

- **2025-01-XX**: Trip Regeneration Stats ✅ **NEW**
  - **Regeneration Limit Tracking**:
    - ✅ Database table: `trip_regeneration_stats` for tracking daily regeneration counts
    - ✅ Migration file: `supabase-add-regeneration-stats.sql`
    - ✅ Daily limit enforcement: 2 regenerations/day for free tier, 5 for Pro tier
    - ✅ Integration with Smart Itinerary regeneration endpoint

- **2025-01-XX**: Infrastructure & UX Improvements ✅ **UPDATED**
  - **Trip Deletion Feature**: 
    - ✅ New DELETE endpoint `/api/trips/[tripId]` for trip deletion
    - ✅ Delete button in trips list UI (only visible to trip owners)
    - ✅ Confirmation dialog before deletion
    - ✅ Automatic cleanup of all associated data (cascade deletes)
    - ✅ Toast notifications for success/error states
  - **Route Helper Utilities**:
    - ✅ New `lib/routes.ts` with `getTripUrl()` helper function
    - ✅ Centralized URL construction for trip pages
    - ✅ Support for tab query parameters (e.g., `?tab=itinerary`)
    - ✅ Integrated into trip creation flow and navigation
  - **Clerk User ID Migration Improvements**:
    - ✅ Migration: `add-clerk-user-id-to-profiles.sql` - Adds `clerk_user_id` column to profiles
    - ✅ Migration: `add-unique-index-clerk-user-id.sql` - Adds unique index on `clerk_user_id`
    - ✅ Enables proper profile lookup by Clerk user ID without UUID conflicts
    - ✅ Backfills existing profiles that had Clerk IDs in the `id` column
    - ✅ Supports both UUID-based profiles and Clerk ID-based lookups
  - **Trip List Enhancements**:
    - ✅ Automatic trip invitation linking on page load
    - ✅ Past trips section with show/hide toggle
    - ✅ Improved trip card UI with hover states
    - ✅ Owner-only delete button visibility
  - **City Autocomplete Feature** ✅ **NEW**:
    - ✅ New API endpoint: `/api/places/city-autocomplete` (GET and POST)
    - ✅ New component: `DestinationAutocomplete` for improved destination selection
    - ✅ Integrated into trip creation dialog (`new-trip-dialog.tsx`)
    - ✅ Uses Google Places Autocomplete API with city-only restriction
    - ✅ Returns city and country information for better UX
    - ✅ Supports location biasing for better results
  - **Usage Limits System** ✅ **NEW**:
    - ✅ Migration: `add-explore-usage-limits-to-trip-members.sql`
    - ✅ Adds `swipe_count`, `change_count`, `search_add_count` columns to `trip_members` table
    - ✅ Tracks per-user-per-trip usage for Explore features
    - ✅ Enforces limits based on Pro/free tier status
    - ✅ Used in activity replace and Explore swipe endpoints
  - **Activity Replace Feature** ✅ **NEW**:
    - ✅ New endpoint: `/api/trips/[tripId]/activities/[activityId]/replace`
    - ✅ Enforces change_count limits (5 for free, unlimited for Pro)
    - ✅ Uses Explore Places API to find contextually relevant replacements
    - ✅ Enforces food place limit (max 1 per time slot)
    - ✅ Past-day lock prevents modifying past days
    - ✅ Smart replacement based on area/category matching
  - **AI Itinerary Enhancements** ✅ **NEW**:
    - ✅ Supports `trip_segment_id` parameter for multi-city trip itineraries
    - ✅ Enforces max 1 food place per time slot (morning/afternoon/evening)
    - ✅ Improved food place detection using Google Places types
    - ✅ Better photo matching with saved places
    - ✅ Enhanced food place filtering logic

- **2025-01-XX**: Phase 21 Complete - Travel Advisor (Pre-Trip Planning) ✅
  - **Phase 21 Complete**: Travel Advisor feature for pre-trip planning
    - ✅ Travel Advisor page (`/advisor`) with chat interface
    - ✅ API endpoint (`/api/advisor`) with GET and POST methods
    - ✅ Database table `advisor_messages` for chat history
    - ✅ Daily message limits (3 for free tier, 15 for Pro tier)
    - ✅ Chat moderation system (blocks non-travel topics)
    - ✅ Onboarding flow that creates trips directly from advisor
    - ✅ Integration with homepage search (routes to advisor for travel queries)
    - ✅ Transport guidance for multi-city and regional trips
    - ✅ Migration file: `database/migrations/supabase-add-advisor-messages.sql`

- **2025-01-XX**: Phase 18-20 Complete - Multi-City Trips, Personalization & Enhanced Assistant ✅
  - **Phase 18 Complete**: Multi-city trip support with trip segments
    - ✅ Trip segments table and API endpoints (GET/POST/PATCH/DELETE)
    - ✅ Pro tier restriction for multi-city trips
    - ✅ Segment-aware days, itineraries, and explore sessions
    - ✅ Multi-city trip creation UI (TripPersonalizationDialog)
    - ✅ Auto-generation of days for each segment
    - ✅ All migration files created and tested
  - **Phase 19 Complete**: Trip personalization feature
    - ✅ Enhanced trip creation with personalization dialog
    - ✅ Additional trip fields: travelers, origin city, accommodation, arrival info, interests
    - ✅ Migration file for personalization fields
    - ✅ Integration with trip creation flow
  - **Phase 20 Complete**: Enhanced Trip Assistant & Chat Moderation
    - ✅ New assistant endpoint with segment and day context support
    - ✅ Chat moderation system (blocks non-travel topics)
    - ✅ Multi-city trip context awareness
    - ✅ Segment-aware and day-aware responses
    - ✅ Improved system prompts for focused travel assistance

- **2025-01-XX**: Phase 17 Complete - Day-Level Integration & Trip Invitations ✅
  - **Phase 17 UI Complete**: Day-level Explore integration fully implemented
    - ✅ "Add activities" button on each day/slot in itinerary view
    - ✅ Day-level Explore drawer/sheet that opens when clicking "Add activities"
    - ✅ Pre-filters places by day's neighborhood (areaCluster) and time slot (morning/afternoon/evening)
    - ✅ Immediate add-to-day functionality: swiping right in day mode adds place directly to that day/slot
    - ✅ Full integration between itinerary-tab.tsx and ExploreDeck component
    - ✅ ExploreDeck supports both 'trip' mode (traditional) and 'day' mode (filtered by day/slot)
    - ✅ Day-level bulk add API integration in UI
  - **Trip Invitation Linking**: New feature to link email invitations to user accounts
    - ✅ New API endpoint: `/api/user/link-trip-invitations`
    - ✅ Automatically links trip_members entries with matching email when user signs up
    - ✅ Integrated into trips-list.tsx to auto-link invitations on page load
    - ✅ Allows invited users to see trips in their "My Trips" section after signing up

- **2025-01-XX**: Phase 15 & 16 Complete - Explore Feature Implementation ✅
  - **Phase 15 Complete**: Full Tinder-style swipe UI implemented
    - Database: `explore_sessions` table with migration file and indexes
    - Frontend: ExploreDeck, SwipeableCard, ExploreFilters, SwipeCounter components
    - Backend: `/api/trips/[tripId]/explore/*` endpoints (places, swipe, session)
    - Features: Swipe gestures, undo functionality, daily limits (50 for free tier), subscription checking
    - Integration: Google Places API for place discovery and photos
    - Hooks: use-explore.ts with useExplorePlaces, useExploreSession, useSwipeAction
    - Advanced filters: Budget and distance filters for Pro tier
    - Day-level filtering: Support for filtering by day_id
    - User subscription API: `/api/user/subscription-status` endpoint
  - **Phase 16 Complete**: Itinerary regeneration with liked places
    - Smart itinerary generator updated to support `must_include_place_ids`
    - Preserve day structure option (`preserve_structure` parameter)
    - Automatic re-clustering by neighborhood
    - Clear liked places after successful regeneration
    - Full integration with Explore tab workflow
    - Day-level bulk add: `/api/trips/[tripId]/days/[dayId]/activities/bulk-add-from-swipes` endpoint
    - Add places directly to specific day and time slot (morning/afternoon/evening)
    - See implementation details in "Recently Completed" section above
  - **Phase 17 Complete**: Day-Level Integration & Advanced Filters ✅
    - ✅ Day-level bulk add API endpoint implemented (`/api/trips/[tripId]/days/[dayId]/activities/bulk-add-from-swipes`)
    - ✅ Day-level filtering support in Explore API (filter by `day_id` parameter)
    - ✅ Advanced filters for Pro tier implemented (budget, maxDistance)
    - ✅ User subscription system implemented (`is_pro` column in profiles table)
    - ✅ Subscription status API endpoint (`/api/user/subscription-status`)
    - ✅ Daily swipe limit logic (50 for free tier, unlimited for Pro)
    - ✅ UI components for day-level integration ("Add activities" button) - **COMPLETE**
    - ✅ Day-level Explore drawer/sheet with pre-filtering - **COMPLETE**
    - ✅ Immediate add-to-day on swipe right in day mode - **COMPLETE**
    - 🚧 Future: Additional advanced filters (vibe, theme, accessibility)
    - 🚧 Future: Multi-city Explore support
    - 🚧 Future: Travel stats and badges system

- **2025-01-XX**: Product Direction Change - Explore Feature
  - New product flow: Generate itinerary → Explore places (Tinder-style) → Regenerate with liked places
  - Explore feature becomes core product experience
  - Swipe-based place discovery replaces traditional explore tab
  - Itinerary regeneration with user-selected places
  - Monetization strategy updated: Free tier with swipe limits, Pro tier with unlimited swipes
  - See [NEXT_STEPS.md](./NEXT_STEPS.md) for remaining implementation plan

- **2025-01-XX**: Enhanced Smart Itinerary System (Phase 14) - Complete
  - Implemented structured itinerary schema using Zod validation (`itinerary-schema.ts`) for type-safe itinerary generation
  - Created new SmartItinerary format with slot-based structure (morning/afternoon/evening) and area clustering
  - Implemented itinerary chat editing API (`/api/trips/[tripId]/itinerary-chat`) - natural language editing of existing itineraries
  - Added place-level update API (`/api/trips/[tripId]/smart-itinerary/place`) - mark places as visited or remove from itinerary
  - Enhanced itinerary UI with image galleries, lightbox viewer, and structured day display
  - Improved place organization with area clustering and neighborhood-based grouping
  - Added trip tips section with season-specific and date-based practical advice
  - Integrated automatic photo enrichment from Google Places API for places and day hero images
  - Created `itinerary-schema.ts` with Zod schemas for runtime validation
  - Updated `itinerary.ts` types to match new structured SmartItinerary schema
  - Note: Both legacy AiItinerary format (`/api/ai-itinerary`) and new SmartItinerary format (`/api/trips/[tripId]/smart-itinerary`) are supported

- **2025-01-XX**: Accommodation & Hotel Search (Phase 12) - Complete
  - Added accommodation auto-suggestion API endpoint (`/api/accommodation/find`)
  - Implemented automatic best hotel recommendation based on trip destination using Google Places API
  - Hotel search results sorted by rating and review count
  - Integration with trip accommodation storage

- **2025-01-XX**: AI-Powered Trip Assistant & Smart Features (Phase 11) - Complete
  - Added Trip Assistant chat interface (`/api/trips/[tripId]/chat`) with AI-powered trip planning assistance
  - Implemented chat message persistence and history in `trip_chat_messages` table
  - Context-aware trip assistance (considers trip details, dates, destination)
  - Smart Itinerary generation with full multi-day planning
  - Integration with saved places in itinerary generation

- **2025-01-XX**: Google Places Integration (Phase 13) - Complete
  - Full Google Places API integration for place search, photos, and details
  - Server-side place photo API for secure photo fetching
  - Place type filtering and nearby search functionality
  - Saved places integration with Explore tab

- **2025-11-22**: Code cleanup and organization
  - Removed legacy `itinerary-panel.tsx` component
  - Organized all documentation into `docs/` folder
  - Organized all database files into `database/` folder
  - Created comprehensive roadmap document

