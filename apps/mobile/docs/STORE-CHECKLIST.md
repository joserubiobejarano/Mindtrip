# Store Submission Checklist

Quick reference checklist for App Store and Play Store submission.

## App Configuration

- [ ] Bundle Identifier (iOS): `com.kruno.mobile` set in `app.json`
- [ ] Package Name (Android): `com.kruno.mobile` set in `app.json`
- [ ] App Version: Updated in `app.json`
- [ ] App Name: "Kruno" configured
- [ ] App Icon: 1024x1024 PNG (iOS), adaptive icon (Android)
- [ ] Splash Screen: Configured in `app.json`

## Assets

- [ ] App Icon (iOS): 1024x1024 PNG, no transparency
- [ ] App Icon (Android): Adaptive icon configured
- [ ] Splash Screen: Image and background color set
- [ ] App Store Screenshots: All required device sizes
- [ ] Play Store Screenshots: Phone and tablet sizes
- [ ] Feature Graphic (Android): 1024x500 PNG

## App Store Connect (iOS)

- [ ] App created in App Store Connect
- [ ] Bundle ID matches `app.json`
- [ ] App Description: Written and optimized
- [ ] Keywords: Added (up to 100 characters)
- [ ] Category: Selected
- [ ] Age Rating: Questionnaire completed
- [ ] Privacy Policy URL: Added (required)
- [ ] Support URL: Added
- [ ] Contact Information: Added
- [ ] Pricing: Set (free or paid)
- [ ] Availability: Countries/regions selected

## Google Play Console (Android)

- [ ] App created in Play Console
- [ ] Package name matches `app.json`
- [ ] App Description: Written
- [ ] Short Description: Written (80 characters max)
- [ ] Category: Selected
- [ ] Content Rating: Questionnaire completed
- [ ] Privacy Policy URL: Added (required)
- [ ] Contact Details: Added
- [ ] Pricing: Set (free or paid)
- [ ] Distribution: Countries selected

## Features & Permissions

- [ ] Push Notifications: Configured and tested
- [ ] Deep Links: Configured (`kruno://` scheme)
- [ ] Offline Support: Tested and working
- [ ] Authentication: Clerk integration working
- [ ] API Integration: Production API URL configured
- [ ] Required Permissions: Documented in store listings

## Testing

- [ ] Development Build: Tested on real devices
- [ ] Push Notifications: Tested on dev build
- [ ] Deep Links: Tested and working
- [ ] iPad Layout: Tested on iPad (if `supportsTablet: true`)
- [ ] All Screens: Tested and functional
- [ ] Offline Mode: Tested
- [ ] Error Handling: Tested

## Build & Submit

- [ ] Production Build (iOS): Created via EAS
- [ ] Production Build (Android): Created via EAS
- [ ] Builds Tested: Verified on TestFlight/internal distribution
- [ ] App Store Submission: Submitted via EAS or manually
- [ ] Play Store Submission: Submitted via EAS or manually

## Post-Submission

- [ ] Review Status: Monitoring in App Store Connect/Play Console
- [ ] TestFlight (iOS): Internal testing group configured (optional)
- [ ] Beta Testing (Android): Internal testing track configured (optional)
- [ ] Release Notes: Prepared for first release
- [ ] Marketing: App store optimization (ASO) completed

## Quick Commands

```bash
# Build for production
npm run eas:build:prod:ios
npm run eas:build:prod:android

# Submit to stores
npm run eas:submit:ios
npm run eas:submit:android

# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]
```

## Notes

- **Privacy Policy**: Must be publicly accessible URL, required by both stores
- **First Submission**: May take longer for review (24-48 hours iOS, few hours to days Android)
- **Updates**: Subsequent updates typically review faster
- **Rejections**: Common reasons include missing privacy policy, incomplete information, or policy violations

