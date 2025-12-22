import { ClerkProvider as ClerkProviderBase } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import React from 'react';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Please add it to your .env file.'
  );
}

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error('Error saving token:', err);
    }
  },
};

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProviderBase
      publishableKey={CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      {children}
    </ClerkProviderBase>
  );
}

