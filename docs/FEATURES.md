# MindTrip - Features Documentation

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

### Trip Management

**Create Trip**
- Search for destination city
- Set trip dates (start and end)
- Trip name and description
- Auto-generate days based on date range
- Set trip preferences (budget, interests, currency)

**Trip List**
- View all trips user is a member of
- Filter by status (upcoming, in progress, completed)
- Search trips
- Sort by date, name, etc.

**Trip Details**
- View trip information
- Edit trip details
- Delete trip
- Invite members
- View trip members

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

### 🚧 In Development

**Future Enhancements (Post-Phase 17)**
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

**Last Updated:** January 2025

