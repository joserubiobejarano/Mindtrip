# Kruno Mobile App

> **Last Updated:** January 2025  
> **Status:** Phase 1 Complete - Authentication & Basic Navigation Working

This is the mobile application for Kruno, built with Expo Router and React Native. The app uses Clerk for authentication and communicates with the Next.js backend API.

## 🎯 Goal of the Mobile App

The mobile app is built with:
- **Expo Router** - File-based routing (similar to Next.js App Router)
- **Clerk Authentication** - Email/password + Google SSO (same as web app)
- **Future: NativeWind** - Will reuse web app UI components using Tailwind-like classes (planned for later phases)

The goal is to eventually share UI components between web and mobile using NativeWind, but for now the mobile app has a basic UI that will be enhanced later.

## 📊 Current Status

### ✅ What Works Now

- **Authentication**
  - Sign-in with email/password
  - Sign-up with email/password
  - Google SSO (OAuth flow)
  - Session management and token refresh
  - Sign-out functionality
  - Automatic redirects based on auth state

- **Navigation**
  - File-based routing with Expo Router
  - Tab navigation (`(tabs)/home`, `(tabs)/trips`, etc.)
  - Auth-protected routes
  - Deep linking support (scheme: `kruno`)

- **API Integration**
  - Bearer token authentication with backend
  - API client with automatic token injection
  - Error handling and response parsing

- **Internationalization**
  - English and Spanish support
  - Language preference persistence

### 🎨 What's Intentionally "Basic" Right Now

- **UI Design**: The UI is intentionally basic and doesn't match the web app yet. This is by design - we're focusing on functionality first, then will migrate to NativeWind to match the web UI later.
- **Trip Screens**: Basic trip list and detail screens exist but are minimal
- **No NativeWind Yet**: We'll add NativeWind in a later phase to reuse web components

### ⚠️ Known Warnings We're Ignoring for Now

- **New Architecture Warning**: Expo may show warnings about React Native's New Architecture. We're ignoring this for now as it doesn't affect functionality.
- **Expo Go Version Warning**: If using Expo Go, you may see version mismatch warnings. These are safe to ignore during development.

## 📁 Project Structure

```
apps/mobile/
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/                  # Authentication routes
│   │   ├── _layout.tsx         # Auth layout
│   │   ├── sign-in.tsx         # Sign-in screen
│   │   └── sign-up.tsx         # Sign-up screen
│   ├── (tabs)/                  # Authenticated routes (tab navigation)
│   │   ├── _layout.tsx         # Tab layout
│   │   ├── home.tsx            # Home screen
│   │   ├── trips.tsx           # Trips list screen
│   │   ├── trips/[tripId].tsx  # Trip detail screen
│   │   └── debug.tsx           # Debug screen
│   ├── _layout.tsx             # Root layout with providers
│   └── index.tsx               # Entry point (redirects based on auth)
├── src/
│   ├── lib/
│   │   ├── api.ts              # API client for Next.js backend
│   │   ├── cache.ts            # Caching utilities
│   │   ├── i18n.ts             # Translations (en/es)
│   │   └── responsive.ts       # Responsive utilities
│   └── providers/
│       ├── clerk-provider.tsx  # Clerk authentication setup
│       └── language-provider.tsx # i18n language provider
├── assets/                      # App assets
│   ├── icon.png                # App icon
│   ├── adaptive-icon.png       # Android adaptive icon
│   ├── splash.png              # Splash screen
│   └── favicon.png             # Web favicon
├── app.json                     # Expo configuration
├── babel.config.js             # Babel config (module resolver for @/)
├── metro.config.js             # Metro bundler config (path aliases)
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

### Key Folders Explained

- **`app/`**: Expo Router file-based routing. Similar to Next.js App Router:
  - `(auth)/` - Auth screens (sign-in, sign-up)
  - `(tabs)/` - Main app screens with tab navigation
  - `_layout.tsx` - Layout wrappers
  - `index.tsx` - Entry point that redirects based on auth state

- **`src/lib/`**: Utility functions and services
  - `api.ts` - API client that handles Bearer token authentication
  - `i18n.ts` - Translation strings and language utilities

- **`src/providers/`**: React context providers
  - `clerk-provider.tsx` - Clerk authentication provider
  - `language-provider.tsx` - Language preference provider

- **`assets/`**: Static assets (icons, splash screens, etc.)

### Routing Explained

Expo Router uses file-based routing:
- `app/(auth)/sign-in.tsx` → `/sign-in` route
- `app/(tabs)/home.tsx` → `/home` route (protected)
- `app/(tabs)/trips/[tripId].tsx` → `/trips/:tripId` route (protected)

Parentheses `()` create route groups that don't affect the URL but organize routes.

## 🔐 Environment Variables

### Location

Environment variables live in `apps/mobile/.env` (create this file if it doesn't exist).

### Required Variables

```env
# Backend API URL
EXPO_PUBLIC_API_URL=http://localhost:3000

# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Optional: EAS Project ID (for push notifications)
EXPO_PUBLIC_EAS_PROJECT_ID=3590ec8d-5462-4393-8e17-da1a691dfe5f
```

### Why `EXPO_PUBLIC_` Prefix?

Expo requires the `EXPO_PUBLIC_` prefix for environment variables that should be available in the app bundle. Variables without this prefix are only available in Node.js (server-side) code, which doesn't exist in React Native.

**Important**: After changing environment variables:
1. Restart the Expo dev server: `npx expo start -c` (the `-c` flag clears cache)
2. If using Expo Go, you may need to reload the app

### Environment Variable Checklist

If authentication breaks, confirm:
- [ ] `.env` file exists in `apps/mobile/` directory
- [ ] All variables have `EXPO_PUBLIC_` prefix
- [ ] `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` matches your Clerk dashboard
- [ ] `EXPO_PUBLIC_API_URL` points to your backend (localhost for dev, production URL for prod)
- [ ] You've restarted Expo dev server after changes (`npx expo start -c`)

## 🔑 Clerk Setup (Mobile)

### Package & Version

- **Package**: `@clerk/clerk-expo` version `2.19.14`
- **Why this version**: This is the working version that successfully installed and works with Expo SDK 52

### Why `<SignIn />` Component Was Removed

The Clerk `<SignIn />` component is **web-only** and not supported in React Native. Instead, we use:

### Implemented Approach

**Native React Native Screens:**
- `app/(auth)/sign-in.tsx` - Custom sign-in screen using `useSignIn()` hook
- `app/(auth)/sign-up.tsx` - Custom sign-up screen using `useSignUp()` hook
- Both screens use Clerk hooks (`useSignIn`, `useSignUp`) for authentication logic

**Google SSO Implementation:**
- Uses `useSSO()` hook from `@clerk/clerk-expo`
- Redirect URL configured: `AuthSession.makeRedirectUri({ scheme: 'kruno' })`
- Scheme `kruno` is configured in `app.json` (see below)

### App Scheme Configuration

The app scheme `kruno` is configured in `app.json`:

```json
{
  "expo": {
    "scheme": "kruno",
    ...
  }
}
```

This allows:
- Deep linking: `kruno://trips/123`
- OAuth redirects: Google SSO redirects back to `kruno://` after authentication
- URL scheme handling: iOS/Android can open the app via `kruno://` URLs

## 🔧 Path Alias Fixes (@/...)

### The Problem

Initially, imports like `@/src/lib/api` didn't work because Metro bundler (React Native's bundler) didn't know how to resolve the `@/` alias.

### The Solution

We configured three files to make `@/` resolve correctly:

#### 1. `tsconfig.json` - TypeScript Path Mapping

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

This tells TypeScript where to find `@/` imports.

#### 2. `metro.config.js` - Metro Bundler Alias Resolver

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver = {
  ...config.resolver,
  alias: {
    '@': path.resolve(__dirname, '.'),
  },
};

module.exports = config;
```

This tells Metro bundler (React Native's bundler) how to resolve `@/` imports at runtime.

#### 3. `babel.config.js` - Babel Module Resolver

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
          },
        },
      ],
    ],
  };
};
```

