import { router } from 'expo-router';

import { IconButton, Screen, Text, TopBar } from '@/components/ui';

const back = () => (router.canGoBack() ? router.back() : router.navigate('/profile'));

// Stub: replaced by the full edit form.
export default function EditProfileScreen() {
  return (
    <Screen header={<TopBar title="Edit profile" left={<IconButton icon="close" label="Close" tone="muted" onPress={back} />} />}>
      <Text variant="body">Coming soon</Text>
    </Screen>
  );
}
