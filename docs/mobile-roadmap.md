# Kruno Mobile App Roadmap

This document outlines the complete plan for building a native mobile application for Kruno using Expo and React Native. This roadmap is designed to guide development from initial planning through App Store and Google Play Store launch.

> **Note:** This is a planning document for the mobile app. For the web app roadmap and completed features, see [ROADMAP.md](./ROADMAP.md).

## Overview

The Kruno mobile app will bring the full travel planning experience to iOS and Android devices. Users will be able to create trips, build itineraries, explore destinations, track expenses, manage checklists, and collaborate with trip members—all from their phones. The app will share the same Supabase backend as the web application, ensuring data consistency across platforms.

The mobile app is not just a responsive version of the website; it's designed to take advantage of native mobile features like push notifications, location services, offline capabilities, and deep linking. This allows users to access their trip information even when they're traveling in areas with poor connectivity.

## Tech Stack

### Core Framework
- **Expo SDK 50+**: We're using Expo because it provides a streamlined development experience, handles native code compilation, and simplifies deployment. Expo's managed workflow means we can build and deploy without touching native iOS or Android code directly.
- **React Native**: The underlying framework that powers Expo. React Native allows us to write JavaScript/TypeScript code that compiles to native iOS and Android apps.
- **TypeScript**: Same type safety and developer experience we use in the web app. This ensures consistency across platforms and catches errors before they reach production.

### Backend & Data
- **Supabase JavaScript Client**: The same Supabase instance and database schema used by the web app. This means mobile users see the same trips, activities, and data as web users in real-time.
- **React Query (TanStack Query)**: For data fetching, caching, and synchronization. React Query handles the complexity of keeping data fresh, managing loading states, and handling errors gracefully.
- **Structured Itinerary Schema**: The mobile app will consume the same structured itinerary JSON schema stored in `smart_itineraries` table, using Zod for runtime validation (shared TypeScript types from web app).

### Authentication
- **Clerk React Native SDK**: Clerk provides a native mobile SDK that handles authentication flows, social logins (Google, Apple), and session management. It integrates seamlessly with our existing Clerk setup on the web, so users can sign in once and access both platforms.

### Maps & Location
- **react-native-maps**: This is the most popular and well-maintained mapping library for React Native. It provides native map components for both iOS (using Apple Maps) and Android (using Google Maps), giving users the best map experience on each platform. It supports markers, custom styling, user location tracking, and offline map tiles.
  
  *Alternative consideration: We could use Mapbox GL React Native to match our web app, but react-native-maps is more widely adopted, has better community support, and doesn't require additional API keys for basic usage. If we need advanced Mapbox features later (like custom map styles or routing), we can migrate.*

### Navigation
- **React Navigation**: The standard navigation library for React Native. We'll use stack navigation for screen transitions, tab navigation for the trip detail screens, and drawer navigation for the main menu.

### State Management
- **Zustand or React Context**: For global app state (user preferences, theme, etc.). Most data will come from React Query, but we'll need lightweight state management for UI state and app-wide settings.

### UI Components
- **React Native Paper or NativeBase**: A component library that provides pre-built, accessible UI components styled for mobile. This speeds up development and ensures consistent design patterns.
- **React Native Reanimated**: For smooth animations and transitions that feel native to each platform.

### Development Tools
- **Expo Dev Client**: For development builds that include custom native code.
- **Flipper**: For debugging network requests, React state, and native logs.
- **React Native Debugger**: For inspecting React components and Redux state.

## Architecture

### Project Structure

```
mobile/
├── app/                      # Expo Router (file-based routing)
│   ├── (auth)/              # Auth screens (sign-in, sign-up)
│   ├── (tabs)/              # Main app tabs
│   │   ├── trips/          # Trips list
│   │   ├── explore/        # Explore map/list
│   │   └── profile/        # User profile
│   └── trip/[id]/          # Trip detail screens
├── components/              # Reusable components
│   ├── ui/                  # Base UI components
│   ├── trip/                # Trip-specific components
│   └── map/                 # Map components
├── hooks/                   # Custom React hooks
│   ├── use-trip.ts
│   ├── use-activities.ts
│   └── use-offline.ts
├── lib/                     # Utilities and services
│   ├── supabase/           # Supabase client setup
│   ├── clerk/              # Clerk client setup
│   ├── storage/            # AsyncStorage wrapper
│   └── api/                # API service layer
├── types/                   # TypeScript definitions
├── constants/               # App constants (colors, sizes)
└── assets/                  # Images, fonts, icons
```