This tells Babel to transform `@/` imports during compilation.

### If Imports Break Again

Checklist:
- [ ] Verify `tsconfig.json` has `baseUrl` and `paths` configured
- [ ] Verify `metro.config.js` has `alias` resolver configured
- [ ] Verify `babel.config.js` has `babel-plugin-module-resolver` plugin
- [ ] Clear cache: `npx expo start -c`
- [ ] Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- [ ] Restart Metro bundler

## 📦 Assets Fix

### Why We Created `apps/mobile/assets/`

Expo couldn't resolve `./assets/icon.png` from the root directory. We created `apps/mobile/assets/` to store all app assets in a predictable location.

### Placeholder Assets

The following placeholder assets exist in `apps/mobile/assets/`:

- **`icon.png`** - App icon (1024x1024px recommended)
- **`adaptive-icon.png`** - Android adaptive icon (foreground image)
- **`splash.png`** - Splash screen image
- **`favicon.png`** - Web favicon (for web builds)

**Note**: These are placeholder assets. Replace them with your actual app branding before production builds.

## 🔐 Trips API Auth Fix (IMPORTANT)

### The Issue

Mobile apps need to authenticate using **Bearer tokens** in the `Authorization` header, while web apps use **cookies/sessions**. Initially, the backend API only supported cookie-based authentication, causing mobile requests to return 401 Unauthorized.

### What Was Implemented

**1. Backend Auth Helper (`lib/auth/getProfileIdFromRequest.ts`)**

This function supports both authentication methods:

```typescript
export async function getProfileIdFromRequest(
  request: NextRequest,
  supabase?: SupabaseClient
): Promise<ProfileAuthResult & { authMethod: 'bearer' | 'cookie' }>
```

**How it works:**
- Checks for `Authorization: Bearer <token>` header (mobile)
- Falls back to Clerk session cookies (web)
- Verifies token with Clerk using `clerkClient.verifyToken()`
- Returns profile ID and auth method for logging

**2. API Route Updates**

The `/api/trips` GET endpoint (and other endpoints) now use `getProfileIdFromRequest()`:

```typescript
const authResult = await getProfileIdFromRequest(request, supabase);
// Returns: { profileId, clerkUserId, email, authMethod }
```

**3. Auth Method Logging**

All API routes log which auth method was used:
- `authMethod: 'bearer'` - Mobile app request
- `authMethod: 'cookie'` - Web app request

This helps with debugging and monitoring.

**4. Error Messages**

Clear error messages indicate authentication failures:
- "Unauthorized: Invalid or expired token" - Bearer token invalid
- "Unauthorized: No valid session found" - Cookie session invalid

### Mobile API Client

The mobile app's API client (`src/lib/api.ts`) automatically includes the Bearer token:

```typescript
if (token) {
  requestHeaders['Authorization'] = `Bearer ${token}`;
}
```

The token is obtained from Clerk's session and passed to all API calls.

## 📱 Push Token Registration

### Errors Encountered

1. **Missing projectId**: Expo push tokens require an EAS project ID
2. **401 Unauthorized**: Backend endpoint returned 401 when registering push token

### Current Behavior

Push token registration is **non-blocking** - if it fails, the app continues to work:

- Push token registration happens automatically when user signs in
- Errors are logged but don't crash the app
- Registration is skipped if:
  - User is not authenticated
  - Backend returns 401 (unauthorized)
  - Backend returns non-2xx status
  - Network errors occur

### Implementation Location

Push token registration code is in:
- `app/(tabs)/_layout.tsx` - Automatic registration on sign-in
- `app/(tabs)/debug.tsx` - Manual registration button for testing

### TODO for Later

- [ ] Use EAS projectId reliably (currently hardcoded in `app.json`)
- [ ] Confirm backend endpoint (`/api/user/push-token`) expects Bearer token
- [ ] Decide whether to enable push in Expo Go vs dev build
- [ ] Test push notifications in production build
- [ ] Handle push notification permissions gracefully

## 🚀 Commands / Workflows

### Starting the App

```bash
cd apps/mobile
npx expo start -c
```

