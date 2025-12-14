# Kruno - Travel Planner App

A collaborative travel planning application built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Quick Start

See [COMMANDS.md](./docs/COMMANDS.md) for all commands to run and [SETUP.md](./docs/SETUP.md) for detailed setup instructions.

### Quick Setup:

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env.local` file:**
```
NEXT_PUBLIC_SUPABASE_URL=https://upeoxmwdwghdbgcqqtll.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZW94bXdkd2doZGJnY3FxdGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NzcxOTgsImV4cCI6MjA3OTE1MzE5OH0.6yZ4f5tUM_75mp31wQBxwLUlNmhsAF0-FGDQRDddFk0
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

3. **Set up database:**
   - Open Supabase SQL Editor
   - Run `database/supabase-schema.sql`

4. **Enable Realtime:**
   - Supabase Dashboard > Database > Replication
   - Enable for: `activities`, `places`, `checklists`, `checklist_items`, `trip_members`

5. **Run development server:**
```bash
npm run dev
```

## ✨ Features

### Phase 1 - Project Setup ✅
- Next.js 15 with App Router
- TypeScript configuration
- Tailwind CSS styling
- shadcn/ui components
- Split layout (40% sidebar, 60% map)
- Supabase integration
- Email/Password + Google OAuth authentication

### Phase 2 - Data Model & Trip CRUD ✅
- Complete database schema (11 tables)
- Row Level Security (RLS) policies
- Trip creation, listing, and management
- Auto-generation of days for trip date ranges
- Trip deletion with cascade cleanup ✅ **NEW**
- Route helper utilities (`lib/routes.ts`) ✅ **NEW**
- Clerk user ID migration improvements ✅ **NEW**

### Phase 3 - Itinerary Builder & Map ✅
- Day selector with date display
- Activity CRUD (create, read, update, delete)
- Mapbox GL JS integration
- Interactive map with markers and popups
- Place search using Mapbox Geocoding API
- Collaborative trip editing
- Realtime sync for activities

### Phase 4 - Explore Tab ✅
- Destination autocomplete search
- Place discovery and exploration
- Add places to itinerary functionality

