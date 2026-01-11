# Kruno - Developer Summary & Project Overview

> **Last Updated:** January 2025  
> **Project Status:** Active Development - 14 of 20 phases completed (70%)

## 📋 Table of Contents

1. [What is Kruno?](#what-is-kruno)
2. [Product Vision & Value Proposition](#product-vision--value-proposition)
3. [What Does It Do?](#what-does-it-do)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [What Has Been Done](#what-has-been-done)
7. [What's Left To Do](#whats-left-to-do)
8. [Next Steps & Priorities](#next-steps--priorities)
9. [Critical Setup Information](#critical-setup-information)
10. [Database & Migrations](#database--migrations)
11. [API Endpoints](#api-endpoints)
12. [Important Technical Notes](#important-technical-notes)
13. [Documentation References](#documentation-references)

---

## What is Kruno?

**Kruno** is a collaborative, AI-powered travel planning application that helps users create, organize, and manage their trips. Think of it as "Notion + ChatGPT for trips" - combining the collaborative editing capabilities of Notion with AI-powered itinerary generation and assistance.

### 🎯 NEW PRODUCT DIRECTION (January 2025)

The product has shifted to prioritize a **Tinder-style swipe experience** for place discovery. The new flow is:

1. **User searches for city + dates**
2. **App instantly generates Smart Itinerary** (Day/Hour grouped itinerary)
3. **User visits Explore tab:**
   - Sees swipeable place cards (one at a time)
   - Swipe right = interested, Swipe left = not interested
   - Swipe up = view details (optional)
4. **After swiping, user clicks "Add these to my itinerary"**
5. **Backend regenerates itinerary** with liked places integrated
6. **Result: Updated itinerary** that includes user-selected places

This makes place discovery a core, engaging part of the trip planning experience.

### Key Differentiators

- **AI-First Approach**: Uses OpenAI GPT-4o-mini to generate rich, story-like itineraries with contextual recommendations
- **Tinder-Style Explore**: Swipe-based place discovery that makes planning fun and engaging
- **Smart Itinerary Regeneration**: Seamlessly integrates user-selected places into existing itineraries
- **Collaborative Planning**: Multiple users can plan trips together in real-time
- **Smart Itineraries**: Structured, multi-day itineraries with morning/afternoon/evening slots, area clustering, and trip tips
- **Natural Language Editing**: Edit itineraries through conversational chat interface
- **Comprehensive Features**: Trip planning, expense tracking, checklists, place discovery, accommodation search, and more

---

## Product Vision & Value Proposition

**Vision**: Create the most intuitive and powerful travel planning tool that combines AI intelligence with collaborative editing.

**Core Value**: 
- AI generates rich, contextual itineraries that feel like they were written by a travel expert
- Collaborative interface allows friends/family to plan trips together seamlessly
- All-in-one solution: planning, expenses, checklists, place discovery, and accommodation
- Beautiful, modern UI that makes trip planning enjoyable

**Target Users**:
- Travelers planning solo or group trips
- Digital nomads organizing multi-city trips
- Families planning vacations
- Travel enthusiasts who want detailed, AI-curated itineraries

---

## What Does It Do?

### 🆕 NEW: Explore Feature (Priority)

**Tinder-Style Place Discovery:**
- Swipeable place cards (one at a time)
- Swipe right to like, left to dislike, up for details
- Beautiful card design with photos, ratings, tags
- Store liked places and regenerate itinerary
- Free tier: 30-50 swipes/day, Pro tier: Unlimited
- Day-level integration: "Add more activities" button on each day

**Itinerary Regeneration:**
- Automatically integrates liked places into itinerary
- Re-clusters by neighborhood
- Preserves day structure when possible
- Avoids duplication
- Smart placement in appropriate time slots

See [FEATURES.md](./FEATURES.md) for complete Explore feature specifications.

### Core Features

1. **Trip Management**
   - Create trips with dates, destinations, and preferences
   - Invite collaborators (trip members)
   - Auto-generate days based on date ranges
   - Set trip preferences (budget, interests, currency)

2. **AI-Powered Itinerary Generation**
   - Generate full multi-day itineraries with one click
   - Two formats supported:
     - **Legacy Format** (`AiItinerary`): Simpler structure with sections
     - **Smart Format** (`SmartItinerary`): Advanced structure with slots, area clusters, trip tips
   - Context-aware planning (considers budget, interests, saved places, dates)
   - Natural language editing via chat interface
   - Mark places as visited or remove from itinerary

3. **Activity Management**
   - Create, edit, delete activities
   - Link activities to places (Google Places integration)
   - Time-based scheduling
   - Drag-to-reorder functionality
   - Real-time collaborative editing

4. **Place Discovery & Exploration** ⚠️ **UPDATED**
   - **NEW: Tinder-style swipe experience** (replaces traditional explore)
   - Swipeable place cards with photos, ratings, tags
   - Like/dislike places with gestures or buttons
   - Store liked places and add to itinerary
   - Search places using Google Places API
   - Filter by place type, neighborhood, category
   - Save/bookmark places for later
   - View place details with photos
   - Day-level "Add more activities" integration

5. **Accommodation Search**
   - Search hotels using Google Places API
   - Filter by type (hotel, hostel, apartment) and budget
   - View hotel details with photos and ratings
   - Auto-suggestion API for best accommodation
   - Booking.com integration (external links)

6. **Expense Tracking**
   - Add expenses with categories
   - Multi-currency support (30+ currencies)
   - Automatic balance calculation per person
   - Expense sharing among trip members
   - Per-person breakdown

7. **Checklists**
   - Multiple checklists per trip
   - Checklist items with checkbox states
   - Real-time sync across collaborators
   - Progress tracking

8. **Trip Assistant (AI Chat)**
   - Conversational AI assistant for trip planning
   - Context-aware responses (considers trip details)
   - Chat history persistence
   - Natural language trip planning assistance

9. **Travel Advisor (Pre-Trip Planning)** ⚠️ **NEW**
   - Pre-trip planning assistant for exploring destinations and trip ideas
   - Chat interface at `/advisor` page
   - Daily message limits (3 for free tier, 15 for Pro tier)
   - Chat moderation (blocks non-travel topics)
   - Transport guidance for multi-city and regional trips
   - Onboarding flow that creates trips directly from advisor
   - Integration with homepage search (routes to advisor for travel queries)

10. **Sharing & Export**
   - Public trip sharing with unique slugs
   - Read-only public view with watermark
   - PDF export functionality

11. **Maps & Routes**
    - Interactive map with Google Maps
    - Activity markers and popups
    - Route visualization on map
    - Visual route lines connecting activities
    - Automatic route calculation for day itineraries

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Query (TanStack Query)
- **Maps**: Google Maps API (`@react-google-maps/api`) for map display and Places integration
- **Date Utilities**: date-fns
- **Form Handling**: react-hook-form
- **Animations**: framer-motion
- **Schema Validation**: Zod

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk (Email/Password + Google OAuth)
- **Realtime**: Supabase Realtime subscriptions
- **AI**: OpenAI GPT-4o-mini
- **File Storage**: Supabase Storage (if needed)

### APIs & Services
- **Google Maps API**: Map display, Places search, photos, details, hotel search
- **OpenAI API**: AI day planning, itinerary generation, Trip Assistant chat

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint (Next.js config)
- **Type Checking**: TypeScript
- **Version Control**: Git

---

## Project Structure

```
kruno/
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API routes
│   │   ├── accommodation/        # Accommodation search API
│   │   ├── ai/                   # AI day planning
│   │   ├── ai-itinerary/        # Legacy itinerary generation
│   │   ├── intent/               # Travel intent (placeholder)
│   │   └── trips/                # Trip-related APIs
│   │       └── [tripId]/
│   │           ├── chat/         # Trip Assistant chat
│   │           ├── itinerary-chat/  # Itinerary editing chat
│   │           └── smart-itinerary/  # Smart itinerary generation
│   ├── auth/                    # Authentication pages
│   ├── flights/                 # Flights page (placeholder)
│   ├── hotels/                  # Hotels page
│   ├── trips/                   # Trip management pages
│   │   └── [tripId]/
│   │       ├── page.tsx         # Trip detail page
│   │       └── stay/            # Accommodation search page
│   ├── p/                       # Public sharing pages
│   │   └── [slug]/              # Public trip view
│   ├── settings/                # User settings
│   ├── sign-in/                 # Sign in page
│   ├── sign-up/                 # Sign up page
│   └── page.tsx                 # Homepage
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui base components
│   ├── trip-*.tsx               # Trip-related components
│   ├── *-tab.tsx                # Tab components
│   ├── *-dialog.tsx             # Dialog components
│   └── trips/                   # Trip-specific components
│
├── hooks/                        # Custom React hooks
│   ├── use-trip.ts              # Trip data hook
│   ├── use-activities.ts        # Activities hook
│   ├── use-days.ts              # Days hook
│   └── use-realtime-*.ts        # Realtime hooks
│
├── lib/                          # Utilities and services
│   ├── routes.ts                # Route helper utilities (getTripUrl)
│   ├── supabase/                # Supabase clients and helpers
│   │   ├── client.ts            # Client-side Supabase
│   │   ├── server.ts            # Server-side Supabase
│   │   ├── middleware.ts        # Middleware Supabase
│   │   ├── activities.ts        # Activity helpers
│   │   ├── saved-places.ts      # Saved places helpers
│   │   ├── smart-itineraries.ts # Smart itinerary helpers
│   │   └── trip-chat-messages.ts # Chat message helpers
│   ├── google/                  # Google Places integration
│   │   ├── accommodation.ts   # Hotel search
│   │   ├── places-server.ts    # Server-side Places API
│   │   └── google-places/       # Client-side Places
│   ├── google-places.ts         # Places utilities
│   ├── openai.ts                # OpenAI client
│   ├── providers.tsx            # React Query provider
│   └── utils.ts                 # General utilities
│
├── types/                        # TypeScript definitions
│   ├── ai.ts                    # AI-related types
│   ├── database.ts              # Database types
│   ├── itinerary-schema.ts     # Zod schemas for itineraries
│   └── itinerary.ts            # Itinerary TypeScript types
│
├── database/                     # Database files
│   ├── supabase-schema.sql      # Main database schema
│   └── migrations/              # Migration scripts
│
├── docs/                         # Documentation
│   ├── README.md                # Project overview
│   ├── ROADMAP.md               # Development roadmap
│   ├── mobile-roadmap.md        # Mobile app roadmap
│   ├── monetization.md          # Monetization strategy
│   └── DEVELOPER_SUMMARY.md     # This file
│
└── middleware.ts                 # Next.js middleware
```

---

## What Has Been Done

### ✅ Completed Phases (21 of 27)

**Phase 1 - Project Setup & Foundation** ✅
- Next.js 15 with App Router
- TypeScript configuration
- Tailwind CSS + shadcn/ui
- Supabase integration
- Clerk authentication

**Phase 2 - Data Model & Trip Management** ✅
- Complete database schema (11+ tables)
- Row Level Security (RLS) policies
- Trip CRUD operations (create, read, update, delete)
- Auto-generation of days
- Trip member collaboration
- Trip deletion with cascade cleanup
- Route helper utilities (`lib/routes.ts`)
- Clerk user ID migration improvements

**Phase 3 - Itinerary Builder & Map Integration** ✅
- Activity CRUD operations
- Google Maps integration
- Interactive map with markers
- Place search and linking
- Real-time collaborative editing

**Phase 4 - Explore Tab** ✅
- Destination autocomplete
- Place discovery
- Add places to itinerary

**Phase 5 - Expenses & Checklists** ✅
- Expense tracking with categories
- Multi-currency support
- Automatic balance calculation
- Multiple checklists per trip
- Real-time sync

**Phase 6 - Sharing & Export** ✅
- Public trip sharing with slugs
- Read-only public view
- PDF export

**Phase 7 - AI-Powered Features** ✅
- AI day planning (GPT-4o-mini)
- Context-aware activity suggestions
- One-click day planning

**Phase 8 - User Settings & Preferences** ✅
- User profile settings
- Display name customization
- Default currency selection (30+ currencies)

**Phase 9 - Advanced Map Features** ✅
- Route visualization
- Visual route lines
- Place saving/bookmarking
- Saved places integration

**Phase 10 - Code Organization & Cleanup** ✅
- Organized documentation
- Organized database files
- Removed dead code

**Phase 11 - AI-Powered Trip Assistant & Smart Features** ✅
- Trip Assistant chat interface
- Chat message persistence
- Smart Itinerary generation
- Integration with saved places

**Phase 12 - Accommodation & Hotel Search** ✅
- Hotel search (Google Places API)
- Hotel type and budget filtering
- Hotel details with photos
- Booking.com integration
- Accommodation auto-suggestion API

**Phase 13 - Google Places Integration** ✅
- Full Google Places API integration
- Place search and nearby search
- Place details with photos
- Server-side place photo API

**Phase 14 - Enhanced Smart Itinerary System** ✅
- Structured itinerary schema (Zod validation)
- SmartItinerary format with slots
- Itinerary chat editing API
- Place-level updates (mark visited, remove)
- Area clustering and neighborhood grouping
- Trip tips and practical advice
- Automatic photo enrichment

**Phase 15 - Explore Feature: Tinder-Style Place Discovery** ✅ **COMPLETE**
- Database: `explore_sessions` table with migration and indexes
- Frontend: ExploreDeck, SwipeableCard, ExploreFilters, SwipeCounter components
- Backend: `/api/trips/[tripId]/explore/*` endpoints (places, swipe, session)
- Features: Swipe gestures, undo functionality, daily limits (50 for free tier), subscription checking
- Integration: Google Places API for place discovery
- Hooks: use-explore.ts with React Query integration
- User API: `/api/user/subscription-status` endpoint
- Advanced features: Day-level filtering, Pro tier filters (budget, maxDistance)

**Phase 16 - Explore Feature: Itinerary Regeneration with Liked Places** ✅ **COMPLETE**
- Smart itinerary generator updated to support `must_include_place_ids`
- Preserve day structure option (`preserve_structure` parameter)
- Automatic re-clustering by neighborhood
- Clear liked places after successful regeneration
- Full integration with Explore tab workflow
- Day-level bulk add: `/api/trips/[tripId]/days/[dayId]/activities/bulk-add-from-swipes` endpoint

**Phase 17 - Explore Feature: Day-Level Integration & Advanced Filters** ✅ **COMPLETE**
- ✅ Day-level bulk add API endpoint implemented
- ✅ Day-level filtering in Explore API (filter by `day_id`)
- ✅ User subscription system (`is_pro` column in profiles table)
- ✅ Subscription status API endpoint
- ✅ Advanced filters for Pro tier (budget, maxDistance)
- ✅ Daily swipe limit logic (50 for free tier, unlimited for Pro)
- ✅ Undo swipe functionality
- ✅ UI components implemented ("Add activities" button, day-level Explore drawer)
- ✅ Immediate add-to-day on swipe right in day mode
- ✅ Full integration with itinerary-tab.tsx and ExploreDeck component

**Phase 21 - Travel Advisor (Pre-Trip Planning)** ✅ **COMPLETE**
- ✅ Travel Advisor page (`/advisor`) with chat interface
- ✅ API endpoint (`/api/advisor`) with GET and POST methods
- ✅ Database table `advisor_messages` for chat history
- ✅ Daily message limits (3 for free tier, 15 for Pro tier)
- ✅ Chat moderation system (blocks non-travel topics)
- ✅ Onboarding flow that creates trips directly from advisor
- ✅ Integration with homepage search (routes to advisor for travel queries)
- ✅ Transport guidance for multi-city and regional trips
- ✅ React hook `use-advisor-chat.ts` for integration
- ✅ Helper functions in `lib/supabase/advisor-messages.ts`
- ✅ Migration file: `database/migrations/supabase-add-advisor-messages.sql`

### 📊 Progress Summary

- **Completed**: 21 phases (Phases 1-17, 18-21)
- **In Progress**: None
- **Planned**: 6 phases remaining (Phases 22-27)
- **Completion**: ~78%
- **Next Priority**: Phase 22 - Enhanced User Experience (templates, weather, photos)

---

## What's Left To Do

### 🚧 Planned Features (6 phases remaining)

### 🆕 NEXT PRIORITY: Enhanced User Experience - Phase 22

**Phase 15 - Explore Feature: Tinder-Style Place Discovery** ✅ **COMPLETE**
_See completed phases section above for details._

**Phase 16 - Explore Feature: Itinerary Regeneration with Liked Places** ✅ **COMPLETE**
_See completed phases section above for details._

**Phase 17 - Explore Feature: Day-Level Integration & Advanced Filters** ✅ **COMPLETE**
- ✅ Day-level bulk add API endpoint
- ✅ Day-level filtering in Explore API
- ✅ User subscription system (is_pro column)
- ✅ Advanced filters for Pro tier (budget, maxDistance)
- ✅ Daily swipe limit logic
- ✅ "Add activities" button on each time slot (UI component)
- ✅ Pre-filter Explore by day's neighborhood/time of day (UI integration)
- ✅ Day-level Explore drawer/sheet with filtered places
- ✅ Immediate add-to-day on swipe right in day mode
- ✅ Full ExploreDeck day mode integration
- ✅ Trip invitation linking feature (new API endpoint)

### Other Planned Features (6 phases remaining)

**Phase 21 - Enhanced User Experience**
- [ ] Trip templates and presets
- [ ] Weather integration for trip dates
- [ ] Photo uploads and galleries (user-uploaded photos)
- [ ] Notes and journaling features
- [ ] Trip statistics and analytics
- [ ] Activity photo uploads

**Phase 23 - Advanced Collaboration**
- [ ] Real-time chat for trip members (member-to-member chat, not AI)
- [ ] Activity voting/polling system
- [ ] Comment threads on activities
- [ ] Notification system
- [ ] Email invitations for trip members

**Phase 24 - Mobile App Development**
- [ ] Native iOS and Android app (Expo + React Native)
- [ ] Offline mode support
- [ ] Push notifications
- [ ] Deep linking
- See [mobile-roadmap.md](./mobile-roadmap.md) for detailed plan

**Phase 25 - Web Mobile Optimization**
- [ ] Responsive design improvements
- [ ] Mobile-first itinerary view
- [ ] Offline mode support
- [ ] Progressive Web App (PWA) features

**Phase 26 - Advanced Features**
- [ ] Budget tracking and alerts
- [ ] Enhanced booking service integrations
- [ ] Calendar sync (Google Calendar, iCal)
- [ ] Export to various formats (CSV, JSON)
- [ ] Flight search and booking (placeholder page exists)

**Phase 27 - Performance & Scalability**
- [ ] Image optimization and CDN
- [ ] Database query optimization
- [ ] Caching strategies
- [ ] Load testing and performance monitoring

---

## Next Steps & Priorities

### Immediate Priorities (Next 1-2 Months)

1. **🚀 Phase 21: Enhanced User Experience**
   - Weather integration for trip dates
   - Trip templates and presets
   - User photo uploads
   - Notes and journaling features
   - Trip statistics and analytics

2. **Phase 21: Enhanced User Experience**
   - Weather integration for trip dates
   - Trip templates and presets
   - User photo uploads
   - Notes and journaling features

3. **Phase 21: Enhanced User Experience**
   - Weather integration for trip dates
   - Trip templates and presets
   - User photo uploads
   - Notes and journaling features

4. **Polish & Bug Fixes**
   - Fix any existing bugs
   - Improve error handling
   - Enhance user experience
   - Performance optimization

### Short-term Goals (3-6 Months)

1. **Phase 21: Enhanced User Experience**
   - Weather integration for trip dates
   - Trip templates and presets
   - User photo uploads
   - Notes and journaling features
   - Additional advanced filters for Pro tier (vibe, theme, accessibility) - Future
   - Travel stats and badges - Future

2. **Phase 21 - Enhanced User Experience**
   - Weather integration
   - Trip templates
   - User photo uploads

3. **Phase 22 - Advanced Collaboration**
   - Member-to-member chat
   - Activity voting
   - Email invitations

4. **Mobile App Planning**
   - Finalize mobile app architecture
   - Begin Phase 0 (backend hardening)

### Long-term Goals (6-12 Months)

1. **Mobile App Development**
   - Complete mobile app (iOS & Android)
   - App Store and Play Store launch

2. **Monetization**
   - Implement free vs Pro tiers
   - Travel affiliate revenue
   - See [monetization.md](./monetization.md) for strategy

3. **Scale & Growth**
   - Performance optimization
   - Infrastructure scaling
   - Marketing and user acquisition

---

## Critical Setup Information

### ⚠️ Important: Manual Database Setup Required

**The Supabase CLI is NOT connected.** All database migrations must be run manually through the Supabase SQL Editor.

### Required Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_for_client_side
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_for_server_side

# Supabase Service Role (for image caching)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe (Billing/Subscriptions)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRO_YEARLY_PRICE_ID=your_stripe_pro_yearly_price_id
STRIPE_TRIP_PRO_PRICE_ID=your_stripe_trip_pro_price_id
STRIPE_SUCCESS_URL=https://your-domain.com/settings/billing
```

### Required API Keys

1. **Supabase**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Get URL and anon key from Project Settings > API
   - Get Service Role Key from Project Settings > API (required for image caching)

2. **Clerk**
   - Sign up at [clerk.com](https://clerk.com)
   - Create application
   - Configure Email/Password and Google OAuth
   - Get publishable key and secret key

3. **Google Maps API**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create project and enable:
     - Places API
     - Places API (New)
     - Geocoding API (if needed)
   - Create API key and restrict it
   - Create separate keys for client-side (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) and server-side (`GOOGLE_MAPS_API_KEY`)

4. **OpenAI**
   - Sign up at [platform.openai.com](https://platform.openai.com)
   - Create API key
   - Add billing (required for API usage)

5. **Stripe** (Required for billing/subscriptions)
   - Sign up at [dashboard.stripe.com](https://dashboard.stripe.com)
   - Create account and get API keys
   - Get Secret Key (`STRIPE_SECRET_KEY`) and Webhook Secret (`STRIPE_WEBHOOK_SECRET`)
   - Configure webhook endpoint in Stripe Dashboard:
     - Endpoint URL: `https://your-domain.com/api/billing/webhook`
     - Events to listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Create products and prices in Stripe Dashboard:
     - Pro Yearly Subscription (price ID required in `STRIPE_PRO_YEARLY_PRICE_ID`)
     - Trip Pro Unlock (price ID required in `STRIPE_TRIP_PRO_PRICE_ID`)

---

## Database & Migrations

### Database Schema

The main database schema is in `database/supabase-schema.sql`. This creates all core tables:

**Important:** The schema uses TEXT for user IDs to support Clerk authentication (not Supabase Auth). User IDs are stored as Clerk user IDs (e.g., "user_35oLHG0nQ6kzb4SqR8") instead of UUIDs.

- `profiles` - User profiles
- `trips` - Trip information
- `days` - Days within trips
- `activities` - Activities/places in itinerary
- `places` - Place information
- `expenses` - Expense tracking
- `expense_participants` - Expense sharing
- `checklists` - Checklists
- `checklist_items` - Checklist items
- `trip_members` - Trip collaborators
- `saved_places` - Saved/bookmarked places
- `trip_chat_messages` - Trip Assistant chat history
- `smart_itineraries` - Cached AI-generated itineraries

### Migration Files

All migration files are in `database/migrations/`. **Run these manually in order:**

1. `supabase-schema.sql` (main schema - run first)
2. `supabase-migration-fix-clerk-ids.sql` (fixes user ID format)
3. `supabase-add-trip-details.sql` (adds trip detail fields)
4. `supabase-add-trip-preferences.sql` (adds budget, interests fields)
5. `supabase-add-destination-fields.sql` (adds destination_name, destination_country)
6. `supabase-add-trip-center-coords.sql` (adds center coordinates)
7. `supabase-add-accommodation-fields.sql` (adds accommodation fields)
8. `supabase-add-saved-places-table.sql` (creates saved_places table)
9. `supabase-add-trip-id-to-places.sql` (adds trip_id to places)
10. `add-itinerary-column.sql` (adds itinerary column if needed)
11. `add-default-currency-to-profiles.sql` (adds default currency)
12. `add-is-pro-to-profiles.sql` - ✅ Adds `is_pro` column for subscription status
13. `supabase-add-trip-segments.sql` - ✅ **NEW** Creates `trip_segments` table for multi-city trips
14. `supabase-add-segment-id-to-days.sql` - ✅ **NEW** Links days to segments
15. `supabase-add-trip-segment-to-itineraries.sql` - ✅ **NEW** Links itineraries to segments
16. `supabase-add-segment-id-to-explore-sessions.sql` - ✅ **NEW** Links explore sessions to segments
17. `supabase-add-trip-personalization.sql` - ✅ **NEW** Adds personalization fields to trips table
18. `supabase-add-trip-messages.sql` - ✅ Creates `trip_chat_messages` table (may already exist)
19. `add-explore-usage-limits-to-trip-members.sql` - ✅ **NEW** Adds usage tracking columns (swipe_count, change_count, search_add_count)

**⚠️ Important**: Run migrations in the Supabase SQL Editor:
1. Go to Supabase Dashboard > SQL Editor
2. Copy and paste migration SQL
3. Run each migration sequentially
4. Verify tables were created correctly

### Required Manual Setup

1. **Enable Realtime**
   - Go to Supabase Dashboard > Database > Replication
   - Enable replication for:
     - `activities`
     - `places`
     - `checklists`
     - `checklist_items`
     - `trip_members`
     - `saved_places` (if using)

2. **Row Level Security (RLS)**
   - RLS policies are included in `supabase-schema.sql`
   - Verify policies are enabled for all tables
   - Test with different user accounts

3. **Storage Buckets** (if using file uploads)
   - Create storage buckets in Supabase Dashboard
   - Set up bucket policies

### Database Tables That May Need Manual Creation

If migrations fail or are incomplete, these tables may need manual creation:

- `trip_chat_messages` - For Trip Assistant chat
- `smart_itineraries` - For cached AI itineraries (JSONB column)
- `saved_places` - For saved/bookmarked places
- **`explore_sessions`** - ✅ **IMPLEMENTED** For Explore feature (Tinder-style swipe) - Migration file: `database/migrations/supabase-add-explore-sessions-table.sql`
- **`profiles.is_pro`** - ✅ **IMPLEMENTED** For user subscription status - Migration file: `database/migrations/add-is-pro-to-profiles.sql`
- **`profiles.clerk_user_id`** - ✅ **IMPLEMENTED** For Clerk user ID lookup - Migration files: 
  - `database/migrations/add-clerk-user-id-to-profiles.sql` - Adds column and backfills data
  - `database/migrations/add-unique-index-clerk-user-id.sql` - Adds unique index
- **`trip_segments`** - ✅ **NEW** For multi-city trips (Pro tier) - Migration file: `database/migrations/supabase-add-trip-segments.sql`
  - **`advisor_messages`** - ✅ **NEW** For Travel Advisor chat history (pre-trip planning) - Migration file: `database/migrations/supabase-add-advisor-messages.sql`
  - **Segment support columns** - ✅ **NEW**:
  - `days.trip_segment_id` - Migration: `supabase-add-segment-id-to-days.sql`
  - `smart_itineraries.trip_segment_id` - Migration: `supabase-add-trip-segment-to-itineraries.sql`
  - `explore_sessions.trip_segment_id` - Migration: `supabase-add-segment-id-to-explore-sessions.sql`
- **Trip personalization fields** - ✅ **NEW** - Migration: `supabase-add-trip-personalization.sql`
- **`trip_members` usage tracking** - ✅ **NEW** - Migration: `add-explore-usage-limits-to-trip-members.sql`
  - Adds `swipe_count`, `change_count`, `search_add_count` columns
  - Tracks per-user-per-trip usage for Explore features
  - Used to enforce Pro/free tier limits

Check `database/migrations/` for SQL scripts. All migrations listed above are available and should be run manually in the Supabase SQL Editor.

---

## API Endpoints

### AI & Itinerary Generation

**`POST /api/ai/plan-day`**
- Generate AI activity suggestions for a specific day
- Body: `{ tripId: string, dayId: string }`
- Returns: `{ activities: PlannedActivity[] }`

**`POST /api/ai-itinerary`**
- Generate legacy format itinerary (AiItinerary)
- Body: `{ tripId: string }`
- Returns: `{ itinerary: AiItinerary, fromCache: boolean }`

**`POST /api/trips/[tripId]/smart-itinerary`**
- Generate new format smart itinerary (SmartItinerary)
- Returns: `SmartItinerary` (structured format)

**`GET /api/trips/[tripId]/smart-itinerary?mode=load`**
- Load existing smart itinerary
- Returns: `SmartItinerary` or 404

**`POST /api/trips/[tripId]/itinerary-chat`**
- Edit itinerary via natural language chat
- Body: `{ message: string }`
- Returns: Updated `SmartItinerary`

**`PATCH /api/trips/[tripId]/smart-itinerary/place`**
- Update place in itinerary
- Body: `{ dayId: string, placeId: string, visited?: boolean, remove?: boolean }`
- Returns: `{ success: boolean }`

### Explore Feature APIs (NEW - Phase 15)

**`GET /api/trips/[tripId]/explore/places`**
- Fetch places to explore for destination
- Query params: `limit`, `offset`, `exclude_planned`, `neighborhood`, `category`, `time_of_day`, `timeOfDay`, `day_id`, `budget`, `maxDistance`, `includeItineraryPlaces`, `excludePlaceId` (multiple)
- Returns: `{ places: ExplorePlace[], hasMore: boolean, totalCount: number }`
- Supports day-level filtering and Pro tier filters

**`POST /api/trips/[tripId]/explore/swipe`**
- Record swipe action (like/dislike/undo)
- Body: `{ place_id: string, action: 'like' | 'dislike' | 'undo' }`
- Returns: `{ success: boolean, swipeCount: number, remainingSwipes: number, limitReached: boolean, undonePlaceId?: string }`
- Supports undo action to reverse last swipe

**`GET /api/trips/[tripId]/explore/session`**
- Get current explore session
- Returns: `{ likedPlaces: string[], discardedPlaces: string[], swipeCount: number, remainingSwipes: number, dailyLimit: number | null }`

**`DELETE /api/trips/[tripId]/explore/session`**
- Clear explore session
- Returns: `{ success: boolean }`

**`POST /api/trips/[tripId]/days/[dayId]/activities/bulk-add-from-swipes`**
- Add places to specific day and time slot
- Body: `{ place_ids: string[], slot: 'morning' | 'afternoon' | 'evening' }`
- Returns: `{ success: boolean, count: number, message: string }`

**`POST /api/user/link-trip-invitations`**
- Link trip invitations to user account
- Links trip_members entries with matching email to current user
- Returns: `{ success: boolean, linkedCount: number }`
- Called automatically when trips list loads

### Trip Management APIs

**`DELETE /api/trips/[tripId]`** ✅ **NEW**
- Delete a trip and all associated data (cascade deletes)
- Requires trip ownership verification
- Returns: `{ success: boolean, message: string }`
- Location: `app/api/trips/[tripId]/route.ts`
- Integrated into trips list UI with delete button and confirmation dialog

**`GET /api/user/subscription-status`**
- Get user subscription status
- Returns: `{ isPro: boolean }`
- Uses `is_pro` column in `profiles` table
- Migration file: `database/migrations/add-is-pro-to-profiles.sql`

**`POST /api/trips/[tripId]/activities/[activityId]/replace`** ✅ **NEW**
- Replace an activity in the itinerary with a contextually relevant alternative
- Enforces usage limits based on Pro status (10 changes for free, unlimited for Pro)
- Uses Explore Places API to find replacements based on area/category
- Enforces food place limit (max 1 per time slot)
- Prevents modifying past days
- Returns: `{ success: boolean, activity: ItineraryPlace }`
- Location: `app/api/trips/[tripId]/activities/[activityId]/replace/route.ts`

**`GET /api/places/city-autocomplete`** ✅ **NEW**
- City autocomplete search using Google Places Autocomplete API
- Query params: `q` or `input` (search query), `location` (optional lat,lng for biasing)
- Returns: `{ predictions: Array<{ placeId, description, city, country, ... }> }`
- Restricted to cities only (types=(cities))
- Location: `app/api/places/city-autocomplete/route.ts`

**`POST /api/places/city-autocomplete`** ✅ **NEW**
- Get place details including coordinates for selected city
- Body: `{ placeId: string }`
- Returns: `{ placeId, name, center: [lat, lng], formattedAddress }`
- Location: `app/api/places/city-autocomplete/route.ts`

### Trip Assistant

**`POST /api/trips/[tripId]/chat`**
- Send message to Trip Assistant (legacy endpoint)
- Body: `{ message: string }`
- Returns: `{ message: string }` (assistant response)
- Persists conversation in `trip_chat_messages` table

**`POST /api/trips/[tripId]/assistant`** ✅ **NEW**
- Enhanced Trip Assistant with moderation and context
- Body: `{ message: string, activeSegmentId?: string, activeDayId?: string }`
- Returns: `{ reply: string, meta: { usedSegments: string[], suggestions: [] } }`
- Features: Chat moderation, multi-city context, segment-aware responses
- Persists conversation in `trip_chat_messages` table

### Travel Advisor (Pre-Trip Planning) ✅ **NEW**
**`GET /api/advisor`** - Get advisor chat history
- Query params: `limit`, `offset` (for pagination)
- Returns: `{ messages: AdvisorMessage[] }`
- Fetches chat history from `advisor_messages` table

**`POST /api/advisor`** - Send message to Travel Advisor
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

**`POST /api/accommodation/find`**
- Find best accommodation for a trip
- Body: `{ tripId: string }`
- Returns: `{ accommodation: AccommodationResult }`
- Automatically saves to trip's `auto_accommodation` field

### Trip Segments (Multi-City Trips) ✅ **NEW**

**`GET /api/trips/[tripId]/segments`**
- Fetch all segments for a trip
- Returns: `{ segments: TripSegment[] }`
- Pro tier feature

**`POST /api/trips/[tripId]/segments`**
- Create new segment (Pro-only)
- Body: `{ cityPlaceId: string, cityName: string, nights: number, transportType?: string, notes?: string }`
- Returns: `{ segment: TripSegment }`
- Auto-generates days for segment

**`PATCH /api/trips/[tripId]/segments`**
- Update segment (Pro-only)
- Body: `{ segmentId: string, ...updates }`
- Returns: `{ segment: TripSegment }`

**`DELETE /api/trips/[tripId]/segments?segmentId=<id>`**
- Delete segment (Pro-only)
- Returns: `{ success: boolean }`

### Travel Intent (Future)

**`POST /api/intent/travel`**
- Travel intent detection (placeholder for future use)

---

## Important Technical Notes

### Authentication

- **Uses Clerk, NOT Supabase Auth**
- User IDs are stored as TEXT to support Clerk's ID format
- Database schema uses TEXT for `user_id` fields
- Clerk handles session management, token refresh, etc.

### Itinerary Systems

**Two itinerary formats are supported:**

1. **Legacy Format** (`AiItinerary`)
   - Endpoint: `/api/ai-itinerary`
   - Simpler structure with sections
   - Still functional but may be deprecated

2. **New Format** (`SmartItinerary`)
   - Endpoint: `/api/trips/[tripId]/smart-itinerary`
   - Structured with slots (morning/afternoon/evening)
   - Area clustering and neighborhood grouping
   - Trip tips and practical advice
   - Zod schema validation
   - Recommended for new development

### Real-time Features

- Uses Supabase Realtime subscriptions
- Requires enabling replication in Supabase Dashboard
- Real-time sync for:
  - Activities
  - Places
  - Checklists
  - Checklist items
  - Trip members

### AI Integration

- Uses OpenAI GPT-4o-mini model
- All AI calls are server-side (never expose API key to client)
- Responses are cached in database when possible
- Smart itineraries are stored in `smart_itineraries` table as JSONB

### Map Integration

- **Google Maps API** for map display, Places search, photos, hotel search
- Uses `@react-google-maps/api` for React integration

### State Management

- **React Query (TanStack Query)** for server state
- Automatic caching and refetching
- Optimistic updates for better UX
- Real-time subscriptions via Supabase

### Internationalization (i18n)

- **Language Provider** (`components/providers/language-provider.tsx`) - React context for language state
- **i18n Utility** (`lib/i18n.ts`) - Translation system with language switching
- Translation support throughout UI components
- Language persistence and user preference storage
- Multi-language support for key UI elements (trips, explore, settings, etc.)

### Type Safety

- Full TypeScript coverage
- Zod schemas for runtime validation
- Database types generated from Supabase schema
- Shared types between frontend and API routes

### Error Handling

- API routes return proper HTTP status codes
- Error messages are user-friendly
- Client-side error boundaries
- Logging for debugging (console.error)

### Performance Considerations

- Images are loaded from Google Places API (no local storage yet)
- Large itineraries may take time to generate (up to 5 minutes timeout)
- Database queries use proper indexes (defined in schema)
- React Query caching reduces unnecessary API calls

---

## Documentation References

### Essential Documents

1. **[README.md](./README.md)**
   - Quick start guide
   - Feature overview
   - Technology stack
   - Setup instructions

2. **[ROADMAP.md](./ROADMAP.md)** ⚠️ **UPDATED**
   - Complete development roadmap
   - All completed features
   - **NEW: Explore feature phases (15-17)**
   - Planned features
   - API endpoints reference
   - Recent updates (product direction change)

3. **[NEXT_STEPS.md](./NEXT_STEPS.md)** 🆕 **NEW**
   - Explore feature implementation plan
   - Database schema updates
   - API endpoint specifications
   - Component requirements
   - Implementation timeline

4. **[ARCHITECTURE.md](./ARCHITECTURE.md)** 🆕 **NEW**
   - System architecture overview
   - Data flow diagrams
   - Explore feature architecture
   - Integration points
   - Performance considerations

5. **[FEATURES.md](./FEATURES.md)** 🆕 **NEW**
   - Complete feature list
   - Explore feature specifications
   - Feature comparison (Free vs Pro)
   - Future features

6. **[mobile-roadmap.md](./mobile-roadmap.md)**
   - Mobile app development plan
   - Tech stack for mobile
   - Phased timeline
   - App Store requirements

7. **[monetization.md](./monetization.md)**
   - Revenue strategy
   - Free vs Pro tiers
   - **UPDATED: Explore feature monetization**
   - Affiliate revenue plans

### Database Files

- `database/supabase-schema.sql` - Main database schema
- `database/migrations/` - All migration scripts

### Code Documentation

- Type definitions in `types/` directory
- Component structure in `components/` directory
- API routes in `app/api/` directory
- Utility functions in `lib/` directory

---

## Getting Started as a Developer

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Kruno
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create `.env.local` with all required keys (see [Critical Setup Information](#critical-setup-information))

### 4. Set Up Database

1. Create Supabase project
2. Run `database/supabase-schema.sql` in SQL Editor
3. Run all migrations from `database/migrations/` in order
4. Enable Realtime for required tables
5. Verify RLS policies are enabled

### 5. Configure Services

- Set up Clerk authentication
- Configure Google OAuth in Clerk
- Enable Google Maps APIs
- Set up Mapbox account
- Set up OpenAI account with billing

### 6. Run Development Server

```bash
npm run dev
```

### 7. Test the Application

- Create an account
- Create a test trip
- Generate an itinerary
- Test collaboration features
- Test AI features

---

## Common Issues & Solutions

### Database Connection Issues

- Verify Supabase URL and anon key in `.env.local`
- Check Supabase project is active
- Verify network connectivity

### Authentication Issues

- Verify Clerk keys are correct
- Check Google OAuth is configured in Clerk
- Clear browser cookies/cache

### Map Not Loading

- Verify Google Maps API key is set
- Check API key has correct permissions
- Verify Places API is enabled in Google Cloud Console

### Places Not Loading

- Verify Google Maps API key is set
- Check Places API is enabled in Google Cloud Console
- Verify API key restrictions allow your domain

### AI Features Not Working

- Verify OpenAI API key is set
- Check OpenAI account has billing enabled
- Verify API key has correct permissions
- Check API usage limits

### Real-time Not Working

- Verify Realtime is enabled in Supabase Dashboard
- Check replication is enabled for required tables
- Verify RLS policies allow access

---

## Contributing Guidelines

### Code Style

- Use TypeScript for all new code
- Follow Next.js 15 App Router conventions
- Use shadcn/ui components when possible
- Follow existing code patterns

### Git Workflow

- Create feature branches from `main`
- Use descriptive commit messages
- Test thoroughly before submitting
- Update documentation as needed

### Testing

- Test all new features manually
- Test with multiple users (collaboration)
- Test error cases
- Test on different browsers

---

## Support & Contact

For questions or issues:
- Check documentation files
- Review code comments
- Check Supabase/Google Maps/OpenAI documentation
- Review error logs in browser console and server logs

---

## Summary

**Kruno** is a feature-rich, AI-powered travel planning application that's approximately **77% complete**. The core functionality is working, including:

- ✅ Trip management and collaboration
- ✅ AI-powered itinerary generation
- ✅ Place discovery and accommodation search
- ✅ Expense tracking and checklists
- ✅ Real-time collaboration
- ✅ Public sharing and export

### 🎯 RECENT MAJOR FEATURES (January 2025)

**Explore Feature (Phases 15-17):** ✅ **COMPLETE**
- Tinder-style swipe-based place discovery
- Itinerary regeneration with user-selected places
- Day-level integration with Explore
- Monetization: Free tier (50 swipes/day), Pro tier (unlimited)

**Multi-City Trips (Phase 18):** ✅ **COMPLETE**
- Trip segments for multi-city trip support
- Pro tier feature
- Segment-aware days, itineraries, and explore sessions

**Trip Personalization (Phase 19):** ✅ **COMPLETE**
- Enhanced trip creation with personalization dialog
- Origin city, travelers, accommodation, arrival info, interests

**Enhanced Trip Assistant (Phase 20):** ✅ **COMPLETE**
- Chat moderation system
- Multi-city trip context support
- Segment-aware and day-aware responses

**Key Technical Points:**
- Manual database setup required (no Supabase CLI)
- Multiple API keys needed (Supabase, Clerk, Google Maps, OpenAI, Stripe)
- Two itinerary systems (legacy and new SmartItinerary format)
- Real-time features require Supabase Realtime setup
- **NEW**: Explore feature requires new database table and API endpoints
- **NEW**: Image caching requires Supabase Storage bucket (`place-images`)
- **NEW**: Billing system requires Stripe account and webhook configuration

**Recent Additions (January 2025):**

- **UI Components & Infrastructure**:
  - ✅ **App Header Component** (`components/app-header.tsx`) - Unified header with Logo, navigation, sign in/up buttons, settings link
  - ✅ **Logo Component** (`components/ui/logo.tsx`) - Reusable Logo component with "Kruno" branding
  - ✅ **Enhanced Itinerary Tab** (`components/itinerary-tab.tsx`) - Day-level Explore integration, usage limits, photo resolution, past-day lock
  - ✅ **AI Itinerary Route Enhancements** (`app/api/ai-itinerary/route.ts`) - Segment support, food limits, better photo matching
  - ✅ **Google Places Server Utilities** (`lib/google/places-server.ts`) - Enhanced photo fetching, city resolution, landmark detection
  - ✅ **Billing UI Components**:
    - ✅ `PaywallModal` component (`components/billing/PaywallModal.tsx`) - General paywall for Pro features
    - ✅ `ProPaywallModal` component (`components/pro/ProPaywallModal.tsx`) - Context-aware Pro paywall with feature-specific messaging
    - ✅ `paywall-dialog.tsx` component - Paywall dialog wrapper for various contexts
    - ✅ Integrated into Explore filters, new trip dialog (multi-city), hero section, trip creation flow
  - ✅ **Internationalization (i18n) System**:
    - ✅ Language Provider (`components/providers/language-provider.tsx`) - React context for language management
    - ✅ i18n utility (`lib/i18n.ts`) - Translation system with language switching
    - ✅ Translation support throughout UI components
    - ✅ Language persistence and user preference storage
  - ✅ **Settings Page**:
    - ✅ Settings page (`/app/settings/[...rest]/page.tsx`) with dynamic routing
    - ✅ User profile settings, billing management, language preferences

- **Billing & Subscriptions**:
- **Billing & Subscriptions**: Complete Stripe integration for Pro subscriptions and trip-level unlocks
  - Subscription checkout API (`/api/billing/checkout/subscription`)
  - Trip Pro unlock checkout API (`/api/billing/checkout/trip`)
  - Stripe webhook handler (`/api/billing/webhook`) for automatic status updates
  - Billing portal API (`/api/billing/portal`) for customer self-service
  - Database migrations for billing fields
- **Image Caching System**: Production-proof image caching in Supabase Storage with multi-provider fallback
  - API endpoint: `/api/images/cache-place-image`
  - Health check: `/api/debug/image-cache-health`
  - Supports Google Places, Unsplash, and Mapbox as image sources
  - Requires `SUPABASE_SERVICE_ROLE_KEY` and manual bucket creation
- **Trip Regeneration Stats**: Daily regeneration limit tracking for Smart Itinerary regeneration
  - Database table: `trip_regeneration_stats`
  - Limits: 2 regenerations/day (free), 5/day (Pro)
- **Security Architecture**: Comprehensive security improvements
  - Centralized auth helpers (`lib/auth/`) for consistent authorization
  - Input validation with Zod schemas (`lib/validation/`)
  - Rate limiting system (`lib/rate-limit/`) for API protection
  - XSS protection with DOMPurify sanitization
  - See [SECURITY.md](./SECURITY.md) for complete documentation
- **Activity Replace Feature**: Smart activity replacement with usage limits
  - Endpoint: `/api/trips/[tripId]/activities/[activityId]/replace`
  - Usage limit enforcement (5 for free, unlimited for Pro)
  - Context-aware suggestions using Explore Places API
- **City Autocomplete**: Enhanced destination search with Google Places Autocomplete
  - API: `/api/places/city-autocomplete` (GET and POST)
  - Component: `DestinationAutocomplete`
- **Usage Limits System**: Per-user-per-trip tracking
  - Tracks `swipe_count`, `change_count`, `search_add_count`
  - Limits: 10 swipes/trip (free), 100 (Pro); 5 changes/trip (free), unlimited (Pro); 5 search adds/trip (free), unlimited (Pro)

**Next Steps:**
1. **🚀 Phase 22: Enhanced User Experience** - Weather integration, trip templates, photo uploads
2. Continue with remaining phases (23-27)
3. Polish and bug fixes
4. User testing and feedback
5. Mobile app development
6. ~~Monetization implementation~~ ✅ **COMPLETE** - Billing system fully implemented

**Important Setup Notes:**
- **Billing**: Requires Stripe account and webhook configuration. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` environment variables. Create products and prices in Stripe Dashboard and set price IDs in environment variables (`STRIPE_PRO_YEARLY_PRICE_ID`, `STRIPE_TRIP_PRO_PRICE_ID`). Configure webhook endpoint in Stripe Dashboard to listen for subscription events.
- **Image Caching**: Requires `SUPABASE_SERVICE_ROLE_KEY` and manual creation of `place-images` bucket in Supabase Storage (set to PUBLIC).
- **Security**: All API routes now use centralized auth helpers. See [SECURITY.md](./SECURITY.md) for implementation details.
- **Internationalization**: Language Provider and i18n utility are set up automatically. Translation keys are defined in `lib/i18n.ts`. Language preference is persisted in user settings.

The project is well-structured, documented, and ready for continued development. All critical information is documented in the referenced files. **Phases 17-21 are complete - Day-level Explore integration, multi-city trips, trip personalization, enhanced assistant, Travel Advisor, billing system, and image caching are fully functional.**

---

**Last Updated**: January 2025  
**Document Version**: 2.0 - Updated with billing setup, internationalization, and settings page

