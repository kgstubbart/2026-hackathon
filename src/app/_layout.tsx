import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { JobHuntProvider } from '@/data/job-hunt-store';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <JobHuntProvider>
      <AnimatedSplashOverlay />
      <AppTabs />
    </JobHuntProvider>
  );
}
