# Mindtrip - Travel Planner App

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
- Structured itinerary schema using Zod validation
- Streaming itinerary generation with real-time progress updates
- Itinerary chat editing (natural language editing of existing itineraries)
- Place-level updates (mark as visited, remove from itinerary)
- Slot-based day structure (morning, afternoon, evening with grouped places)
- Enhanced itinerary UI with image galleries and lightbox
- Area clustering and neighborhood-based place grouping
- Trip tips and practical micro-tips in daily overviews
- Place photos, descriptions, and tags in structured format

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

### Phase 13 - Google Places Integration ✅
- Full Google Places API integration
- Place search by text and nearby search
- Place details with photos
- Place type filtering
- Place photo fetching for activities and itineraries
- Server-side place photo API

## 📁 Project Structure

```
mindtrip/
├── app/                    # Next.js 15 App Router
│   ├── auth/              # Authentication pages
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
- **AI SDK:** Vercel AI SDK (`ai` package) with `@ai-sdk/openai` for structured streaming
- **Schema Validation:** Zod (for itinerary schema validation)
- **State Management:** React Query (TanStack Query)
- **Date Utilities:** date-fns

## 📝 Documentation

- [COMMANDS.md](./docs/COMMANDS.md) - All commands to run
- [SETUP.md](./docs/SETUP.md) - Detailed setup instructions
- [MIGRATION_INSTRUCTIONS.md](./docs/MIGRATION_INSTRUCTIONS.md) - Database migration guide
- [ROADMAP.md](./docs/ROADMAP.md) - Development roadmap and progress tracking
- [mobile-roadmap.md](./docs/mobile-roadmap.md) - Mobile app development roadmap
- [database/supabase-schema.sql](./database/supabase-schema.sql) - Complete database schema

## 🎯 Next Steps

1. Get your Mapbox token from [mapbox.com](https://www.mapbox.com/)
2. Get your OpenAI API key from [platform.openai.com](https://platform.openai.com/) (for AI day planning, Trip Assistant, and smart itinerary generation)
3. Get your Google Maps API key from [console.cloud.google.com](https://console.cloud.google.com/) (for Places API, hotel search, and place photos)
4. Configure Clerk authentication (Email/Password + Google OAuth)
5. Run the SQL schema in Supabase
6. Run additional migrations for saved_places, trip_chat_messages, and smart_itineraries tables
7. Enable Realtime for required tables
8. Install dependencies: `npm install` (includes Vercel AI SDK packages)
9. Start developing!

## 📊 Current Status

**Completed Phases:** 14 out of 20 planned phases (70% complete)

**Key Features Implemented:**
- ✅ Full trip planning and collaboration
- ✅ AI-powered day planning and smart itineraries
- ✅ Streaming itinerary generation with real-time progress
- ✅ Natural language itinerary editing via chat
- ✅ Structured itinerary schema with Zod validation
- ✅ Trip Assistant chat interface
- ✅ Hotel/accommodation search
- ✅ Google Places integration
- ✅ Expense tracking and checklists
- ✅ Public sharing and PDF export

**Next Priorities:**
- Enhanced user experience features (templates, weather, photos)
- Advanced collaboration (member chat, voting, comments)
- Mobile app development
- Web mobile optimization

## 📱 Mobile App

A native mobile app is planned for iOS and Android. See [mobile-roadmap.md](./docs/mobile-roadmap.md) for the complete development plan.

## 📄 License

MIT

supabase-add-trip-id-to-places.sql#   M i n d t r i p 
 
 