### Data Flow

1. **User opens app**: Clerk checks for existing session, redirects to auth if needed
2. **App loads**: React Query fetches user's trips from Supabase
3. **User navigates**: Screens fetch specific data (trip details, activities, etc.)
4. **Real-time updates**: Supabase Realtime subscriptions push changes to all connected clients
5. **Offline mode**: Data is cached locally using AsyncStorage, synced when connection returns

### API Layer

We'll create a service layer that abstracts Supabase calls:

```typescript
// lib/api/trips.ts
export const tripService = {
  getAll: () => supabase.from('trips').select('*'),
  getById: (id: string) => supabase.from('trips').select('*, days(*)').eq('id', id),
  create: (data: TripInput) => supabase.from('trips').insert(data),
  // ... etc
}
```

This makes it easy to:
- Add offline caching logic
- Handle errors consistently
- Mock data for testing
- Switch backends if needed (unlikely, but good practice)

## Screens and Navigation

### Main Navigation Structure

The app uses a tab-based navigation at the root level, with stack navigation for each section:

```
Root Navigator (Tabs)
├── Trips Tab
│   └── Stack Navigator
│       ├── Trips List Screen
│       └── Trip Detail Screen (with nested tabs)
├── Explore Tab
│   └── Stack Navigator
│       ├── Explore Map/List Screen
│       └── Place Detail Screen
└── Profile Tab
    └── Stack Navigator
        ├── Profile Screen
        └── Settings Screen
```

### Screen List for v1

#### 1. Auth Screens
- **Sign In Screen**: Email/password and social login options (Google, Apple)
- **Sign Up Screen**: Registration form with email verification
- **Forgot Password Screen**: Password reset flow

#### 2. Trips List Screen
- Displays all trips the user is a member of
- Pull-to-refresh to sync latest data
- Search/filter functionality
- Create new trip button (floating action button)
- Shows trip status (upcoming, in progress, completed)
- Displays trip dates and member count

#### 3. Trip Detail Screen (with nested tabs)
This is the main screen users will spend time in. It uses tab navigation within the screen:

- **Overview Tab**: 
  - Trip name, dates, destination
  - Member list with avatars
  - Quick stats (total activities, expenses, checklist progress)
  - Share trip button
  - Trip settings button

- **Itinerary Tab**:
  - Day selector (horizontal scrollable list)
  - Activities list for selected day
  - Add activity button
  - Drag-to-reorder activities
  - Tap activity to view/edit details
  - Map view toggle (shows activities on map)

- **Explore Tab**:
  - Search for places near trip destination
  - Map view with nearby places
  - List view with place cards
  - Add place to itinerary button
  - Filter by category (restaurants, attractions, etc.)

- **Budget Tab**:
  - Total expenses and per-person breakdown
  - Expense list grouped by category
  - Add expense button
  - Currency selector
  - Balance calculator (who owes whom)

- **Settings Tab**:
  - Trip name and dates editor
  - Member management (invite, remove)
  - Delete trip option
  - Export trip (PDF, share link)

#### 4. Explore Map / List Screen
- Full-screen map view
- Toggle to list view
- Search bar for destinations
- Filter by place type
- Shows saved places and nearby recommendations
- Can add places directly to any trip

#### 5. Add / Edit Activity Screen
- Form fields: name, description, time, place
- Place search and selection
- Link to existing place or create new
- Notes field
- Save/Cancel buttons
- Delete option (edit mode)

#### 6. Expenses and Balances Screen
- List of all expenses for the trip
- Group by category or date
- Add expense button
- Expense detail view (edit, delete)
- Balance summary at top
- Per-person breakdown

#### 7. Checklists Screen
- List of all checklists for the trip
- Create new checklist
- Checklist detail view with items
- Check/uncheck items
- Add/edit/delete checklist items
- Progress indicator

## Data and API Layer

### Supabase Client Setup

We'll configure the Supabase client to work with React Native:

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
    },
  }
)
```

### React Query Integration

All data fetching goes through React Query for caching and synchronization:

```typescript
// hooks/use-trips.ts
export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: () => tripService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