The `-c` flag clears the cache, which is important when:
- Environment variables change
- Dependencies are updated
- Path aliases are modified

### Useful Commands

```bash
# Start Expo dev server
npx expo start

# Start with cache cleared
npx expo start -c

# Start for iOS
npm run ios

# Start for Android
npm run android

# Start for web (limited functionality)
npm run web

# Clear all caches
rm -rf node_modules .expo
npm install
```

### Development Workflow

1. **Make code changes** in `apps/mobile/`
2. **Save file** - Expo will hot reload automatically
3. **If changes don't appear**: Clear cache with `npx expo start -c`
4. **For environment variable changes**: Restart Expo dev server

**Note**: Any code changes should be done via Cursor (or your IDE). The Expo dev server watches for file changes and hot reloads automatically.

## 🎯 Next Steps (After Web is Polished)

### Option A: NativeWind Migration to Match Web UI

**Plan:**

1. **Install NativeWind**
   ```bash
   npm install nativewind
   npm install --save-dev tailwindcss
   ```

2. **Configure NativeWind**
   - Set up `tailwind.config.js`
   - Configure `babel.config.js` with NativeWind plugin
   - Update `metro.config.js` if needed

3. **Create Shared Design Tokens**
   - Create `src/constants/design-tokens.ts` with:
     - Spacing scale (matches web)
     - Typography scale (matches web)
     - Color palette (matches web)
     - Component styles

4. **Rebuild Key Screens** (Priority Order)
   - [ ] **Trips List** - Match web trips list UI
   - [ ] **Trip Detail** - Match web trip detail UI
   - [ ] **Explore Tab** - Match web Explore tab UI
   - [ ] **Itinerary View** - Match web itinerary UI
   - [ ] **Auth Screens** - Match web sign-in/sign-up UI
   - [ ] **Settings** - Match web settings UI

5. **Create Shared Components**
   - Extract common UI patterns from web
   - Create mobile equivalents using NativeWind
   - Share design tokens between platforms

**Make this a checklist with priorities:**

- [ ] **Phase 1: Setup** (1 week)
  - [ ] Install and configure NativeWind
  - [ ] Create design tokens file
  - [ ] Set up shared component structure

- [ ] **Phase 2: Core Screens** (2-3 weeks)
  - [ ] Trips list screen
  - [ ] Trip detail screen
  - [ ] Auth screens (sign-in/sign-up)

- [ ] **Phase 3: Feature Screens** (2-3 weeks)
  - [ ] Explore tab
  - [ ] Itinerary view
  - [ ] Settings screen

- [ ] **Phase 4: Polish** (1 week)
  - [ ] Animations and transitions
  - [ ] Loading states
  - [ ] Error states
  - [ ] Accessibility improvements

## 📚 Additional Documentation

- **[Mobile Roadmap](../docs/mobile-roadmap.md)** - Complete development plan and timeline
- **[Web App README](../../docs/README.md)** - Web app documentation
- **[Architecture](../../docs/ARCHITECTURE.md)** - System architecture

## 🐛 Troubleshooting

### Environment Variables Not Loading

- Make sure variables are prefixed with `EXPO_PUBLIC_`
- Restart Expo dev server after adding/changing variables: `npx expo start -c`
- Verify `.env` file is in `apps/mobile/` directory

### Authentication Issues

- Verify `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is correct
- Check that your Clerk application is configured correctly
- Ensure the Next.js backend is running if testing API calls
- Check backend logs for auth method and errors

### Build Errors

- Clear cache: `npx expo start -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Expo cache: `expo start --clear`

### Import Errors (@/ not resolving)

- See [Path Alias Fixes](#-path-alias-fixes-) section above
- Verify all three config files are set up correctly
- Clear cache and restart: `npx expo start -c`

### API 401 Errors

- Verify Bearer token is being sent (check `src/lib/api.ts`)
- Check backend logs for auth method (`bearer` vs `cookie`)
- Ensure `getProfileIdFromRequest` is being used in API routes
- Verify Clerk token is valid (check token expiration)

---

**Last Updated**: January 2025  
**Maintained By**: Development Team
