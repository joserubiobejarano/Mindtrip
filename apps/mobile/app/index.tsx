import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_DEEP_LINK_KEY = 'pendingDeepLinkTripId';

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const [pendingTripId, setPendingTripId] = useState<string | null>(null);
  const [hasCheckedPendingLink, setHasCheckedPendingLink] = useState(false);

  // Check for pending deep link after authentication
  useEffect(() => {
    if (!isLoaded || !isSignedIn || hasCheckedPendingLink) return;

    const checkPendingDeepLink = async () => {
      try {
        const storedTripId = await AsyncStorage.getItem(PENDING_DEEP_LINK_KEY);
        if (storedTripId) {
          console.log('[index] Found pending deep link tripId:', storedTripId);
          setPendingTripId(storedTripId);
          // Clear the stored tripId
          await AsyncStorage.removeItem(PENDING_DEEP_LINK_KEY);
          setHasCheckedPendingLink(true);
        } else {
          setHasCheckedPendingLink(true);
        }
      } catch (error) {
        console.error('[index] Error checking pending deep link:', error);
        setHasCheckedPendingLink(true);
      }
    };

    checkPendingDeepLink();
  }, [isLoaded, isSignedIn, hasCheckedPendingLink]);

  // Wait for auth to load
  if (!isLoaded) {
    return null;
  }

  // If not authenticated, redirect to sign-in
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Wait for pending link check to complete
  if (!hasCheckedPendingLink) {
    return null;
  }

  // If we have a pending tripId, redirect to that trip
  if (pendingTripId) {
    console.log('[index] Redirecting to pending trip:', pendingTripId);
    return <Redirect href={`/(tabs)/trips/${pendingTripId}`} />;
  }

  // Otherwise, redirect to home as normal
  return <Redirect href="/(tabs)/home" />;
}

