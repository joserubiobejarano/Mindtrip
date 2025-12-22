import { Stack } from 'expo-router';
import { ClerkProvider } from '@/src/providers/clerk-provider';
import { LanguageProvider } from '@/src/providers/language-provider';

export default function RootLayout() {
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

