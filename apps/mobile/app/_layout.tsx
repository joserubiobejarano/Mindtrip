import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClerkProvider } from '@/src/providers/clerk-provider';
import { LanguageProvider } from '@/src/providers/language-provider';

const LAST_NOTIFICATION_KEY = 'last_notification_payload';
const LAST_DEEP_LINK_KEY = 'last_deep_link';

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
    // Listen for notifications received (foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;
      // Store notification payload
      const payload = {
        ...data,
        title: notification.request.content.title,
        body: notification.request.content.body,
        timestamp: new Date().toISOString(),
      };
      AsyncStorage.setItem(LAST_NOTIFICATION_KEY, JSON.stringify(payload)).catch((error) => {
        console.error('[notification-handler] Error storing notification payload:', error);
      });
    });

    // Listen for notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      
      // Store deep link if present
      if (data?.deepLink && typeof data.deepLink === 'string') {
        AsyncStorage.setItem(LAST_DEEP_LINK_KEY, data.deepLink).catch((error) => {
          console.error('[notification-handler] Error storing deep link:', error);
        });
      } else if (data?.tripId && typeof data.tripId === 'string') {
        // Store fallback deep link
        const fallbackLink = `kruno://link?tripId=${data.tripId}`;
        AsyncStorage.setItem(LAST_DEEP_LINK_KEY, fallbackLink).catch((error) => {
          console.error('[notification-handler] Error storing deep link:', error);
        });
      }
      
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
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
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

