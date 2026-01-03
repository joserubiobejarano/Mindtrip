# Testing Guide

This guide covers how to test the Kruno mobile app on Windows with an iPhone, including push notifications and deep links.

## Windows + iPhone Workflow

### Option 1: Expo Go (Quick UI Testing)

**Use Case**: Fast iteration for UI changes, basic navigation testing

**Limitations**: 
- Push notifications are not reliable in Expo Go
- Deep links may not work consistently
- Some native features may be unavailable

**Steps**:
1. Install Expo Go on your iPhone from the App Store
2. On Windows, navigate to `/apps/mobile` and run:
   ```bash
   npm start
   ```
3. Scan the QR code with your iPhone camera (iOS) or Expo Go app
4. The app will load in Expo Go

**Troubleshooting**:
- If LAN connection fails, use tunnel mode:
  ```bash
  npm run start:tunnel
  ```
- Ensure both devices are on the same Wi-Fi network
- Check Windows Firewall settings if connection fails

### Option 2: EAS Development Build (Full Feature Testing)

**Use Case**: Testing push notifications, deep links, and all native features

**Requirements**:
- EAS account (free tier available)
- Apple Developer account (for iOS builds)

**Steps**:
1. Login to EAS:
   ```bash
   npm run eas:login
   ```

2. Create a development build for iOS:
   ```bash
   npm run eas:build:dev:ios
   ```

3. Follow the prompts to configure your build
4. Once the build completes, install it on your iPhone via:
   - TestFlight (if configured)
   - Direct download link from EAS dashboard
   - QR code provided after build

5. After installing the development build, start the dev server:
   ```bash
   npm start
   ```

6. The development build will connect to your dev server automatically

**Note**: Development builds include the Expo development client, allowing you to load your app with all native features enabled.

## Deep Link Testing

### iOS Testing

1. **Using Safari**:
   - Open Safari on your iPhone
   - In the address bar, type: `kruno://link?tripId=YOUR_TRIP_ID`
   - Tap Go
   - The app should open and navigate to the trip

2. **Using Notes App**:
   - Create a note with the deep link: `kruno://link?tripId=YOUR_TRIP_ID`
   - Tap the link to test

3. **Programmatic Testing**:
   - Use the `xcrun simctl openurl` command if testing on simulator
   - Or use a URL shortener service that redirects to your deep link

### Deep Link Format

- Base scheme: `kruno://`
- Trip link: `kruno://link?tripId=<trip_id>`
- Additional parameters can be added as query strings

## Push Notification Testing

**Important**: Push notifications require a development build on a real device. They will NOT work reliably in Expo Go.

### Setup Steps

1. **Build and Install Development Build**:
   - Follow the EAS Development Build steps above
   - Ensure you're using a real device (not simulator)

2. **Request Permissions**:
   - When the app first launches, it should prompt for notification permissions
   - Grant permissions when prompted

3. **Verify Token Registration**:
   - Check your backend logs to confirm the device token was registered
   - The app calls the push notification registration endpoint on startup

4. **Test Notification Triggers**:
   - **Trip Invite**: Invite a user to a trip (should trigger notification)
   - **Expense Added**: Add an expense to a shared trip
   - **Other triggers**: Test any other features that should send push notifications

### Troubleshooting Push Notifications

- **No permission prompt**: Check that `expo-notifications` plugin is configured in `app.json`
- **Token not registered**: Verify `EXPO_PUBLIC_API_URL` is set correctly in your environment
- **Notifications not received**: 
  - Ensure you're using a development build (not Expo Go)
  - Check device is connected to internet
  - Verify backend push service is configured correctly
  - Check device notification settings in iOS Settings

## API Connection Testing

### Common Issues

1. **Base URL Configuration**:
   - Ensure `EXPO_PUBLIC_API_URL` is set in your `.env` file
   - For local development: `http://YOUR_LOCAL_IP:3000` (not `localhost`)
   - For production: Use your production API URL (HTTPS required)

2. **HTTPS Requirements**:
   - Production builds require HTTPS for API calls
   - Development builds can use HTTP for local testing
   - Ensure your API server supports CORS if needed

3. **Network Issues**:
   - **Same Network**: Device and dev server must be on the same Wi-Fi network (unless using tunnel)
   - **Firewall**: Windows Firewall may block connections; add exception if needed
   - **Tunnel Mode**: Use `npm run start:tunnel` if LAN connection fails

4. **Clerk Authentication**:
   - Verify `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is set correctly
   - Check Clerk dashboard for correct publishable key
   - Ensure Clerk is configured to allow your API domain

### Testing API Calls

1. **Check Network Tab**:
   - Use React Native Debugger or Flipper to inspect network requests
   - Verify requests are going to the correct API URL
   - Check for authentication headers

2. **Test Offline Mode**:
   - The app caches data for offline access
   - Disable Wi-Fi/data to test offline functionality
   - Verify cached data displays with "cached" indicator

3. **Error Handling**:
   - Test with invalid API URLs
   - Test with network disconnected
   - Verify error messages display correctly

## Quick Testing Checklist

- [ ] App launches in Expo Go (basic UI test)
- [ ] Development build installs on device
- [ ] Push notification permission prompt appears
- [ ] Deep links open app correctly
- [ ] API calls succeed with correct base URL
- [ ] Offline mode works (cached data displays)
- [ ] Authentication flow works (Clerk login)
- [ ] All main screens render correctly
- [ ] iPad layout doesn't break (if testing on iPad)

## Next Steps

After testing, proceed to create a preview build for TestFlight/internal distribution:
- See [RELEASE.md](./RELEASE.md) for build and submission workflows

