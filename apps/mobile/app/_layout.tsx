import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { ClerkProvider } from '@/src/providers/clerk-provider';
import { LanguageProvider } from '@/src/providers/language-provider';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Listen for notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      
      // Check if deepLink exists and parse it
      if (data?.deepLink && typeof data.deepLink === 'string' && data.deepLink.startsWith('kruno://link?')) {
        try {
          // Parse query parameters from deepLink
          const queryString = data.deepLink.split('?')[1];
          const params = new URLSearchParams(queryString);
          const tripId = params.get('tripId');
          const screen = params.get('screen');
          
          if (tripId) {
            // Navigate to trip with optional screen parameter
            const targetPath = screen 
              ? `/(tabs)/trips/${tripId}/${screen}`
              : `/(tabs)/trips/${tripId}`;
            router.push(targetPath);
          }
        } catch (error) {
          console.error('[notification-handler] Error parsing deepLink:', error);
          // Fall back to tripId if available
          if (data?.tripId && typeof data.tripId === 'string') {
            router.push(`/(tabs)/trips/${data.tripId}`);
          }
        }
      } else if (data?.tripId && typeof data.tripId === 'string') {
        // Fallback: If no deepLink, navigate to trip detail
        router.push(`/(tabs)/trips/${data.tripId}`);
      }
    });

    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router]);

  return (
    <ClerkProvider>
      <LanguageProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </LanguageProvider>
    </ClerkProvider>
  );
}

