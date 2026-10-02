import { router, useLocalSearchParams } from 'expo-router';

import { IconButton, Screen, ScreenHeader, Text } from '@/components/ui';
import { useStore } from '@/data/store';

const back = () => (router.canGoBack() ? router.back() : router.navigate('/'));

// Stub: replaced by the full profile page.
export default function UserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getUser } = useStore();
  return (
    <Screen>
      <ScreenHeader title={getUser(id ?? '').name} left={<IconButton icon="back" label="Back" onPress={back} />} />
      <Text variant="body">Coming soon</Text>
    </Screen>
  );
}
