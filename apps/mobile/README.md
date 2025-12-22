# Kruno Mobile App

This is the mobile application for Kruno, built with Expo and React Native.

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli` or use `npx expo`)
- iOS Simulator (for macOS) or Android Emulator
- For physical device testing: Expo Go app on iOS/Android

## Installation

1. Navigate to the mobile app directory:
   ```bash
   cd apps/mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` (if the file exists, or create `.env` manually)
   - Add the following environment variables:
     ```
     EXPO_PUBLIC_API_URL=http://localhost:3000
     EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
     ```
   - Get your Clerk publishable key from the [Clerk Dashboard](https://dashboard.clerk.com)

## Running the App

### Development

Start the Expo development server:
```bash
npm start
```

This will open Expo DevTools in your browser. From there you can:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan the QR code with Expo Go app on your physical device

### Platform-Specific Commands

```bash
# iOS
npm run ios

# Android
npm run android

# Web (for testing, limited functionality)
npm run web
```

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router file-based routing
│   ├── (auth)/            # Authentication routes
│   │   └── welcome.tsx    # Welcome/sign-in screen
│   ├── (tabs)/            # Authenticated routes
│   │   └── home.tsx       # Home screen
│   ├── _layout.tsx        # Root layout with providers
│   └── index.tsx          # Entry point (redirects based on auth)
├── src/
│   ├── lib/
│   │   ├── api.ts         # API client for Next.js backend
│   │   └── i18n.ts        # Translations (en/es)
│   └── providers/
│       ├── clerk-provider.tsx      # Clerk authentication setup
│       └── language-provider.tsx   # i18n language provider
├── app.json               # Expo configuration
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript configuration
```

## Environment Variables

Required environment variables (add to `.env`):

- `EXPO_PUBLIC_API_URL`: Base URL for the Next.js API (e.g., `http://localhost:3000` for local dev)
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key from your Clerk dashboard

Note: Expo uses the `EXPO_PUBLIC_*` prefix for environment variables that should be available in the app.

## Authentication

The app uses Clerk for authentication. The authentication flow:

1. App starts and checks if user is signed in
2. If not signed in: redirects to `/(auth)/welcome` (sign-in screen)
3. If signed in: redirects to `/(tabs)/home` (home screen)

Clerk handles:
- Email/password authentication
- Social logins (Google, Apple, etc.)
- Session management and token refresh
- Secure token storage using Expo SecureStore

## API Integration

The app communicates with the Next.js backend API using the API client in `src/lib/api.ts`. All authenticated requests automatically include the Clerk session token in the Authorization header.

Example usage:
```typescript
import { apiJson } from '@/src/lib/api';

const data = await apiJson('/api/trips');
```

## Internationalization (i18n)

The app supports English (`en`) and Spanish (`es`). Translations are in `src/lib/i18n.ts`. Language preference is stored in AsyncStorage and persists across app restarts.

## Development Notes

- This is a minimal scaffold focused on authentication and basic navigation
- No trips UI, payments, or complex features yet
- Uses Expo Router for file-based routing (similar to Next.js App Router)
- TypeScript is enabled for type safety
- The app is designed to work independently but shares the same backend as the web app

## Troubleshooting

### Environment Variables Not Loading

Make sure:
- Variables are prefixed with `EXPO_PUBLIC_`
- You've restarted the Expo dev server after adding/changing variables
- The `.env` file is in the `apps/mobile` directory

### Authentication Issues

- Verify `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is correct
- Check that your Clerk application is configured correctly
- Ensure the Next.js backend is running if testing API calls

### Build Errors

- Clear cache: `expo start -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Expo cache: `expo start --clear`

