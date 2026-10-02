import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { StoreProvider } from '@/data/store';

// Tabs live in the `(tabs)` group; post pages push on top of them.
export default function RootLayout() {
  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </StoreProvider>
  );
}