### Phase 15 - Explore Feature: Tinder-Style Place Discovery ✅
- Tinder-style swipe UI for place discovery
- Swipeable card deck component with Framer Motion animations
- Place cards with photos, ratings, categories, and tags
- Swipe gestures (right = like, left = dislike, up = details)
- Undo swipe functionality
- Daily swipe limits (50 for free tier, unlimited for Pro)
- Explore session management and persistence
- Integration with Google Places API for place discovery
- Automatic exclusion of already swiped/planned places
- Explore filters (neighborhood, category, time of day)
- Day-level filtering support (filter by specific day's neighborhood)
- Advanced filters for Pro tier (budget, maxDistance)
- User subscription status checking API

### Phase 16 - Explore Feature: Itinerary Regeneration with Liked Places ✅
- Backend API for itinerary regeneration with liked places
- Support for must_include_place_ids parameter
- Support for already_planned_place_ids parameter
- Re-clustering by neighborhood with new places
- Preserve day structure when regenerating (preserve_structure parameter)
- Smart placement of liked places in appropriate time slots
- Clear liked places after successful regeneration
- Day-level bulk add functionality (add places to specific day/slot)

### Phase 5 - Expenses & Checklists ✅
- Expense tracking with category support
- Automatic balance calculation per person
- Expense sharing among trip members
- Multiple checklists per trip
- Checklist items with checkbox states
- Realtime sync for checklists

### Phase 6 - Sharing & Export ✅
- Public trip sharing with unique slugs
- Read-only public view
- Subtle watermark on public pages
- PDF export functionality

### Phase 7 - AI-Powered Features ✅
- AI day planning using OpenAI GPT-4o-mini
- Automatic activity suggestions based on trip details
- Context-aware planning (considers budget, interests, existing activities)
- One-click day planning from itinerary tab

### Phase 8 - User Settings & Preferences ✅
- User profile settings page
- Display name customization
- Default currency selection (30+ currencies)
- Profile synchronization with Clerk

### Phase 9 - Advanced Map Features ✅
- Route optimization using Mapbox Directions API
- Visual route lines connecting activities on map
- Automatic route calculation for day itineraries
- Place saving/bookmarking functionality
- Saved places list in Explore tab
- Quick access to saved places

### Phase 11 - AI-Powered Trip Assistant & Smart Features ✅
- Trip Assistant chat interface (AI-powered conversational assistant)
- Chat message persistence and history
- Context-aware trip assistance
- Smart Itinerary generation (full multi-day AI-generated itineraries)
- Day-by-day itinerary with sections (Morning, Afternoon, Evening)
- Activity suggestions with photos and descriptions
- Hero image galleries for each day
- Smart itinerary caching and regeneration

### Phase 14 - Enhanced Smart Itinerary System ✅
- Structured itinerary schema using Zod validation (itinerary-schema.ts)
- Smart itinerary generation with structured JSON format (SmartItinerary type)
- Itinerary chat editing API (natural language editing via `/api/trips/[tripId]/itinerary-chat`)
- Place-level updates API (mark as visited, remove places via `/api/trips/[tripId]/smart-itinerary/place`)
- Slot-based day structure (morning, afternoon, evening with grouped places)
- Enhanced itinerary UI with image galleries and lightbox viewer
- Area clustering and neighborhood-based place grouping
- Trip tips and practical micro-tips in daily overviews
- Place photos, descriptions, and tags in structured format
- Automatic photo enrichment from Google Places API

### Phase 12 - Accommodation & Hotel Search ✅
- Hotel search functionality using Google Places API
- Hotel type filtering (hotel, hostel, apartment)
- Budget range filtering
- Hotel search results with ratings and reviews
- Hotel details view with photos
- Booking.com integration (external links)
- Set accommodation for trip
- Dedicated "Stay" page for accommodation search
- Map integration for hotel locations
- Accommodation auto-suggestion API (`/api/accommodation/find`)
- Automatic best hotel recommendation based on trip destination

### Phase 13 - Google Places Integration ✅
- Full Google Places API integration
- Place search by text and nearby search
- Place details with photos
- Place type filtering
- Place photo fetching for activities and itineraries

### Phase 18 - Multi-City Trip Support (Trip Segments) ✅
- Trip segments table for multi-city trips (Pro tier)
- Segment management API endpoints
- Multi-city trip creation UI
- Segment-aware days, itineraries, and explore sessions
- Auto-generation of days for each segment
- Order-based segment management

### Phase 19 - Trip Personalization ✅
- Enhanced trip creation with personalization dialog
- Additional trip fields: travelers, origin city, accommodation details
- Arrival information (transport mode, arrival time)
- Interests array (user preferences)

### Phase 20 - Enhanced Trip Assistant & Chat Moderation ✅
- New Trip Assistant API endpoint with enhanced context
- Chat moderation system (blocks non-travel topics)
- Multi-city trip context support
- Segment-aware and day-aware responses
- Server-side place photo API

### Phase 21 - Travel Advisor (Pre-Trip Planning) ✅
- Travel Advisor page (`/advisor`) for pre-trip planning questions
- Chat interface for exploring destinations and trip ideas
- Daily message limits (3 for free tier, 15 for Pro tier)
- Chat moderation system (blocks non-travel topics)
- Transport guidance for multi-city and regional trips
- Onboarding flow that creates trips directly from advisor
- Integration with homepage search (routes to advisor for travel queries)
- Database table `advisor_messages` for chat history

## 📁 Project Structure

```
kruno/
├── app/                    # Next.js 15 App Router
│   ├── auth/              # Authentication pages
│   ├── advisor/            # ✅ NEW: Travel Advisor page
│   ├── trips/             # Trip management pages
│   └── p/                 # Public sharing pages
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── trip-*.tsx         # Trip-related components
│   ├── *-tab.tsx          # Tab components
│   └── *-dialog.tsx       # Dialog components
├── hooks/                 # Custom React hooks
│   ├── use-trip.ts
│   ├── use-activities.ts
│   ├── use-advisor-chat.ts  # ✅ NEW: Travel Advisor chat hook
│   └── use-realtime-*.ts  # Realtime hooks
├── lib/                   # Utilities
│   ├── supabase/          # Supabase clients
│   └── providers.tsx      # React Query provider
├── types/                 # TypeScript definitions
├── docs/                  # Documentation files
│   ├── COMMANDS.md
│   ├── SETUP.md
│   ├── MIGRATION_INSTRUCTIONS.md
│   ├── ROADMAP.md
│   └── mobile-roadmap.md
└── database/              # Database files
    ├── supabase-schema.sql
    └── migrations/        # Database migration scripts
```

## 🔧 Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Authentication:** Clerk (Email/Password + Google OAuth)
- **Maps:** Mapbox GL JS + Mapbox Directions API
- **AI:** OpenAI GPT-4o-mini (for day planning and itinerary generation)
- **Schema Validation:** Zod (for itinerary schema validation)
- **State Management:** React Query (TanStack Query)
- **Date Utilities:** date-fns

## 📝 Documentation

- **[DEVELOPER_SUMMARY.md](./DEVELOPER_SUMMARY.md)** - ⭐ **Start here!** Comprehensive project overview for developers
- **[ROADMAP.md](./ROADMAP.md)** - ⚠️ **UPDATED** Development roadmap with new Explore feature phases
- **[NEXT_STEPS.md](./NEXT_STEPS.md)** - 🆕 **NEW** Explore feature implementation plan
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 🆕 **NEW** System architecture and data flow
- **[FEATURES.md](./FEATURES.md)** - 🆕 **NEW** Complete feature list and specifications
- [mobile-roadmap.md](./mobile-roadmap.md) - Mobile app development roadmap
- [monetization.md](./monetization.md) - Monetization strategy and revenue plans
- [COMMANDS.md](./COMMANDS.md) - All commands to run (if exists)
- [SETUP.md](./SETUP.md) - Detailed setup instructions (if exists)
- [MIGRATION_INSTRUCTIONS.md](./MIGRATION_INSTRUCTIONS.md) - Database migration guide (if exists)
- [database/supabase-schema.sql](../database/supabase-schema.sql) - Complete database schema

## 🎯 Next Steps

1. Get your Mapbox token from [mapbox.com](https://www.mapbox.com/)
2. Get your OpenAI API key from [platform.openai.com](https://platform.openai.com/) (for AI day planning, Trip Assistant, and smart itinerary generation)
3. Get your Google Maps API key from [console.cloud.google.com](https://console.cloud.google.com/) (for Places API, hotel search, and place photos)
4. Configure Clerk authentication (Email/Password + Google OAuth)
5. Run the SQL schema in Supabase
6. Run additional migrations for saved_places, trip_chat_messages, and smart_itineraries tables
7. Enable Realtime for required tables
8. Install dependencies: `npm install`
9. Start developing!

## 📊 Current Status

**Completed Phases:** 21 out of 27 planned phases (~78% complete)
**Phase 21:** ✅ Complete - Travel Advisor (Pre-Trip Planning) fully implemented

**Recent Updates (January 2025):**
- ✅ Infrastructure & UX Improvements
  - ✅ Trip deletion feature with DELETE API endpoint (`/api/trips/[tripId]`)
  - ✅ Route helper utilities (`lib/routes.ts` with `getTripUrl()` function)
  - ✅ Clerk user ID migration improvements (profile lookup enhancements)
  - ✅ Enhanced trip list UI with past trips section and delete functionality
  - ✅ Automatic trip invitation linking on trips list load
- ✅ Phase 21 complete - Travel Advisor (Pre-Trip Planning) fully implemented
  - ✅ Travel Advisor page (`/advisor`) with chat interface
  - ✅ API endpoint (`/api/advisor`) with GET and POST methods
  - ✅ Database table `advisor_messages` for chat history
  - ✅ Daily message limits (3 for free tier, 15 for Pro tier)
  - ✅ Chat moderation system (blocks non-travel topics)
  - ✅ Onboarding flow that creates trips directly from advisor
  - ✅ Integration with homepage search (routes to advisor for travel queries)
- ✅ Phase 15 & 16 fully implemented and functional
- ✅ Phase 17 complete - Day-level Explore integration fully implemented
- ✅ Day-level bulk add API endpoint (`/api/trips/[tripId]/days/[dayId]/activities/bulk-add-from-swipes`)
- ✅ "Add activities" button on each time slot in itinerary view
- ✅ Day-level Explore drawer/sheet with pre-filtered places
- ✅ Immediate add-to-day: swiping right in day mode adds place directly to that day/slot
- ✅ Pre-filtering by day's neighborhood and time slot
- ✅ Full ExploreDeck day mode integration
- ✅ Undo swipe functionality implemented
- ✅ User subscription system implemented (`is_pro` column, subscription status API)
- ✅ Advanced filters (budget, maxDistance) for Pro tier
- ✅ Day-level filtering support in Explore API
- ✅ Daily swipe limits (50 for free tier, unlimited for Pro)
- ✅ Trip invitation linking feature (auto-links email invitations to user accounts after signup)

**Key Features Implemented:**
- ✅ Full trip planning and collaboration
- ✅ AI-powered day planning and smart itineraries
- ✅ Structured itinerary generation with Zod schema validation
- ✅ Natural language itinerary editing via chat API
- ✅ Place-level updates (mark visited, remove from itinerary)
- ✅ Trip Assistant chat interface with message history
- ✅ Hotel/accommodation search with auto-suggestion
- ✅ Google Places integration with photo enrichment
- ✅ Expense tracking and checklists
- ✅ Public sharing and PDF export
- ✅ **Explore Feature (Tinder-style place discovery)** - **COMPLETE** (Phase 15)
- ✅ **Itinerary regeneration with liked places from Explore** - **COMPLETE** (Phase 16)
- ✅ **Day-level bulk add API** - Add places to specific day/slot
- ✅ **Day-level Explore integration** - "Add activities" button on each time slot
- ✅ **Day-level Explore drawer** - Pre-filtered by day's neighborhood and time slot
- ✅ **Immediate add-to-day** - Swiping right in day mode adds place directly to that day/slot
- ✅ **Undo swipe functionality** - Undo last swipe action
- ✅ **User subscription system** - Pro/free tier with `is_pro` column
- ✅ **Subscription status API** - Check Pro/free tier status
- ✅ **Advanced filters for Pro tier** - Budget and maxDistance filters
- ✅ **Day-level filtering** - Filter Explore by specific day's neighborhood
- ✅ **Daily swipe limits** - 50/day for free tier, unlimited for Pro
- ✅ **Trip invitation linking** - Auto-links email invitations to user accounts after signup
- ✅ **Trip deletion** - DELETE API endpoint with owner verification and cascade cleanup
- ✅ **Route helpers** - Centralized URL construction utilities (`lib/routes.ts`)
- ✅ **Clerk user ID migrations** - Improved profile lookup with `clerk_user_id` column

**Next Priorities:**
- Phase 22: Enhanced user experience features (templates, weather, photos)
- Phase 22: Notes and journaling features
- Phase 23: Advanced collaboration (member chat, voting, comments)
- Future: Additional advanced filters (vibe, theme, accessibility)
- Future: Multi-city Explore support and travel stats/badges
- Mobile app development
- Web mobile optimization

## 📱 Mobile App

A native mobile app is planned for iOS and Android. See [mobile-roadmap.md](./docs/mobile-roadmap.md) for the complete development plan.

## 📄 License

MIT

supabase-add-trip-id-to-places.sql#   M i n d t r i p 
 
 