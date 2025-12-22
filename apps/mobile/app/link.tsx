import { useEffect, useState } from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_DEEP_LINK_KEY = 'pendingDeepLinkTripId';

export default function LinkRouter() {
  const { isSignedIn, isLoaded } = useAuth();
  const params = useLocalSearchParams<{ 
    tripId?: string; 
    invitedTripId?: string; 
    screen?: string;
    lang?: string;
  }>();
  const [pendingTripId, setPendingTripId] = useState<string | null>(null);
  const [hasStoredTripId, setHasStoredTripId] = useState(false);

  // Determine the final tripId from params
  const finalTripId = params.tripId || params.invitedTripId;

  // Handle language if provided (can be used to set app language)
  useEffect(() => {
    if (params.lang && (params.lang === 'en' || params.lang === 'es')) {
      // Language is handled by LanguageProvider, so we don't need to do anything here
      // But we can log it for debugging
      console.log('[link-router] Language param:', params.lang);
    }
  }, [params.lang]);

  // Store tripId if user is not authenticated
  useEffect(() => {
    if (!isLoaded) return;

    const handleUnauthenticatedLink = async () => {
      if (!isSignedIn && finalTripId && !hasStoredTripId) {
        try {
          await AsyncStorage.setItem(PENDING_DEEP_LINK_KEY, finalTripId);
          setPendingTripId(finalTripId);
          setHasStoredTripId(true);
          console.log('[link-router] Stored pending deep link tripId:', finalTripId);
        } catch (error) {
          console.error('[link-router] Error storing pending deep link:', error);
        }
      }
    };

    handleUnauthenticatedLink();
  }, [isLoaded, isSignedIn, finalTripId, hasStoredTripId]);

  // Wait for auth to load
  if (!isLoaded) {
    return null;
  }

  // If user is not authenticated, redirect to welcome screen
  // (tripId is already stored in AsyncStorage)
  if (!isSignedIn) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // If user is authenticated and we have a tripId, redirect to trip detail
  if (finalTripId) {
    // Optional: support screen parameter for direct navigation to specific tab
    // For MVP, we'll just go to the main trip detail page
    const targetPath = params.screen 
      ? `/(tabs)/trips/${finalTripId}/${params.screen}`
      : `/(tabs)/trips/${finalTripId}`;
    
    console.log('[link-router] Redirecting to trip:', targetPath);
    return <Redirect href={targetPath} />;
  }

  // If no tripId, redirect to trips list
  console.log('[link-router] No tripId, redirecting to trips list');
  return <Redirect href="/(tabs)/trips" />;
}

