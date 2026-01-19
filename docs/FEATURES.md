# Kruno - Features Documentation

> **Last Updated:** January 2025  
> **Focus:** Complete Feature List & Specifications

## 📋 Table of Contents

1. [Core Features](#core-features)
2. [Explore Feature (NEW)](#explore-feature-new)
3. [AI Features](#ai-features)
4. [Collaboration Features](#collaboration-features)
5. [Planning Features](#planning-features)
6. [Sharing & Export](#sharing--export)
7. [Future Features](#future-features)

---

## Core Features

### UI Components ✅ **NEW** (January 2025)

**App Header** (`components/app-header.tsx`):
- Unified app header with Logo component
- Navigation links (Trips link for signed-in users)
- Sign in/Sign up buttons for signed-out users
- Settings link and UserButton for signed-in users
- Language provider integration for internationalization
- Responsive container layout

**Logo Component** (`components/ui/logo.tsx`):
- Reusable Logo component with "Kruno" branding
- Orange color scheme with custom font (Patrick Hand)
- Used throughout the application for consistent branding

**Enhanced Itinerary Tab** (`components/itinerary-tab.tsx`):
- Day-level Explore integration with "Add activities" buttons
- ExploreDeck component integration for day-specific place discovery
- Pre-filtering by day's neighborhood and time slot
- Immediate add-to-day functionality (swipe right adds to day/slot)
- Usage limits display and enforcement
- Photo resolution with cached image support
- Past-day lock protection
- Activity count limits per day
- Enhanced UI with accordion-style day headers
- Smart itinerary loading and error handling
- Segment-aware itinerary display for multi-city trips

### Trip Management

**Create Trip**
- Search for destination city (enhanced with Google Places Autocomplete) ✅ **NEW**
- Set trip dates (start and end)
- Trip name and description
- Auto-generate days based on date range
- Set trip preferences (budget, interests, currency)
- City autocomplete component with country information ✅ **NEW**
- **Multi-city trips (Pro tier)** ✅ **NEW**
  - Add multiple cities to a single trip
  - Each city is a "segment" with its own date range
  - Auto-generate days for each segment
  - Order-based segment management
- **Trip Personalization** ✅ **NEW**
  - Specify number of travelers
  - Origin city selection
  - Accommodation details (has accommodation, place ID, name, address)
  - Arrival information (transport mode, arrival time)
  - Interests array (user preferences)

**Trip List**
- View all trips user is a member of
- Filter by status (upcoming, in progress, completed)
- Search trips
- Sort by date, name, etc.
- Past trips section with show/hide toggle
- Delete trip button (owner-only, with confirmation dialog)
- Automatic trip invitation linking on page load

**User Settings**
- Settings page (`/settings`) with dynamic routing
- User profile settings section (display name, currency preferences)
- Billing/subscription management section (integration with Stripe Customer Portal)
- Language preferences section
- Internationalization (i18n) support with language switching

**Trip Details**
- View trip information
- Edit trip details
- **Delete trip** ✅ **NEW**
  - DELETE API endpoint: `/api/trips/[tripId]`
  - Owner-only deletion with verification
  - Cascade deletion of all associated data
  - Confirmation dialog in UI
  - Toast notifications for success/error
- Invite members
- View trip members
- **Manage trip segments (Pro tier)** ✅ **NEW**
  - Add/remove cities from multi-city trips
  - Edit segment dates and details
  - View segment information
  - Switch between segments in itinerary view

### Day Management

**Auto-Generated Days**
- Days automatically created for trip date range
- Each day has date, day number
- Days linked to trip

**Day Selector**
- Navigate between days
- Display date and day number
- Visual day selector in itinerary view

---

## Explore Feature ✅ **IMPLEMENTED**

### Overview

The Explore feature is a Tinder-style swipe experience for discovering places in a destination. It works **after** generating the itinerary, helping users personalize and enhance it.

**Status:** ✅ **FULLY IMPLEMENTED** - All core features are functional and ready for use.

### New Product Flow

1. User searches for city + dates
2. App instantly generates Smart Itinerary
3. User visits Explore tab:
   - Sees swipeable place cards (one at a time)
   - Swipe right = interested
   - Swipe left = not interested
   - Swipe up = view details (optional)
4. After swiping, user clicks "Add these to my itinerary"
5. Backend regenerates itinerary with:
   - `must_include_place_ids` (liked places)
   - `already_planned_place_ids` (existing places)
6. Result: Updated itinerary that includes user-selected places

### Explore Cards

**Card Content:**
- Place name
- Google place_id
- Main photo (from Google Places)
- Category (museum, viewpoint, café, etc.)
- Neighborhood / district
- Rating + number of reviews
- "Locals love this" / "Trending now" style tags (if available)
- Price level (if available)

**Card Design:**
- Full-screen card (one at a time)
- Large, high-quality photo
- Overlay with place information
- Swipe indicators (left/right/up)
- Smooth animations

### Swipe Behavior

**Swipe Gestures:**
- **Swipe Right** = Like (interested)
- **Swipe Left** = Dislike (not interested)
- **Swipe Up** = View details (optional)
- **Button Alternatives**: Left/Right/Up buttons for accessibility
- **Undo**: Reverse last swipe action (button or gesture)

**Default Behavior:**
- Hide places already in itinerary
- Toggle: "Show itinerary places" to include them

**Storage:**
- `liked_places`: Array of place IDs (Google place_ids)
- `discarded_places`: Array of place IDs
- Stored in `explore_sessions` table

### Explore Tab UI

**Components:**
- Swipeable card deck
- Swipe counter (X swipes remaining)
- "Add to itinerary" button (enabled after swipes)
- Filter toggle (show/hide itinerary places)
- Empty state (no more places)

**Filters (Basic):**
- Neighborhood
- Category
- Time of day (morning/afternoon/evening)
- Day-level filtering (filter by specific day's neighborhood)

**Advanced Filters (Pro Tier):**
- Budget (price level: 0-4) ✅ **IMPLEMENTED**
- Distance (maxDistance in meters) ✅ **IMPLEMENTED**
- Vibe (romantic, family-friendly, adventurous, etc.) - 🚧 Planned
- Theme (food, culture, nature, nightlife, etc.) - 🚧 Planned
- Accessibility options - 🚧 Planned

### Itinerary Regeneration

**Process:**
1. User clicks "Add to itinerary"
2. System collects liked place IDs
3. Fetches place details from Google Places API
4. Regenerates Smart Itinerary with:
   - Must include: liked places
   - Already planned: existing places
5. Re-clusters by neighborhood
6. Avoids duplication
7. Preserves day structure when possible
8. Returns updated SmartItinerary

**UI Updates:**
- Show progress indicator during regeneration
- Display success message
- Highlight newly added places
- Navigate to itinerary tab
- Show "X new places added" notification

### Day-Level Integration ✅ **IMPLEMENTED**

**"Add Activities" Button:**
- ✅ Button on each time slot (morning/afternoon/evening) in itinerary view
- ✅ Opens Explore drawer/sheet with filtered places
- ✅ Pre-filters by:
  - Day's neighborhood (from areaCluster)
  - Time of day (morning/afternoon/evening)
  - Area cluster information from existing places

**Flow:**
1. ✅ User clicks "Add activities" button on a time slot in itinerary
2. ✅ Explore drawer opens with pre-filters applied (neighborhood + time slot)
3. ✅ User swipes on places (filtered by day's location and time)
4. ✅ Swiping right immediately adds place to that day/time slot
5. ✅ Alternative: User can swipe on multiple places, then all liked places are added when clicking "Add to this day"
6. ✅ Places automatically added to specific day and time slot

### Swipe Limits

**Free Tier:**
- 50 swipes per day ✅ **IMPLEMENTED**
- Counter shows remaining swipes ✅ **IMPLEMENTED**
- Disabled when limit reached ✅ **IMPLEMENTED**
- Upgrade prompt when limit reached ✅ **IMPLEMENTED**
- Resets at midnight (UTC) ✅ **IMPLEMENTED**

**Pro Tier:**
- Unlimited swipes
- No counter shown
- All advanced features enabled

### Multi-City Explore (Pro Tier)

- Support multiple destinations in one trip
- Switch between cities in Explore
- Separate swipe counts per city
- Aggregate liked places across cities

---

## AI Features

### Smart Itinerary Generation

**Initial Generation:**
- Generate full multi-day itinerary with one click
- Structured format with slots (morning/afternoon/evening)
- Area clustering and neighborhood grouping
- Trip tips and practical advice
- Automatic photo enrichment

**Regeneration with Liked Places:**
- Include user-selected places from Explore
- Re-cluster by neighborhood
- Preserve day structure when possible
- Avoid duplication
- Smart placement in appropriate time slots

**Itinerary Formats:**
- **Legacy Format** (`AiItinerary`): Simpler structure
- **Smart Format** (`SmartItinerary`): Advanced structure with slots, area clusters, trip tips

### AI Day Planning

**Single Day Planning:**
- Generate activities for a specific day
- Context-aware (considers budget, interests, existing activities)
- Realistic timing and categories
- 3-6 activities per day

### Trip Assistant Chat

**Features:**
- Conversational AI assistant
- Context-aware responses (considers trip details)
- Chat history persistence
- Natural language trip planning assistance
- Answers questions about destinations, activities, etc.
- **Enhanced Assistant** ✅ **NEW**
  - Chat moderation (blocks non-travel topics)
  - Multi-city trip context support
  - Segment-aware responses (responds based on active segment)
  - Day-aware responses (considers current day context)
  - Automatic topic redirection for off-topic queries
  - Improved system prompts for focused travel assistance

### Billing & Subscriptions ✅ **NEW**

**Overview:**
The billing system integrates with Stripe to manage Pro subscriptions and trip-level Pro unlocks. Users can upgrade to Pro at the account level (yearly subscription) or unlock Pro features for individual trips (one-time payment).

**Features:**
- **Account-Level Pro Subscriptions**
  - Yearly Pro subscription via Stripe
  - Unlimited features across all trips
  - Automatic renewal via Stripe
  - Subscription management via Stripe Customer Portal
- **Trip-Level Pro Unlocks**
  - One-time payment per trip to unlock Pro features
  - Useful for users who only need Pro for specific trips
  - Single payment, no recurring subscription
- **Stripe Integration**
  - Checkout sessions for subscriptions and trip unlocks
  - Webhook handler for subscription events (activate, cancel, update)
  - Customer portal for self-service subscription management
  - Automatic status updates (`profiles.is_pro`, `trips.has_trip_pro`)
- **Billing UI Components**
  - `PaywallModal` component (`components/billing/PaywallModal.tsx`) - General paywall for Pro features
  - `ProPaywallModal` component (`components/pro/ProPaywallModal.tsx`) - Context-aware Pro paywall with feature-specific messaging
  - `paywall-dialog.tsx` component - Paywall dialog wrapper for various contexts
  - Integrated into: Explore filters, new trip dialog (multi-city), hero section, trip creation flow
  - Context-aware messaging based on feature being accessed (multi-city, advanced filters, etc.)

**API Endpoints:**
- `POST /api/billing/checkout/subscription` - Create subscription checkout session
- `POST /api/billing/checkout/trip` - Create trip Pro unlock checkout session
- `GET /api/billing/portal` - Get Stripe customer portal session
- `POST /api/billing/webhook` - Handle Stripe webhook events

**Database Schema:**
- `profiles.stripe_customer_id` - Stripe customer ID
- `profiles.is_pro` - Account-level Pro status
- `trips.has_trip_pro` - Trip-level Pro unlock status
- `trips.stripe_trip_payment_id` - Payment intent ID for trip unlock

**Migration Files:**
- `add-stripe-customer-id-to-profiles.sql`
- `add-is-pro-to-profiles.sql`
- `add-trip-pro-fields-to-trips.sql`

### Image Caching System ✅ **NEW**

**Overview:**
Production-proof image caching system that stores place images in Supabase Storage for stable, reliable image URLs. Images are cached from multiple sources with a fallback chain.

**Features:**
- **Automatic Image Caching**
  - Caches images from Google Places, Unsplash, and Mapbox
  - Priority order: Google Places → Unsplash → Mapbox
  - Deterministic file paths prevent duplicate uploads
- **Storage**
  - Supabase Storage bucket: `place-images` (PUBLIC)
  - File path format: `place-images/{provider}/{hash}.jpg`
  - Public URLs for direct image access
- **API Endpoints:**
  - `POST /api/images/cache-place-image` - Cache a place image
  - `GET /api/debug/image-cache-health` - Check system health

**Technical Details:**
- Uses Supabase Service Role client for uploads
- SHA1 hash-based file paths (deterministic)
- Always stores as `.jpg` extension
- Health check endpoint for debugging
- See [images.md](./images.md) for complete documentation

### Trip Regeneration Stats ✅ **NEW**

**Overview:**
Tracks daily regeneration counts per trip to enforce Smart Itinerary regeneration limits based on subscription tier.

**Features:**
- **Daily Limit Tracking**
  - Tracks regeneration count per trip per day
  - Free tier: 2 regenerations per day per trip
  - Pro tier: 5 regenerations per day per trip
- **Database Table**
  - `trip_regeneration_stats` table with UNIQUE constraint on (trip_id, date)
  - Automatic count increment on regeneration
  - Used by Smart Itinerary regeneration endpoint

**Migration File:**
- `supabase-add-regeneration-stats.sql`

### Travel Advisor (Pre-Trip Planning) ✅ **NEW**

**Overview:**
The Travel Advisor is a pre-trip planning assistant that helps users explore destinations, get trip ideas, and plan trips before creating them. It's separate from the Trip Assistant (which works with existing trips).

**Features:**
- Pre-trip planning chat interface (`/advisor` page)
- Suggest destinations, regions, and cities
- Propose realistic trip structures (e.g., 7 days → 2 cities)
- Give approximate high-level suggestions (what to see, areas to base in, vibes)
- Ask clarifying questions (budget, vibe, time of year, length of stay)
- **Transport guidance** for multi-city and regional trips
  - High-speed trains (e.g., AVE in Spain) for major cities
  - Car rentals for smaller towns in regions like Tuscany
  - Bus and flight options with pros/cons
- **Daily message limits:**
  - Free tier: 3 messages per day
  - Pro tier: 15 messages per day
- **Chat moderation:** Blocks non-travel topics
- **Onboarding flow:** Creates trips directly from advisor conversation
- **Integration with homepage:** Routes travel queries to advisor
- **Starter prompts:** Common travel questions to get started
- **Trip creation suggestions:** Proposes creating a trip after helpful exchanges

**Use Cases:**
- "1 week in Tuscany, but not sure where to base myself"
- "Ideas for a 3-day city break in Europe in March"
- "Spain road trip for 10 days"
- "Best destinations for a solo trip in spring"

**Technical Details:**
- API endpoint: `/api/advisor` (GET and POST)
- Database table: `advisor_messages` for chat history
- React hook: `use-advisor-chat.ts` for integration
- Helper functions: `lib/supabase/advisor-messages.ts`
- Migration file: `database/migrations/supabase-add-advisor-messages.sql`

### Itinerary Chat Editing

**Natural Language Editing:**
- Edit itineraries through conversational chat
- "Add a museum to day 2"
- "Remove the restaurant from day 3"
- "Make day 1 more relaxed"
- Updates SmartItinerary structure

### Place-Level Updates

**Mark as Visited:**
- Mark places as visited in itinerary
- Visual indicator (checkmark, grayed out)
- Track visited places

**Remove from Itinerary:**
- Remove places from itinerary
- Updates SmartItinerary structure
- Regenerates if needed

---

## Collaboration Features

### Trip Members

**Invite Members:**
- Invite users by email (future)
- Share trip link
- Add existing users

**Member Management:**
- View all trip members
- Remove members
- Member roles (owner, member)

### Real-Time Collaboration

**Real-Time Sync:**
- Activities update in real-time
- Checklists sync across users
- Place changes propagate instantly
- Member actions visible to all

**Supported Tables:**
- `activities`
- `places`
- `checklists`
- `checklist_items`
- `trip_members`

### Collaborative Swiping (Future)

- Group swiping on places
- See what other members liked
- Voting on places
- Consensus building

---

## Planning Features

### Activity Management

**Create Activity:**
- Add activity to day
- Set time (start and end)
- Link to place
- Add notes
- Upload photos (future)

**Edit Activity:**
- Update activity details
- Change time
- Link/unlink place
- Edit notes

**Day-Level Activity Management** ✅ **NEW** (January 2025):
- "Add activities" button on each time slot (morning/afternoon/evening) in itinerary view
- Day-level Explore drawer/sheet with pre-filtered places
- Pre-filtering by day's neighborhood (areaCluster) and time slot
- Immediate add-to-day: swiping right in day mode adds place directly to that day/slot
- Activity count limits per day (MAX_ACTIVITIES_PER_DAY)
- Past-day lock protection (prevents modifying past days)
- Usage limits display and enforcement (swipes, changes, search adds)

**Replace Activity** ✅ **NEW** (January 2025):
- Replace activity with contextually relevant alternative
- Smart suggestions based on area/category using Explore Places API
- Usage limit enforcement (5 changes for free, unlimited for Pro)
- Food place limit (max 1 per time slot)
- Past-day lock protection (prevents modifying past days)
- One-click replacement from itinerary view
- Endpoint: `/api/trips/[tripId]/activities/[activityId]/replace`

**Delete Activity:**
- Remove from itinerary
- Confirmation dialog

**Activity Ordering:**
- Drag to reorder
- Automatic time adjustment
- Visual timeline

### Place Discovery

**Place Search:**
- Search by name
- Search by category
- Nearby search
- Filter by type

**Place Details:**
- View place information
- Photos gallery
- Rating and reviews
- Opening hours
- Contact information
- Map location

**Save Places:**
- Bookmark places for later
- Saved places list
- Quick access in Explore
- Add to itinerary from saved places

### Route Optimization

**Automatic Routes:**
- Calculate optimal route for day
- Visual route lines on map
- Minimize backtracking
- Group by neighborhood

**Map Display:**
- Interactive map with markers
- Activity markers
- Route lines
- User location (if permitted)

### Accommodation Search

**Hotel Search:**
- Search hotels by destination
- Filter by type (hotel, hostel, apartment)
- Filter by budget
- View hotel details with photos
- Ratings and reviews
- Booking.com integration

**Auto-Suggestion:**
- Automatic best hotel recommendation
- Based on trip destination
- Saves to trip

---

## Sharing & Export

### Public Sharing

**Share Trip:**
- Generate unique share link
- Public slug (e.g., `/p/trip-slug`)
- Read-only view
- Subtle watermark

**Public View:**
- View itinerary
- View activities
- View map
- No editing capabilities

### PDF Export

**Export Options:**
- Full itinerary
- Day-by-day breakdown
- Activities list
- Map view (if applicable)

**PDF Content:**
- Trip information
- Daily schedules
- Activity details
- Place information
- Notes

---

## Email System & Notifications ✅ **NEW** (January 2025)

### Email Infrastructure

**Overview:**
Complete email system using Resend API for transactional and notification emails. Supports multiple languages (English and Spanish) and prevents duplicate emails through idempotency tracking.

**Components:**
- **Email Template System** (`lib/email-copy.ts`):
  - Centralized email copy management
  - 7 email types with multi-language support
  - Type-safe email parameters
- **Email Sending Infrastructure** (`lib/email/resend.ts`):
  - Resend API integration
  - Email sending functions for all email types
  - Unified email configuration (from address, reply-to, unsubscribe headers)
- **Language Support** (`lib/email/language.ts`):
  - Email language normalization (English/Spanish)
  - First name extraction from full names
  - Integration with Clerk user metadata

### Email Types

**1. Welcome Email**
- Sent on user signup
- Personalized greeting with user's first name
- Introduction to Kruno features
- Call-to-action to create first trip

**2. Trip Ready Email**
- Sent when itinerary is generated (smart-itinerary or ai-itinerary routes)
- Includes trip city name and link to view itinerary
- Only sent once per trip (tracked via `trip_ready_email_sent_at`)
- Automatically triggered after successful itinerary generation

**3. Pro Upgrade Email**
- Sent when user upgrades to Pro subscription
- Confirmed via Stripe webhook (`customer.subscription.updated` event)
- Includes billing portal link for subscription management
- Only sent once per upgrade (tracked via `pro_upgrade_email_sent_at`)

**4. Subscription Canceled Email**
- Sent when user cancels Pro subscription
- Confirmed via Stripe webhook (`customer.subscription.deleted` event)
- Information about continued access until end of billing period
- Only sent once per cancellation (tracked via `subscription_canceled_email_sent_at`)

**5. Trip Reminder Email**
- Sent 1 day before trip start date
- Automated via cron job (`/api/cron/trip-reminders`)
- Only sent for trips with generated smart itineraries
- Includes trip city and link to view itinerary
- Only sent once per trip (tracked via `trip_reminder_email_sent_at`)

**6. Trip Invitation Email**
- Sent when inviting someone to a trip
- Includes trip name, inviter name, and invitation link
- Supports deep linking for mobile app (`kruno://link?invitedTripId=...`)
- HTML email with styled buttons for better UX
- Triggered via trip member invitation API

**7. Expenses Summary Email**
- Sent for expense tracking and balances
- Includes trip name, total expenses, and balance summary
- Shows who owes money and who is owed money
- Useful for group trip expense management

### Automated Notifications

**Cron Job for Trip Reminders:**
- Endpoint: `POST /api/cron/trip-reminders`
- Requires `x-cron-secret` header for security
- Runs daily to find trips starting tomorrow
- Only sends to trips with generated smart itineraries
- Updates `trip_reminder_email_sent_at` timestamp after sending

**Integration Points:**
- **Itinerary Generation**: Automatically sends trip ready email after itinerary generation
- **Billing Webhook**: Automatically sends Pro upgrade/cancellation emails on subscription changes
- **Trip Invitations**: Sends invitation email when adding trip members

### Database Tracking

**Email Sent Timestamps:**
- `profiles.pro_upgrade_email_sent_at` - Tracks Pro upgrade email
- `profiles.subscription_canceled_email_sent_at` - Tracks cancellation email
- `trips.trip_ready_email_sent_at` - Tracks trip ready email
- `trips.trip_reminder_email_sent_at` - Tracks trip reminder email

**Idempotency:**
- Email sent timestamps prevent duplicate emails
- Each email type checks if email was already sent before sending
- Ensures users receive each email only once

### Test Endpoints

Test endpoints available for all email types (`/api/test/*`):
- `POST /api/test/welcome-email` - Test welcome email
- `POST /api/test/trip-ready-email` - Test trip ready email
- `POST /api/test/pro-upgrade-email` - Test Pro upgrade email
- `POST /api/test/subscription-canceled-email` - Test subscription canceled email
- `POST /api/test/trip-reminder-email` - Test trip reminder email

### Migration File

**Database Migration:**
- `database/migrations/add-email-sent-fields.sql`
- Adds email tracking fields to `profiles` and `trips` tables

### Environment Variables

**Required:**
- `RESEND_API_KEY` - Resend API key for email sending
- `EMAIL_FROM` - Email from address (default: `no-reply@kruno.app`)
- `APP_URL` or `NEXT_PUBLIC_APP_URL` - App URL for email links
- `CRON_SECRET` - Secret for cron job authentication

---

## Future Features

### Enhanced User Experience

**Trip Templates:**
- Pre-made trip templates
- Popular destinations
- Themed trips (romantic, adventure, family)

**Weather Integration:**
- Weather forecast for trip dates
- Weather-based suggestions
- Packing recommendations

**Photo Uploads:**
- User-uploaded photos
- Activity photos
- Trip photo galleries
- Share photos with members

**Notes & Journaling:**
- Trip notes
- Daily journal entries
- Memories
- Share with members

**Trip Statistics:**
- Places visited
- Distance traveled
- Expenses summary
- Time spent planning

### Advanced Collaboration

**Member Chat:**
- Real-time chat between members
- Not AI assistant, member-to-member
- Chat history
- Notifications

**Activity Voting:**
- Vote on activities
- Poll system
- Consensus building
- Majority rules

**Comment Threads:**
- Comments on activities
- Discussion threads
- @mentions
- Notifications

**Notifications:**
- Activity updates
- Member invitations
- Comments
- Mentions
- Email notifications

### Mobile App

**Native Apps:**
- iOS app
- Android app
- Offline mode
- Push notifications
- Deep linking

**Mobile Features:**
- Full feature parity
- Optimized for mobile
- Touch gestures
- Camera integration

### Advanced Features

**Budget Tracking:**
- Set trip budget
- Track expenses against budget
- Budget alerts
- Per-person budgets

**Calendar Sync:**
- Google Calendar integration
- iCal export
- Sync activities to calendar
- Reminders

**Flight Search:**
- Search flights
- Compare prices
- Book flights (affiliate links)
- Flight reminders

**Travel Stats & Badges:**
- Countries visited
- Places explored
- Categories covered
- Badge system
- Achievement unlocks

### Behavioral Design Features

**Gamification:**
- Swipe badges
- Trip completion badges
- Country flags
- Category badges
- Milestone achievements

**Onboarding:**
- Guided tour
- Quick start tutorial
- Feature highlights
- Tips and tricks

**Post-Trip Features:**
- Trip quizzes
- Group engagement
- Share memories
- Trip reviews
- Recommendations

---

## Feature Comparison: Free vs Pro

### Free Tier

**Explore:**
- 30-50 swipes per day
- Basic place cards
- Basic filters
- Up to X liked places per itinerary

**Itinerary:**
- Basic itinerary generation
- Standard clustering
- Basic route optimization

**Collaboration:**
- Up to 2 active trips
- Basic member collaboration
- Standard real-time sync

### Pro Tier

**Explore:**
- Unlimited swipes
- Advanced filters (vibe, budget, distance, themes)
- Multi-city Explore
- Priority place recommendations

**Itinerary:**
- Advanced clustering
- Better route optimization
- Priority generation
- Multi-city itineraries
- Longer trips (30+ days)

**Collaboration:**
- Unlimited active trips
- Advanced collaboration features
- Member chat
- Activity voting
- Comment threads

**Additional:**
- Travel stats and badges
- Offline mode
- Advanced analytics
- Export to multiple formats
- Calendar sync

---

## Feature Status

### ✅ Completed Features

- Trip management
- Smart Itinerary generation
- AI day planning
- Trip Assistant chat
- Place discovery
- Accommodation search
- Expense tracking
- Checklists
- Public sharing
- PDF export
- Route optimization
- Real-time collaboration

### ✅ Recently Completed (January 2025)

**Phase 23.5: City Itinerary Pages - COMPLETE** ✅
- ✅ City itinerary data system (`lib/itinerary/city-itineraries.ts`)
- ✅ 6 English cities: Rome (2 and 3 days), Paris, Barcelona, Amsterdam, London
- ✅ 6 Spanish cities: Rome, Madrid, Paris, Barcelona, Lisbon
- ✅ Itinerary i18n system (`lib/i18n/itinerary.ts`) for bilingual UI
- ✅ 14 itinerary UI components (`components/itinerary/`)
- ✅ Day plans, city stats, logistics, checklists, FAQs
- ✅ Interactive checklist (no sign-in required)
- ✅ Editorial image info cards
- ✅ Related itineraries for cross-linking

**Phase 23: SEO & Programmatic Marketing - COMPLETE** ✅
- ✅ Dynamic `robots.txt` and `sitemap.xml` via App Router routes
- ✅ SEO utility library (`lib/seo/`) with canonical URLs, metadata builder
- ✅ Bilingual marketing routes (`/en`, `/es`) with hreflang alternates
- ✅ Programmatic city and influencer pages with structured data (JSON-LD)
- ✅ Marketing i18n system (`lib/i18n/marketing.ts`) for bilingual copy
- ✅ StructuredData component for WebSite, Organization, TouristTrip, ProfilePage schemas
- ✅ Private routes blocked from indexing
- ✅ Footer internal links fixed

**Infrastructure & UX Improvements - COMPLETE** ✅
- ✅ Trip deletion feature with DELETE API endpoint
- ✅ Route helper utilities (`lib/routes.ts` with `getTripUrl()`)
- ✅ Clerk user ID migration improvements (profile lookup enhancements)
- ✅ Enhanced trip list UI with past trips section and delete functionality
- ✅ Automatic trip invitation linking on trips list load
- ✅ **City Autocomplete Feature** - Enhanced destination search with Google Places Autocomplete
- ✅ **Usage Limits System** - Per-user-per-trip tracking for swipes, changes, and search adds
- ✅ **Activity Replace Feature** - Smart replacement with context-aware suggestions and usage limits
- ✅ **AI Itinerary Enhancements** - Segment support and food place limits

**Phase 22: Email System & Notifications - COMPLETE** ✅
- ✅ Complete email infrastructure with Resend integration
- ✅ Email template system with 7 email types (welcome, trip ready, Pro upgrade, subscription canceled, trip reminder, trip invite, expenses summary)
- ✅ Multi-language email support (English and Spanish)
- ✅ Email sending infrastructure (`lib/email/resend.ts`)
- ✅ Email copy management (`lib/email-copy.ts`)
- ✅ Language normalization (`lib/email/language.ts`)
- ✅ Cron job for trip reminder emails (`/api/cron/trip-reminders`)
- ✅ Email integration with itinerary generation
- ✅ Email integration with billing webhook
- ✅ Database tracking fields for email sent timestamps
- ✅ Idempotency checking to prevent duplicate emails
- ✅ Test endpoints for all email types (`/api/test/*`)
- ✅ Migration file: `database/migrations/add-email-sent-fields.sql`

**Phase 21: Travel Advisor (Pre-Trip Planning) - COMPLETE** ✅
- ✅ Travel Advisor page (`/advisor`) with chat interface
- ✅ API endpoint (`/api/advisor`) with GET and POST methods
- ✅ Database table `advisor_messages` for chat history
- ✅ Daily message limits (3 for free tier, 15 for Pro tier)
- ✅ Chat moderation system (blocks non-travel topics)
- ✅ Onboarding flow that creates trips directly from advisor
- ✅ Integration with homepage search (routes to advisor for travel queries)
- ✅ Transport guidance for multi-city and regional trips
- ✅ Migration file: `database/migrations/supabase-add-advisor-messages.sql`

**Billing & Subscriptions - COMPLETE** ✅
- ✅ Stripe integration for Pro subscriptions and trip-level unlocks
- ✅ Subscription checkout API endpoint
- ✅ Trip Pro unlock checkout API endpoint
- ✅ Stripe webhook handler for subscription events
- ✅ Customer portal API for subscription management
- ✅ Database migrations for billing fields
- ✅ Automatic subscription status updates

**Image Caching System - COMPLETE** ✅
- ✅ Production-proof image caching in Supabase Storage
- ✅ API endpoint for caching place images
- ✅ Health check endpoint for debugging
- ✅ Automatic image caching from multiple sources (Google Places, Unsplash, Mapbox)
- ✅ Deterministic file paths prevent duplicates
- ✅ See [images.md](./images.md) for complete documentation

**Trip Regeneration Stats - COMPLETE** ✅
- ✅ Database table for tracking daily regeneration counts
- ✅ Daily limit enforcement (2 for free, 5 for Pro)
- ✅ Integration with Smart Itinerary regeneration endpoint

**Phase 18-20: Multi-City Trips, Personalization & Enhanced Assistant - COMPLETE** ✅
- ✅ Multi-city trip support with trip segments (Pro tier)
- ✅ Trip personalization (travelers, origin, accommodation, arrival info, interests)
- ✅ Enhanced Trip Assistant with chat moderation and multi-city context
- ✅ Segment-aware days, itineraries, and explore sessions
- ✅ All migration files and API endpoints implemented

**Phase 15-16: Explore Feature - COMPLETE**
- ✅ Explore feature (Tinder-style swipe) - **COMPLETE**
- ✅ Itinerary regeneration with liked places - **COMPLETE**
- ✅ Database schema (explore_sessions table with indexes)
- ✅ API endpoints (places, swipe, session)
- ✅ Frontend components (ExploreDeck, SwipeableCard, ExploreFilters, SwipeCounter)
- ✅ Google Places integration for Explore
- ✅ Swipe limit logic (50/day free tier, unlimited Pro)
- ✅ Undo swipe functionality

**Phase 17: Day-Level Integration (COMPLETE)**
- ✅ Day-level bulk add API endpoint (`/api/trips/[tripId]/days/[dayId]/activities/bulk-add-from-swipes`)
- ✅ Day-level filtering support (filter by `day_id` in Explore API)
- ✅ User subscription system (`is_pro` column in profiles table)
- ✅ Subscription status API (`/api/user/subscription-status`)
- ✅ Advanced filters for Pro tier (budget, maxDistance)
- ✅ Daily swipe limit logic (50 for free tier, unlimited for Pro)
- ✅ UI components for day-level integration - **COMPLETE**
  - ✅ "Add activities" button on each time slot
  - ✅ Day-level Explore drawer/sheet
  - ✅ Pre-filtering by day's neighborhood and time slot
  - ✅ Immediate add-to-day on swipe right
  - ✅ Full ExploreDeck day mode integration
- ✅ Trip invitation linking feature
  - ✅ API endpoint: `/api/user/link-trip-invitations`
  - ✅ Auto-links email invitations to user accounts after signup
- ✅ Day-level bulk add API endpoint (`/api/trips/[tripId]/days/[dayId]/activities/bulk-add-from-swipes`)
- ✅ Day-level filtering support (filter by `day_id` in Explore API)
- ✅ User subscription system (`is_pro` column in profiles table)
- ✅ Subscription status API (`/api/user/subscription-status`)
- ✅ Advanced filters for Pro tier (budget, maxDistance)
- ✅ Daily swipe limit logic (50 for free tier, unlimited for Pro)
- ✅ UI components for day-level integration - **COMPLETE**
  - ✅ "Add activities" button on each time slot
  - ✅ Day-level Explore drawer/sheet
  - ✅ Pre-filtering by day's neighborhood and time slot
  - ✅ Immediate add-to-day on swipe right
  - ✅ Full ExploreDeck day mode integration
- ✅ Trip invitation linking feature
  - ✅ API endpoint: `/api/user/link-trip-invitations`
  - ✅ Auto-links email invitations to user accounts after signup

### 🚧 In Development

**Future Enhancements (Post-Phase 23)**
- Additional advanced filters (vibe, theme, accessibility) for Pro tier
- Multi-city Explore support
- Travel stats and badges system
- AI suggestions for specific day/time slot

### 📋 Planned Features

- Trip templates
- Weather integration
- Photo uploads
- Member chat
- Activity voting
- Notifications
- Mobile app
- Travel stats & badges
- Advanced filters (Pro tier)

---

## Internationalization (i18n) ✅ **NEW** (January 2025)

**Overview:**
Multi-language support system with language switching and translation management.

**Features:**
- **Language Provider** (`components/providers/language-provider.tsx`):
  - React context for language state management
  - Language switching functionality
  - Language preference persistence
- **i18n Utility** (`lib/i18n.ts`):
  - Translation key management
  - Language-specific translations
  - Translation function for components
- **Translation Coverage**:
  - Trip-related UI elements
  - Explore tab components
  - Trip members dialog
  - Hero section and landing page
  - Error messages and notifications
  - Settings and preferences

**Usage:**
```typescript
import { useLanguage } from '@/components/providers/language-provider';
import { TranslationKey } from '@/lib/i18n';

const { language, setLanguage, t } = useLanguage();
const translatedText = t('some_translation_key' as TranslationKey);
```

## Security Features ✅ **NEW** (January 2025)

**Overview:**
Comprehensive security architecture with centralized auth helpers, input validation, rate limiting, and XSS protection.

**Features:**
- **Centralized Auth Helpers** (`lib/auth/`)
  - `requireAuth()` - Ensures user is authenticated
  - `requirePro()` - Ensures account-level Pro subscription
  - `requireTripAccess()` - Ensures user has access to trip (owner or member)
  - `requireTripOwner()` - Ensures user owns the trip
  - `requireTripPro()` - Ensures user has Pro (account or trip-level)
- **Input Validation** (`lib/validation/`)
  - Zod schemas for all API route inputs
  - Validation helpers: `validateBody()`, `validateQuery()`, `validateParams()`
  - Strict mode: Unknown fields are rejected
  - Type-safe validated data
- **Rate Limiting** (`lib/rate-limit/`)
  - In-memory rate limiter (can upgrade to Redis)
  - Protected endpoints: AI (10/min, 100/hour), Places (30/min, 500/hour), Assistant/Chat (20/min, 200/hour)
  - Rate limit headers in responses
- **XSS Protection**
  - DOMPurify sanitization for user-generated content
  - Sanitization functions for different content types
- **See [SECURITY.md](./SECURITY.md) for complete documentation**

## City Itinerary Pages ✅ **NEW** (January 2025)

**Overview:**
Rich, pre-built city itinerary pages that serve as programmatic SEO content and showcase the Kruno trip planning experience. Users can browse detailed day-by-day itineraries for popular cities, then convert them into personalized trips with one click.

**Features:**
- **City Itinerary Data System** (`lib/itinerary/city-itineraries.ts`):
  - Type-safe `CityItinerary` data structure with comprehensive trip details
  - Bilingual city content (English and Spanish)
  - English cities: Rome (2 and 3 days), Paris, Barcelona, Amsterdam, London
  - Spanish cities: Rome, Madrid, Paris, Barcelona, Lisbon
  - Day plans with morning/afternoon/evening activities
  - City stats, logistics tips, pre-trip checklists, FAQs
  - Related itineraries for cross-linking between cities
  - Hero images and editorial image info cards
- **Itinerary i18n System** (`lib/i18n/itinerary.ts`):
  - Complete bilingual UI copy (English and Spanish)
  - Icon navigation labels, section titles, CTA buttons
  - Type-safe `ItineraryCopy` interface with `getItineraryCopy(locale)` function
- **14 Itinerary UI Components** (`components/itinerary/`):
  - `Hero.tsx` - Hero section with city image and eyebrow label
  - `IconNav.tsx` - Horizontal icon navigation for page sections
  - `CityStats.tsx` - City statistics grid (population, history, landmarks)
  - `QuickFacts.tsx` - Trip facts: duration, pace, ideal for, style
  - `DayOverviewTable.tsx` - At-a-glance day plan table
  - `DayBlock.tsx` - Day-by-day breakdown with morning/afternoon/evening
  - `ImageInfoCards.tsx` - Editorial image cards with city context
  - `LogisticsTable.tsx` - Practical logistics and tips table
  - `Checklist.tsx` - Interactive pre-trip checklist (no sign-in required)
  - `FAQAccordion.tsx` - Collapsible FAQ section
  - `RelatedItineraries.tsx` - Related city itinerary cards
  - `PrimaryCTA.tsx` - Call-to-action section for trip creation
  - `SectionBand.tsx` - Reusable section wrapper with styling
  - `SafeImage.tsx` - Image component with error handling

**Content Structure:**
```typescript
interface CityItinerary {
  slug: string;           // URL slug (e.g., "rome", "paris-2-days")
  city: string;           // City name
  country: string;        // Country name
  days: number;           // Trip duration
  pace: string;           // Trip pace (e.g., "Balanced")
  idealFor: string[];     // Target traveler types
  style: string[];        // Trip style tags
  hero: { title, subtitle, eyebrow, image };
  cityStats?: Array<{ value, label }>;
  fit: { forYou: string[], notForYou: string[] };
  dayPlans: DayPlan[];    // Day-by-day activities
  imageInfoCards?: Array<{ title, description, image }>;
  logistics: LogisticsItem[];
  checklist: string[];
  faqs: FaqItem[];
  relatedItineraries: RelatedItinerary[];
}
```

**User Flow:**
1. User visits `/cities/[slug]` (e.g., `/cities/rome`)
2. Views comprehensive itinerary with all sections
3. Clicks "Start planning" CTA
4. Redirected to trip creation with city pre-filled
5. AI personalizes the itinerary based on user preferences

---

## SEO & Programmatic Marketing ✅ **NEW** (January 2025)

**Overview:**
Complete SEO infrastructure with programmatic marketing pages, bilingual support, and structured data for improved search engine visibility.

**Features:**
- **Core SEO Infrastructure**:
  - `app/robots.ts` - Dynamic robots.txt generation with proper disallow rules
  - `app/sitemap.ts` - Dynamic sitemap with all marketing pages, cities, and influencers
  - `app/manifest.ts` - Web app manifest for PWA support
- **SEO Utility Library** (`lib/seo/`):
  - `urls.ts` - Canonical URL builder with UTM/tracking parameter stripping
  - `metadata.ts` - Shared metadata builder with OpenGraph/Twitter defaults
  - `site.ts` - Site configuration and base URL helper
  - `cities.ts` - City pages data for programmatic SEO
  - `influencers.ts` - Influencer pages data for programmatic SEO
- **Structured Data (JSON-LD)**:
  - WebSite and Organization schema on homepage
  - TouristTrip and BreadcrumbList on city pages
  - ProfilePage on influencer pages
  - Implemented via `components/seo/StructuredData.tsx`
- **Bilingual Marketing Routes**:
  - Localized routes under `/en` and `/es`
  - Hreflang alternates for all localized pages (en, es, x-default)
  - Marketing i18n system (`lib/i18n/marketing.ts`) with bilingual copy
  - Pages: Homepage, cities hub, city details, influencers hub, influencer details, discover
- **Programmatic SEO Pages**:
  - Cities hub with city cards and internal linking
  - City detail pages with highlights, CTA, and related cities
  - Influencers hub with creator cards and internal linking
  - Influencer detail pages with profile, CTA, and related creators
- **SEO Fixes**:
  - Private routes blocked from indexing (`noindex` directives)
  - Footer internal links fixed (removed `nofollow` and `href="#"`)
  - Canonical URLs with tracking parameter stripping
  - Consistent metadata with OpenGraph/Twitter defaults
- **See [SEO_AUDIT.md](./SEO_AUDIT.md) for audit details and fixes**

## Infrastructure & Tracking Features ✅ **NEW** (January 2025)

### Trip Creation Limit Tracking
- **Database Field**: `profiles.trips_created_count` - Tracks total number of trips ever created by a user
- **Purpose**: Enforces free tier limit of 2 trips (does not decrease when trips are deleted)
- **Migration File**: `database/migrations/add-trips-created-count-to-profiles.sql`
- **Usage**: Prevents free users from creating more than 2 trips even if they delete existing trips

### Welcome Email Tracking
- **Database Field**: `profiles.welcome_email_sent_at` - Timestamp when welcome email was sent
- **Purpose**: Enables idempotency checking for welcome email sending
- **Migration File**: `database/migrations/add-welcome-email-sent-at-to-profiles.sql`
- **Usage**: Prevents duplicate welcome emails from being sent

### Activity Image Support
- **Database Field**: `activities.image_url` - Stores image URL for activities
- **Purpose**: Allows activities to have associated images
- **Migration File**: `database/migrations/add-image-url-to-activities.sql`
- **Usage**: Display images for activities in itinerary view

### Mobile Push Notification Tokens
- **Database Table**: `user_push_tokens` - Stores Expo push notification tokens for mobile devices
- **Purpose**: Supports push notifications for mobile app
- **Schema**: `id`, `user_id`, `token`, `platform` ('ios' | 'android'), `created_at`, `last_seen_at`
- **Features**: 
  - Supports multiple devices per user (multiple tokens)
  - Platform-specific tokens (iOS/Android)
  - Last seen tracking for token cleanup
- **Migration File**: `database/migrations/add-user-push-tokens-table.sql`
- **Usage**: Mobile app push notification registration and delivery

**Last Updated:** January 2025 (Phase 23.5 City Itinerary Pages complete)

## Recent Changes Summary (January 2025)

### City Itinerary Pages ✅ **NEW**
**Complete City Itinerary Content System:**
- ✅ City itinerary data system (`lib/itinerary/city-itineraries.ts`) with type-safe `CityItinerary` structure
- ✅ 6 English cities: Rome (2 and 3 days), Paris, Barcelona, Amsterdam, London
- ✅ 6 Spanish cities: Rome, Madrid, Paris, Barcelona, Lisbon
- ✅ Day plans with morning/afternoon/evening activities
- ✅ City stats, logistics, checklists, FAQs for each city
- ✅ Related itineraries for cross-linking
- ✅ Itinerary i18n system (`lib/i18n/itinerary.ts`) for bilingual UI copy
- ✅ 14 new itinerary UI components (`components/itinerary/`):
  - Hero, IconNav, CityStats, QuickFacts, DayOverviewTable, DayBlock
  - ImageInfoCards, LogisticsTable, Checklist, FAQAccordion
  - RelatedItineraries, PrimaryCTA, SectionBand, SafeImage

### Email System & Notifications ✅ **NEW**
**Complete Email Infrastructure:**
- ✅ Email template system with 7 email types (`lib/email-copy.ts`)
- ✅ Multi-language email support (English and Spanish) (`lib/email/language.ts`)
- ✅ Resend integration for email delivery (`lib/email/resend.ts`)
- ✅ Email types: Welcome, Trip Ready, Pro Upgrade, Subscription Canceled, Trip Reminder, Trip Invite, Expenses Summary
- ✅ Cron job for trip reminder emails (`/api/cron/trip-reminders`)
- ✅ Email integration with itinerary generation (smart-itinerary and ai-itinerary routes)
- ✅ Email integration with billing webhook (Pro upgrade and cancellation)
- ✅ Database tracking fields for email sent timestamps (idempotency)
- ✅ Test endpoints for all email types (`/api/test/*`)
- ✅ Migration: `database/migrations/add-email-sent-fields.sql`

### Added

### UI Components & Infrastructure ✅ **NEW**

**App Header Component** (`components/app-header.tsx`):
- Unified app header with Logo, navigation, and user controls
- Sign in/Sign up buttons for unauthenticated users
- Settings link and UserButton for authenticated users
- Language provider integration for internationalization
- Responsive container layout

**Logo Component** (`components/ui/logo.tsx`):
- Reusable Logo component with "Kruno" branding
- Orange color scheme with custom font (Patrick Hand)
- Used throughout the application for consistent branding

**Enhanced Itinerary Tab** (`components/itinerary-tab.tsx`):
- Day-level Explore integration with "Add activities" buttons on each time slot
- ExploreDeck component integration for day-specific place discovery
- Pre-filtering by day's neighborhood (areaCluster) and time slot
- Immediate add-to-day: swiping right in day mode adds place directly to that day/slot
- Usage limits display and enforcement (swipes, changes, search adds)
- Photo resolution with cached image support (`resolvePlacePhotoSrc`)
- Past-day lock protection (prevents modifying past days)
- Activity count limits per day (MAX_ACTIVITIES_PER_DAY)
- Enhanced UI with accordion-style day headers (`DayAccordionHeader`)
- Smart itinerary loading and error handling
- Segment-aware itinerary display for multi-city trips

**AI Itinerary Route Enhancements** (`app/api/ai-itinerary/route.ts`):
- Multi-city trip segment support (`trip_segment_id` parameter)
- Food place limit enforcement (max 1 per time slot: morning/afternoon/evening)
- Improved food place detection using Google Places types
- Better photo matching with saved places (`matchSuggestionToSavedPlace`)
- Enhanced photo deduplication logic (`usedImageUrls`, `usedPlaceIds`)
- Generic city photo fallback when place photos unavailable
- City resolution from coordinates for landmark destinations
- Segment-aware day loading and itinerary generation

**Google Places Server Utilities** (`lib/google/places-server.ts`):
- Enhanced photo fetching with deduplication support
- City resolution from lat/lng coordinates (`getCityFromLatLng`)
- Landmark detection (`isLandmark`) for better destination handling
- Place photo reference fetching by place_id (`getPlacePhotoReference`)
- Generic city photo fallback functionality (`getGenericCityPhoto`)
- Improved photo URL construction and caching
- Place details fetching with comprehensive field support

### Added
- **City Itinerary Pages** (Phase 23.5):
  - Rich city itinerary content system with 6 English and 6 Spanish cities
  - Itinerary i18n system for bilingual UI
  - 14 new itinerary UI components
- **SEO & Programmatic Marketing** (Phase 23):
  - Dynamic `robots.txt` and `sitemap.xml` via App Router routes
  - SEO utility library with canonical URL builder, metadata helper
  - Bilingual marketing routes (`/en`, `/es`) with hreflang alternates
  - Programmatic city and influencer pages with structured data (JSON-LD)
  - Marketing i18n system for bilingual copy
- **Email System & Notifications**: Complete email infrastructure with Resend
- **Billing & Subscriptions System**: Complete Stripe integration
- **Image Caching System**: Production-proof image storage in Supabase Storage
- **Trip Regeneration Stats**: Daily regeneration limit tracking
- **Security Architecture**: Centralized auth helpers, input validation, rate limiting, XSS protection
- **Activity Replace Feature**: Smart activity replacement with usage limits
- **City Autocomplete**: Enhanced destination search
- **Usage Limits System**: Per-user-per-trip tracking

### Changed
- **Pro vs Free Limits**: Updated swipe limits (10 per trip for free, 100 for Pro)
- **Change Limits**: Added (5 for free, unlimited for Pro)
- **Search Add Limits**: Added (5 for free, unlimited for Pro)
- **Security**: All API routes now use centralized auth helpers and Zod validation
- **Footer Links**: Fixed internal links (removed `nofollow` and `href="#"`)
- **Private Routes**: Added `noindex` directives to auth and private pages

### Removed
- None (no features removed in this update)

