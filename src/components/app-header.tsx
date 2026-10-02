import { router } from 'expo-router';

import { NavMenu } from '@/components/nav-menu';
import { IconButton, TopBar } from '@/components/ui';
import { Wordmark } from '@/components/wordmark';

// The StrJava header shared by the main pages: page menu, wordmark, friends button.
export function AppHeader() {
  return (
    <TopBar
      title={<Wordmark />}
      left={<NavMenu />}
      right={<IconButton icon="friends" label="Friends" tone="muted" onPress={() => router.navigate('/friends')} />}
    />
  );
}
