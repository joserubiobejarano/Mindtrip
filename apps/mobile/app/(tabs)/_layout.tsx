import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import * as Notifications from 'expo-notifications';
import { apiJson } from '@/src/lib/api';

export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  // Register push token when user is authenticated
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const registerPushToken = async () => {
      try {
        // Request notification permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('[push-token] Notification permission denied');
          return;
        }

        // Get Expo push token
        // projectId is optional - Expo will infer it from app.json if not provided
        const tokenData = await Notifications.getExpoPushTokenAsync(
          process.env.EXPO_PUBLIC_PROJECT_ID
            ? { projectId: process.env.EXPO_PUBLIC_PROJECT_ID }
            : undefined
        );
        const token = tokenData.data;

        if (!token) {
          console.error('[push-token] Failed to get Expo push token');
          return;
        }

        // Detect platform
        const platform = Platform.OS === 'ios' ? 'ios' : 'android';

        // Send token to backend
        await apiJson('/api/user/push-token', {
          method: 'POST',
          body: JSON.stringify({ token, platform }),
        });

        console.log('[push-token] Push token registered successfully');
      } catch (error: any) {
        // Don't crash the app if push token registration fails
        console.error('[push-token] Error registering push token:', error);
      }
    };

    registerPushToken();
  }, [isLoaded, isSignedIn]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1a1a1a',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
        }}
      />
    </Tabs>
  );
}