### Real-time Subscriptions

We'll use Supabase Realtime to keep data in sync:

```typescript
// hooks/use-realtime-activities.ts
export function useRealtimeActivities(tripId: string) {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const channel = supabase
      .channel(`activities:${tripId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'activities',
        filter: `trip_id=eq.${tripId}`,
      }, (payload) => {
        queryClient.invalidateQueries(['activities', tripId])
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [tripId])
}
```

### Offline Support

We'll implement optimistic updates and local caching:

1. **Optimistic Updates**: When user creates/edits data, update UI immediately, then sync to server
2. **Local Cache**: Store recent data in AsyncStorage
3. **Sync Queue**: Queue mutations when offline, sync when connection returns
4. **Conflict Resolution**: Last-write-wins for simple cases, manual resolution for complex conflicts

## Auth (Clerk on Mobile)

### Clerk React Native Setup

Clerk provides a React Native SDK that handles authentication:

```typescript
// lib/clerk/client.ts
import { ClerkProvider } from '@clerk/clerk-expo'

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

export function ClerkProviderWrapper({ children }) {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  )
}
```

### Authentication Flow

1. **App Launch**: Check if user is signed in via Clerk
2. **Not Signed In**: Show sign-in screen
3. **Signed In**: Fetch user data from Supabase using Clerk user ID
4. **Session Management**: Clerk handles token refresh automatically
5. **Sign Out**: Clear Clerk session and local cache

### Social Logins

Clerk supports:
- Google OAuth (same as web)
- Apple Sign In (iOS native)
- Email/password

We'll configure these in the Clerk dashboard to match our web app settings.

### User ID Mapping

Since we use Clerk for auth but Supabase for data, we need to ensure the user ID from Clerk matches what's stored in Supabase. The web app already handles this by storing Clerk user IDs in the database, so the mobile app will work seamlessly.

## Maps and Location

### React Native Maps Implementation

We'll use `react-native-maps` which provides native map components:

```typescript
// components/map/TripMap.tsx
import MapView, { Marker } from 'react-native-maps'

export function TripMap({ activities }) {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      {activities.map(activity => (
        <Marker
          key={activity.id}
          coordinate={{
            latitude: activity.place.latitude,
            longitude: activity.place.longitude,
          }}
          title={activity.name}
        />
      ))}
    </MapView>
  )
}
```

### Features

- **Markers**: Show activities and places on map
- **User Location**: Request location permission and show user's current location
- **Clustering**: Group nearby markers for better performance
- **Custom Markers**: Use trip-specific icons
- **Directions**: Link to Apple Maps / Google Maps for navigation
- **Offline Maps**: Cache map tiles for offline viewing (requires additional setup)

### Location Permissions

We'll request location permissions when needed:
- When user wants to see their location on map
- When searching for nearby places
- When adding current location as a place

We'll use `expo-location` for permission handling and location services.

## Offline and Caching Strategy

### What Needs to Work Offline

1. **View trips and activities** (read-only when offline)
2. **View expenses and checklists**
3. **View saved places**
4. **Basic navigation between screens**

### What Requires Internet

1. **Creating new trips**
2. **Adding/editing activities** (queued for sync)
3. **Real-time collaboration updates**
4. **Searching for new places**
5. **Syncing expense changes**

### Caching Strategy

1. **React Query Cache**: Automatically caches API responses
2. **AsyncStorage**: Persist critical data (trips list, current trip data)
3. **Image Caching**: Use `expo-image` which handles image caching automatically
4. **Map Tiles**: Cache frequently viewed map areas

### Sync Strategy

When the app comes back online:
1. Check for queued mutations
2. Sync in order (FIFO)
3. Handle conflicts (show user if manual resolution needed)
4. Refresh React Query cache
5. Re-establish Realtime subscriptions

### Offline Indicators

- Show connection status in app header
- Disable actions that require internet
- Show queued changes count
- Toast notification when sync completes

## Notifications

### Push Notifications Setup

We'll use Expo's push notification service:

1. **Expo Notifications**: For receiving push notifications
2. **Device Tokens**: Register device tokens with our backend
3. **Notification Service**: Create a Supabase Edge Function or API route to send notifications

### Notification Types

1. **Trip Invitations**: "John invited you to Paris Trip"
2. **Activity Updates**: "Sarah added 'Eiffel Tower' to Day 1"
3. **Expense Updates**: "Mike added a $50 expense"
4. **Checklist Reminders**: "3 items left on your packing list"
5. **Trip Reminders**: "Your trip to Paris starts in 2 days"

### Notification Handling

- **Foreground**: Show in-app notification banner
- **Background**: Show native notification
- **Tapped**: Deep link to relevant screen (trip detail, activity, etc.)

### Local Notifications

For reminders and alerts that don't require server:
- Trip start date reminders
- Activity time reminders
- Checklist item reminders

## Deep Linking

### URL Scheme

We'll configure deep links so users can:
- Open specific trips: `kruno://trip/123`
- Open activities: `kruno://trip/123/activity/456`
- Share trip links that open in app: `kruno://trip/123` or `https://kruno.app/trip/123`

