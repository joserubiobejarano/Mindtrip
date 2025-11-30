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

_Currently no features in progress_

## 📋 Planned Features

### Phase 15 - Enhanced User Experience
- [ ] Trip templates and presets
- [ ] Weather integration for trip dates
- [ ] Photo uploads and galleries (user-uploaded photos)
- [ ] Notes and journaling features
- [ ] Trip statistics and analytics
- [ ] Activity photo uploads

### Phase 16 - Advanced Collaboration
- [ ] Real-time chat for trip members (member-to-member chat, not AI)
- [ ] Activity voting/polling system
- [ ] Comment threads on activities
- [ ] Notification system
- [ ] Email invitations for trip members

### Phase 17 - Mobile App Development
- [ ] Native iOS and Android app (see [mobile-roadmap.md](./mobile-roadmap.md))
- [ ] Expo React Native implementation
- [ ] Offline mode support
- [ ] Push notifications
- [ ] Deep linking

### Phase 18 - Web Mobile Optimization
- [ ] Responsive design improvements
- [ ] Mobile-first itinerary view
- [ ] Offline mode support
- [ ] Progressive Web App (PWA) features

### Phase 19 - Advanced Features
- [ ] Budget tracking and alerts
- [ ] Enhanced booking service integrations (beyond Booking.com links)
- [ ] Calendar sync (Google Calendar, iCal)
- [ ] Export to various formats (CSV, JSON - PDF already implemented)
- [ ] Flight search and booking (placeholder page exists)

### Phase 20 - Performance & Scalability
- [ ] Image optimization and CDN
- [ ] Database query optimization
- [ ] Caching strategies
- [ ] Load testing and performance monitoring

## 🐛 Known Issues

_No known issues currently documented_

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
  - Returns: `SmartItinerary` (structured format with slots, area clusters, trip tips)

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

### Travel Intent (Future)
- `POST /api/intent/travel` - Travel intent detection (placeholder for future use)

## 🔄 Recent Updates

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

