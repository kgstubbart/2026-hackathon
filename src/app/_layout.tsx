import { StatusBar } from 'expo-status-bar';

import AppTabs from '@/components/app-tabs';
import { StoreProvider } from '@/data/store';

export default function RootLayout() {
  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <AppTabs />
    </StoreProvider>
  );
}