### Implementation

Using Expo's linking API:

```typescript
// app.json
{
  "expo": {
    "scheme": "kruno",
    "associatedDomains": ["applinks:kruno.app"]
  }
}
```

### Use Cases

1. **Email Links**: Trip invitation emails open app directly
2. **Share Links**: Public trip shares can open in app if installed
3. **Push Notifications**: Tapping notification deep links to relevant screen
4. **Web to App**: Web app can detect mobile and prompt to open in app

## Environments (dev/staging/prod)

### Environment Configuration

We'll use Expo's environment variable system:

```typescript
// app.config.js
export default {
  expo: {
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      clerkKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      environment: process.env.NODE_ENV,
    },
  },
}
```

### Environment Files

- `.env.development`: Local development (pointing to dev Supabase project)
- `.env.staging`: Staging environment (separate Supabase project)
- `.env.production`: Production (same Supabase as web app)

### Build Variants

1. **Development Build**: Includes dev tools, debugging, points to dev backend
2. **Staging Build**: Production-like but points to staging backend, separate app ID
3. **Production Build**: Final app for App Store/Play Store

### Testing Strategy

- **Development**: Test on physical devices via Expo Go or dev build
- **Staging**: Internal testing via TestFlight (iOS) and Internal Testing (Android)
- **Production**: Beta testing via TestFlight and Google Play Beta

## App Store / Google Play Requirements and Checklist

### Developer Accounts

- [ ] **Apple Developer Account**: $99/year
  - Enroll at developer.apple.com
  - Complete identity verification
  - Set up payment information
  
- [ ] **Google Play Developer Account**: $25 one-time fee
  - Create account at play.google.com/console
  - Complete identity verification
  - Set up payment information

### App Identifiers

- [ ] **iOS Bundle ID**: `com.kruno.app` (or your chosen identifier)
  - Must be unique and registered in Apple Developer portal
  - Cannot be changed after first release
  
- [ ] **Android Package Name**: `com.kruno.app` (must match iOS if possible)
  - Defined in `app.json` or `app.config.js`
  - Cannot be changed after first release

### App Icons

- [ ] **iOS App Icon**: 1024x1024px PNG (no transparency, no rounded corners - iOS adds them)
  - All sizes generated automatically by Expo
  
- [ ] **Android App Icon**: 1024x1024px PNG
  - Adaptive icon: 1024x1024px foreground + 1024x1024px background
  - All sizes generated automatically by Expo

### Splash Screen

- [ ] **Splash Screen Design**: 1242x2436px (iPhone X size)
  - Logo centered
  - Brand colors
  - Configure in `app.json`
  
- [ ] **Android Splash Screen**: Similar design, different dimensions
  - Expo handles both platforms

### Screenshots and Preview Video

- [ ] **iOS Screenshots** (required for each device size):
  - iPhone 6.7" (iPhone 14 Pro Max): 1290x2796px
  - iPhone 6.5" (iPhone 11 Pro Max): 1242x2688px
  - iPhone 5.5" (iPhone 8 Plus): 1242x2208px
  - iPad Pro 12.9": 2048x2732px
  - Minimum 3 screenshots, maximum 10
  
- [ ] **Android Screenshots**:
  - Phone: 1080x1920px or higher
  - Tablet: 1200x1920px or higher
  - Minimum 2 screenshots, maximum 8
  
- [ ] **Preview Video** (optional but recommended):
  - 15-30 seconds showing app in action
  - iPhone: 1080x1920px, MP4 or MOV
  - Android: 1080x1920px, MP4 or WebM

