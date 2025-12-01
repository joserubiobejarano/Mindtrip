# MindTrip Development Roadmap

This document tracks the development progress of the MindTrip travel planning application.

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

### Phase 3 - Itinerary Builder & Map Integration
- [x] Day selector with date display
- [x] Activity CRUD operations (create, read, update, delete)
- [x] Mapbox GL JS integration
- [x] Interactive map with markers and popups
- [x] Place search using Mapbox Geocoding API
- [x] Activity-to-place linking
- [x] Collaborative trip editing
- [x] Realtime sync for activities
- [x] Activity ordering and time management

### Phase 4 - Explore Tab
- [x] Destination autocomplete search
- [x] Place discovery and exploration
- [x] Add places to itinerary functionality

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
- [x] Route optimization using Mapbox Directions API
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

**Phase 17 - Explore Feature: Day-Level Integration & Advanced Filters** (Backend Complete, UI Remaining)
- Backend API endpoints fully implemented
- Day-level filtering and bulk add working
- Pro tier filters (budget, maxDistance) implemented
- User subscription system implemented
- UI components for day-level integration still needed

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

### Phase 17 - Explore Feature: Day-Level Integration & Advanced Filters (🚧 Partially Complete)
**Backend Complete ✅:**
- [x] Day-level bulk add API endpoint (add places to specific day/slot) ✅
- [x] Day-level filtering support (filter by day_id in Explore API) ✅
- [x] Advanced filters for Pro tier (budget, maxDistance) ✅
- [x] User subscription system (is_pro column in profiles table) ✅
- [x] Subscription status API endpoint (`/api/user/subscription-status`) ✅
- [x] Daily swipe limit logic (50 for free tier, unlimited for Pro) ✅
- [x] Undo swipe functionality ✅

**Frontend/UI Remaining 🚧:**
- [ ] "Add more activities" button on each day in itinerary UI
- [ ] Pre-filter Explore by day's neighborhood/time of day (UI integration)
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

### Phase 18 - Enhanced User Experience
- [ ] Trip templates and presets
- [ ] Weather integration for trip dates
- [ ] Photo uploads and galleries (user-uploaded photos)
- [ ] Notes and journaling features
- [ ] Trip statistics and analytics
- [ ] Activity photo uploads

### Phase 19 - Advanced Collaboration
- [ ] Real-time chat for trip members (member-to-member chat, not AI)
- [ ] Activity voting/polling system
- [ ] Comment threads on activities
- [ ] Notification system
- [ ] Email invitations for trip members

### Phase 20 - Mobile App Development
- [ ] Native iOS and Android app (see [mobile-roadmap.md](./mobile-roadmap.md))
- [ ] Expo React Native implementation
- [ ] Offline mode support
- [ ] Push notifications
- [ ] Deep linking

### Phase 21 - Web Mobile Optimization
- [ ] Responsive design improvements
- [ ] Mobile-first itinerary view
- [ ] Offline mode support
- [ ] Progressive Web App (PWA) features

### Phase 22 - Advanced Features
- [ ] Budget tracking and alerts
- [ ] Enhanced booking service integrations (beyond Booking.com links)
- [ ] Calendar sync (Google Calendar, iCal)
- [ ] Export to various formats (CSV, JSON - PDF already implemented)
- [ ] Flight search and booking (placeholder page exists)

### Phase 23 - Performance & Scalability
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
- Mapbox token is required for map and geocoding features
- Google Maps API key is required for Places API, hotel search, and place photos
- OpenAI API key is required for AI day planning, smart itineraries, and Trip Assistant chat
- Additional database tables may need to be created manually:
  - `trip_chat_messages` - for Trip Assistant chat history
  - `smart_itineraries` - for cached AI-generated itineraries (stores structured JSON with Zod schema validation)
  - `saved_places` - migration file exists in `database/migrations/supabase-add-saved-places-table.sql`
  - **`explore_sessions`** - ✅ **IMPLEMENTED** For Explore feature (Tinder-style swipe) - Migration file: `database/migrations/supabase-add-explore-sessions-table.sql`
  - **`profiles.is_pro`** - ✅ **IMPLEMENTED** For user subscription status - Migration file: `database/migrations/add-is-pro-to-profiles.sql`
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
- `POST /api/trips/[tripId]/chat` - Send message to Trip Assistant
  - Body: `{ message: string }`
  - Returns: `{ message: string }` (assistant response)
  - Persists conversation history in `trip_chat_messages` table

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

### User Management
- `GET /api/user/subscription-status` - Get user subscription status
  - Returns: `{ isPro: boolean }`
  - Checks user's subscription tier (Pro or free)
  - Uses `is_pro` column in `profiles` table
  - Migration file: `database/migrations/add-is-pro-to-profiles.sql`

### Travel Intent (Future)
- `POST /api/intent/travel` - Travel intent detection (placeholder for future use)

## 🔄 Recent Updates

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
  - **Phase 17 Partial Complete**: Day-Level Integration & Advanced Filters (Backend Complete)
    - ✅ Day-level bulk add API endpoint implemented (`/api/trips/[tripId]/days/[dayId]/activities/bulk-add-from-swipes`)
    - ✅ Day-level filtering support in Explore API (filter by `day_id` parameter)
    - ✅ Advanced filters for Pro tier implemented (budget, maxDistance)
    - ✅ User subscription system implemented (`is_pro` column in profiles table)
    - ✅ Subscription status API endpoint (`/api/user/subscription-status`)
    - ✅ Daily swipe limit logic (50 for free tier, unlimited for Pro)
    - 🚧 Remaining: UI components for day-level integration ("Add more activities" button)
    - 🚧 Remaining: Additional advanced filters (vibe, theme, accessibility)
    - 🚧 Remaining: Multi-city Explore support
    - 🚧 Remaining: Travel stats and badges system

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

