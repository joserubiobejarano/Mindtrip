# Release Guide

This guide covers the complete workflow from development testing to App Store and Play Store submission.

## Preconditions

### iOS Requirements
- **Apple Developer Account**: Required for iOS builds and App Store submission
  - Individual: $99/year
  - Organization: $99/year
  - Sign up at [developer.apple.com](https://developer.apple.com)
- **App Store Connect**: Access to create and manage your app listing
- **Certificates & Profiles**: EAS can manage these automatically, or you can configure manually

### Android Requirements
- **Google Play Console Account**: Required for Android builds and Play Store submission
  - One-time $25 registration fee
  - Sign up at [play.google.com/console](https://play.google.com/console)
- **Google Play Developer Account**: Create and manage your app listing

### EAS Account
- Sign up at [expo.dev](https://expo.dev) (free tier available)
- Install EAS CLI: `npm install -g eas-cli`
- Login: `npm run eas:login`

## EAS Build Flow

### 1. Development Build

**Purpose**: Test push notifications, deep links, and native features on real devices

**Steps**:
```bash
# iOS
npm run eas:build:dev:ios

# Android
npm run eas:build:dev:android
```

**What happens**:
- EAS builds a development client with your app
- Build is distributed internally (TestFlight for iOS, direct download for Android)
- You can install on your device and connect to your dev server

**When to use**: During active development when you need to test native features

### 2. Preview Build

**Purpose**: Internal testing, QA, and stakeholder demos

**Steps**:
```bash
# iOS
eas build --profile preview --platform ios

# Android
eas build --profile preview --platform android
```

**What happens**:
- EAS builds a standalone app (not a development client)
- Build uses your production API URL (configure in EAS secrets)
- Distributed internally via TestFlight (iOS) or direct download (Android)

**When to use**: Before production release, for final testing and QA

### 3. Production Build

**Purpose**: App Store and Play Store submission

**Steps**:
```bash
# iOS
npm run eas:build:prod:ios

# Android
npm run eas:build:prod:android
```

**What happens**:
- EAS builds a production-ready app
- Build is configured for store distribution
- Ready for submission to App Store/Play Store

**When to use**: When ready to submit to stores

## App Store Submission (iOS)

### Pre-Submission Checklist

Before building for production, ensure:

- [ ] **Bundle Identifier**: Set in `app.json` (`ios.bundleIdentifier`)
- [ ] **App Icons**: All required sizes in `./assets/icon.png` (1024x1024 for App Store)
- [ ] **Splash Screen**: Configured in `app.json`
- [ ] **Privacy Policy URL**: Required for App Store submission
- [ ] **Contact Information**: Support URL and contact details
- [ ] **App Store Screenshots**: Prepare screenshots for all required device sizes
- [ ] **App Description**: Write compelling description and keywords
- [ ] **Age Rating**: Complete age rating questionnaire in App Store Connect

### Build and Submit

1. **Create Production Build**:
   ```bash
   npm run eas:build:prod:ios
   ```

2. **Wait for Build**: EAS will build your app (typically 10-20 minutes)

3. **Submit to App Store**:
   ```bash
   npm run eas:submit:ios
   ```

4. **Follow Prompts**: EAS will guide you through:
   - Selecting the build
   - App Store Connect app selection
   - Submission details

### App Store Connect Setup

1. **Create App**:
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Click "My Apps" → "+" → "New App"
   - Fill in app information:
     - Name: "Kruno"
     - Primary Language
     - Bundle ID: `com.kruno.mobile` (must match `app.json`)
     - SKU: Unique identifier

2. **App Information**:
   - Upload app icon (1024x1024)
   - Add screenshots for all device sizes
   - Write app description
   - Add keywords
   - Set category

3. **Pricing and Availability**:
   - Set price (free or paid)
   - Select countries/regions

4. **App Privacy**:
   - Complete privacy questionnaire
   - Add privacy policy URL (required)

5. **Version Information**:
   - Add version number
   - Release notes
   - Screenshots

### After Submission

- **Review Process**: Apple typically reviews within 24-48 hours
- **Status Updates**: Check App Store Connect for review status
- **Rejections**: Address any issues and resubmit

## Play Store Submission (Android)

### Pre-Submission Checklist

- [ ] **Package Name**: Set in `app.json` (`android.package`)
- [ ] **App Icons**: Adaptive icon configured in `app.json`
- [ ] **Splash Screen**: Configured
- [ ] **Privacy Policy URL**: Required
- [ ] **Play Store Graphics**: Screenshots, feature graphic, etc.
- [ ] **App Description**: Write description and short description

### Build and Submit

1. **Create Production Build**:
   ```bash
   npm run eas:build:prod:android
   ```

2. **Wait for Build**: EAS will build your app

3. **Submit to Play Store**:
   ```bash
   npm run eas:submit:android
   ```

### Google Play Console Setup

1. **Create App**:
   - Go to [Google Play Console](https://play.google.com/console)
   - Click "Create app"
   - Fill in:
     - App name: "Kruno"
     - Default language
     - App or game
     - Free or paid
     - Privacy policy URL

2. **Store Listing**:
   - Add app icon (512x512)
   - Add screenshots (phone and tablet)
   - Write app description
   - Add feature graphic

3. **Content Rating**:
   - Complete content rating questionnaire

4. **App Access**:
   - Set up app access (if restricted)

5. **Pricing & Distribution**:
   - Set price (if paid)
   - Select countries

### After Submission

- **Review Process**: Google typically reviews within a few hours to a few days
- **Status Updates**: Check Play Console for review status

## iPad Considerations

Since `ios.supportsTablet: true` is set in `app.json`, your app will be available on iPad. Ensure:

### QA Checklist for iPad

Test these screens on an iPad (or iPad simulator):

- [ ] **Trips List** (`trips.tsx`): Layout doesn't stretch awkwardly, content is centered
- [ ] **Trip Detail** (`[tripId].tsx`): Content is readable, not too wide
- [ ] **Explore** (`explore.tsx`): Card layout works on larger screen
- [ ] **Expenses** (`expenses.tsx`): Lists and forms are properly sized
- [ ] **Tripmates** (`tripmates.tsx`): Member cards display correctly

### Responsive Design

The app includes minimal responsive wrappers that:
- Center content on large screens
- Apply max-width (640px) to prevent content from stretching too wide
- Maintain mobile-first design while being iPad-safe

If you notice layout issues on iPad:
1. Check that responsive wrappers are applied (see `responsive.ts`)
2. Test with different iPad sizes (iPad, iPad Pro)
3. Adjust `maxWidth` in `responsive.ts` if needed

## Environment Variables for Builds

### Development Build
- Environment variables are set in `eas.json` under the `development` profile
- Update `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in `eas.json`

### Production Build
- Use EAS Secrets to store sensitive environment variables:
  ```bash
  eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://api.kruno.com"
  eas secret:create --scope project --name EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY --value "pk_..."
  ```
- Secrets are automatically injected during build

## Version Management

### Updating Version

1. **Update `app.json`**:
   ```json
   {
     "expo": {
       "version": "1.0.1"
     }
   }
   ```

2. **iOS**: Also update `ios.buildNumber` if needed
3. **Android**: Version code is auto-incremented by EAS

### Release Workflow

1. **Development**: Test with development builds
2. **Preview**: Create preview build for QA
3. **Production**: Build and submit to stores
4. **Monitor**: Track crashes and user feedback
5. **Iterate**: Plan next version updates

## Troubleshooting

### Build Failures

- **Certificate Issues**: EAS can auto-manage certificates, or configure manually
- **Environment Variables**: Ensure all required vars are set in EAS secrets
- **Asset Issues**: Verify all assets (icons, splash) exist and are correct size

### Submission Issues

- **Missing Information**: Complete all required fields in App Store Connect/Play Console
- **Privacy Policy**: Must be publicly accessible URL
- **Screenshots**: Required for all device sizes (iOS) or phone/tablet (Android)

## Next Steps

- See [STORE-CHECKLIST.md](./STORE-CHECKLIST.md) for a quick reference checklist
- See [TESTING.md](./TESTING.md) for development testing workflows