### Privacy Policy and Terms of Service

- [ ] **Privacy Policy URL**: Must be publicly accessible
  - Host on your website (e.g., `https://kruno.app/privacy`)
  - Must cover: data collection, usage, storage, third-party services (Supabase, Clerk, Mapbox)
  - Required for both iOS and Android
  
- [ ] **Terms of Service URL**: Must be publicly accessible
  - Host on your website (e.g., `https://kruno.app/terms`)
  - Required for iOS, recommended for Android

### Data Collection Description

- [ ] **iOS Privacy Nutrition Labels**: Complete in App Store Connect
  - Data types collected: Location, User Content, Identifiers
  - Purpose: App Functionality, Analytics
  - Linked to user: Yes/No
  - Used for tracking: Yes/No
  
- [ ] **Android Data Safety Section**: Complete in Google Play Console
  - Data types: Location, Personal info, App activity
  - Purpose: App functionality, Analytics
  - Shared with third parties: Yes (Supabase, Clerk)
  - Data encryption: Yes (in transit and at rest via Supabase)

### App Store Listing

- [ ] **App Name**: "Kruno" (or chosen name, 30 char limit)
- [ ] **Subtitle** (iOS): Short tagline, 30 char limit
- [ ] **Description**: 4000 char limit, explain features and benefits
- [ ] **Keywords** (iOS): Comma-separated, 100 char limit
- [ ] **Category**: Travel (primary), Productivity (secondary)
- [ ] **Age Rating**: Complete questionnaire (likely 4+ or 12+)
- [ ] **Support URL**: Link to help/support page
- [ ] **Marketing URL** (optional): Link to website

### Additional Requirements

- [ ] **App Store Review Guidelines Compliance**: 
  - No placeholder content
  - Functional app with real features
  - Proper error handling
  - No crashes
  
- [ ] **Google Play Policy Compliance**:
  - Content rating questionnaire
  - Target audience and content
  - Ads policy (if applicable)
  
- [ ] **Accessibility**: 
  - Support VoiceOver (iOS) and TalkBack (Android)
  - Proper labels and hints
  - Color contrast compliance
  
- [ ] **Localization** (if applicable):
  - App name and description in multiple languages
  - Screenshots for different regions

### Testing Requirements

- [ ] **TestFlight Setup** (iOS):
  - Add internal testers
  - Add external testers (up to 10,000)
  - Test builds before submission
  
- [ ] **Google Play Internal Testing** (Android):
  - Create internal testing track
  - Add testers via email
  - Test builds before production release

## Release and Update Strategy

### Versioning

We'll follow semantic versioning:
- **Major.Minor.Patch** (e.g., 1.0.0)
- Major: Breaking changes
- Minor: New features, backward compatible
- Patch: Bug fixes

### Release Channels

1. **Development**: Continuous builds for internal testing
2. **Staging**: Weekly builds for QA and stakeholders
3. **Production**: Monthly releases (or as needed for critical fixes)

### Update Strategy

- **Over-the-Air (OTA) Updates**: Use Expo Updates for JavaScript/asset updates
  - Can push updates without App Store review (for JS code only)
  - Native code changes still require new build and App Store review
  
- **App Store Updates**: For native code changes, new features requiring native modules
  - Submit for review (typically 24-48 hours)
  - Phased rollout option (1% → 10% → 50% → 100%)

### Rollback Plan

- Keep previous version available in App Store Connect
- Can halt phased rollout if issues detected
- OTA updates can be rolled back immediately via Expo dashboard

### Monitoring

- **Crash Reporting**: Use Sentry or similar
- **Analytics**: Track app usage, screen views, feature adoption
- **Performance**: Monitor API response times, app launch time
- **User Feedback**: In-app feedback form, App Store reviews

## Phased Timeline

### Phase 0: Harden Backend and APIs for Mobile Use
**Duration: 2-3 weeks**

Before building the mobile app, we need to ensure our backend is mobile-ready:

- [ ] **API Endpoint Review**: Audit all Supabase queries used in web app
- [ ] **Optimize Queries**: Ensure queries are efficient (proper indexes, minimal data fetching)
- [ ] **Error Handling**: Standardize error responses for mobile consumption
- [ ] **Rate Limiting**: Implement if not already present
- [ ] **CORS Configuration**: Ensure Supabase allows mobile app origins
- [ ] **Realtime Testing**: Verify Realtime subscriptions work reliably
- [ ] **Offline Considerations**: Design APIs to support offline-first patterns
- [ ] **Documentation**: Document all API endpoints and data structures
- [ ] **Testing**: Create API tests to catch regressions

**Deliverables**: 
- Optimized and documented API layer
- Test suite for critical endpoints
- Performance benchmarks

---

### Phase 1: Scaffold Expo App and Basic Navigation + Clerk Auth
**Duration: 2-3 weeks**

Set up the foundation of the mobile app:

- [ ] **Expo Project Setup**: Initialize Expo project with TypeScript
- [ ] **Project Structure**: Create folder structure (app/, components/, lib/, etc.)
- [ ] **Navigation Setup**: Configure React Navigation with tabs and stacks
- [ ] **Clerk Integration**: Set up Clerk React Native SDK
- [ ] **Auth Screens**: Build sign-in, sign-up, forgot password screens
- [ ] **Auth Flow**: Implement authentication flow and session management
- [ ] **Supabase Client**: Configure Supabase client for React Native
- [ ] **Environment Setup**: Configure dev/staging/prod environments
- [ ] **Basic UI Components**: Set up component library (buttons, inputs, etc.)
- [ ] **Error Boundaries**: Add error handling and crash reporting setup
- [ ] **Development Tools**: Set up debugging tools (Flipper, React Native Debugger)

**Deliverables**:
- Working Expo app that can authenticate users
- Basic navigation structure
- Development environment ready for feature work

---

### Phase 2: Trips List + Trip Detail Read-Only
**Duration: 3-4 weeks**

Build the core screens for viewing trips:

- [ ] **Trips List Screen**: 
  - Fetch and display user's trips
  - Pull-to-refresh
  - Search/filter functionality
  - Create trip button (opens form, but save disabled for now)
  
- [ ] **Trip Detail Screen Structure**:
  - Tab navigation (Overview, Itinerary, Explore, Budget, Settings)
  - Header with trip name and dates
  
- [ ] **Overview Tab**:
  - Trip information display
  - Member list
  - Quick stats
  
- [ ] **Itinerary Tab (Read-Only)**:
  - Day selector
  - Smart itinerary view with slots (morning, afternoon, evening)
  - Activities/places list for selected day
  - Activity/place cards with photos (read-only)
  - Image galleries and lightbox viewer
  - Map view toggle showing activities
  
- [ ] **Explore Tab (Read-Only)**:
  - Search for places
  - Map/list view toggle
  - Place cards (read-only, no add to itinerary yet)
  
- [ ] **Budget Tab (Read-Only)**:
  - Expense list
  - Balance summary
  - Per-person breakdown
  
- [ ] **Settings Tab**:
  - Trip information display
  - Member list (read-only)
  
- [ ] **Real-time Sync**: Set up Realtime subscriptions for trips and activities
- [ ] **Loading States**: Skeleton screens and loading indicators
- [ ] **Error States**: Empty states and error messages

**Deliverables**:
- Fully functional read-only trip viewing experience
- Real-time updates when data changes
- Smooth navigation and transitions

---

### Phase 3: Itinerary Editing and Explore
**Duration: 4-5 weeks**

Add the ability to create and edit trip content:

- [ ] **Activity CRUD**:
  - Add activity screen/form
  - Edit activity screen
  - Delete activity functionality
  - Place search and selection
  - Link to existing place or create new
  
- [ ] **Itinerary Enhancements**:
  - Display structured smart itineraries (slots, themes, area clusters)
  - Smart itinerary generation with structured JSON format
  - Itinerary chat editing (natural language editing via chat interface)
  - Mark places as visited
  - Remove places from itinerary
  - Drag-to-reorder activities (for traditional activity-based trips)
  - Edit activity time
  - Delete activities
  - Optimistic updates
  - Image galleries and lightbox for place photos
  
- [ ] **Explore Functionality**:
  - Add place to itinerary from explore
  - Select day when adding place
  - Filter places by category
  - Save places for later
  
- [ ] **Map Integration**:
  - Show activities on map in itinerary
  - Show nearby places on explore map
  - Custom markers
  - User location (with permission)
  - Directions link to native maps app
  
