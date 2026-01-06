import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from "@/src/providers/language-provider";

const PUSH_TOKEN_REGISTERED_KEY = 'push_token_registered_at';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function TabsLayout() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { t } = useLanguage();

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

        console.log('[push-token] Expo push token obtained:', token);

        // If API URL is missing, skip backend call and only log locally
        if (!API_URL) {
          console.warn('[push-token] EXPO_PUBLIC_API_URL is not set, skipping backend registration');
          console.log('[push-token] Local push token:', token);
          return;
        }

        // Detect platform
        const platform = Platform.OS === 'ios' ? 'ios' : 'android';

        // Get Clerk auth token (can be null)
        let authToken: string | null = null;
        try {
          authToken = await getToken();
        } catch (error) {
          console.warn('[push-token] Failed to get auth token:', error);
          // Continue without auth token
        }

        // Build request URL
        const url = `${API_URL}/api/user/push-token`;
        console.log('[push-token] Registering push token at:', url);

        // Prepare headers
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        // Add auth header if token is available
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        // Send token to backend
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({ token, platform }),
        });

        const statusCode = response.status;
        console.log('[push-token] Backend response status:', statusCode);

        // Handle non-2xx status codes (including 401) without throwing
        if (statusCode === 401) {
          console.warn('[push-token] Unauthorized (401) - push token registration skipped');
          return;
        }

        if (statusCode < 200 || statusCode >= 300) {
          console.warn(`[push-token] Backend returned non-2xx status (${statusCode}) - push token registration skipped`);
          return;
        }

        // Store timestamp only on success
        const timestamp = new Date().toISOString();
        await AsyncStorage.setItem(PUSH_TOKEN_REGISTERED_KEY, timestamp);

        console.log('[push-token] Push token registered successfully');
      } catch (error: any) {
        // Don't crash the app if push token registration fails
        console.warn('[push-token] Error registering push token (non-blocking):', error);
      }
    };

    registerPushToken();
  }, [isLoaded, isSignedIn, getToken]);

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
          title: t('nav_trips'),
        }}
      />
      <Tabs.Screen
        name="debug"
        options={{
          title: t('mobile_debug_title' as any),
        }}
      />
    </Tabs>
  );
}