- [ ] **Trip Creation**:
  - Create trip form
  - Set trip name, dates, destination
  - Invite members (basic implementation)
  
- [ ] **Offline Support**:
  - Cache trip data locally
  - Queue mutations when offline
  - Sync when connection returns

**Deliverables**:
- Full itinerary editing capabilities
- Place discovery and adding to trips
- Map integration with markers and user location
- Basic offline support

---

### Phase 4: Expenses, Checklists, Notifications
**Duration: 4-5 weeks**

Complete the remaining core features:

- [ ] **Expense Management**:
  - Add/edit/delete expenses
  - Category selection
  - Currency support
  - Per-person assignment
  - Balance calculations
  
- [ ] **Checklist Management**:
  - Create/edit/delete checklists
  - Add/edit/delete checklist items
  - Check/uncheck items
  - Progress tracking
  
- [ ] **Trip Settings**:
  - Edit trip name and dates
  - Member management (invite, remove)
  - Delete trip
  - Export trip (share link, PDF)
  
- [ ] **Push Notifications**:
  - Set up Expo push notifications
  - Register device tokens
  - Notification service (Supabase Edge Function or API)
  - Handle notification taps (deep linking)
  - Local notifications for reminders
  
- [ ] **Deep Linking**:
  - Configure URL scheme
  - Handle deep links to trips/activities
  - Share links that open in app
  
- [ ] **Polish**:
  - Animations and transitions
  - Error handling improvements
  - Performance optimization
  - Accessibility improvements

**Deliverables**:
- Complete feature set matching web app
- Push notifications working
- Deep linking functional
- Polished user experience

---

### Phase 5: App Store / Play Store Launch
**Duration: 3-4 weeks**

Prepare and submit the app for distribution:

- [ ] **App Store Assets**:
  - Design and export app icon (all sizes)
  - Create splash screen
  - Take screenshots for all required device sizes
  - Record preview video
  - Write app description and metadata
  
- [ ] **Legal Requirements**:
  - Finalize privacy policy
  - Finalize terms of service
  - Complete data collection disclosures
  
- [ ] **Testing**:
  - Internal testing on TestFlight (iOS)
  - Internal testing on Google Play (Android)
  - Beta testing with external testers
  - Fix critical bugs found in testing
  
- [ ] **Final Polish**:
  - Performance optimization
  - Crash fix verification
  - Accessibility audit
  - Localization (if applicable)
  
- [ ] **Submission**:
  - Build production versions
  - Submit to App Store Connect
  - Submit to Google Play Console
  - Respond to review feedback
  
- [ ] **Launch**:
  - Coordinate launch date
  - Prepare marketing materials
  - Monitor initial reviews and ratings
  - Hotfix any critical issues

**Deliverables**:
- App live on App Store and Google Play
- Marketing materials ready
- Monitoring and analytics in place

---

## Total Estimated Timeline

- **Phase 0**: 2-3 weeks
- **Phase 1**: 2-3 weeks
- **Phase 2**: 3-4 weeks
- **Phase 3**: 4-5 weeks
- **Phase 4**: 4-5 weeks
- **Phase 5**: 3-4 weeks

**Total: 18-24 weeks (4.5-6 months)**

This timeline assumes a small team (1-2 developers) working full-time. Timeline can be accelerated with more resources or reduced scope for initial release.

## Success Metrics

After launch, we'll track:

- **Adoption**: Downloads, active users, retention rates
- **Engagement**: Sessions per user, features used, time in app
- **Performance**: Crash rate, API response times, app launch time
- **User Satisfaction**: App Store ratings, reviews, support tickets
- **Business**: Conversion from web to mobile, premium feature adoption (if applicable)

## Notes and Considerations

- **Code Sharing**: Consider sharing TypeScript types and utility functions between web and mobile via a shared package or monorepo structure
- **Design System**: Maintain design consistency between web and mobile while respecting platform conventions (iOS vs Android)
- **Testing**: Invest in automated testing early (unit tests, integration tests, E2E with Detox or Maestro)
- **Analytics**: Set up analytics (Mixpanel, Amplitude, or similar) from day one to understand user behavior
- **Feedback Loop**: Implement in-app feedback mechanisms to gather user input during beta testing
- **Iteration**: Plan for regular updates post-launch based on user feedback and analytics

