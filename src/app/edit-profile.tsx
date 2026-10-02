import { router } from 'expo-router';

import { IconButton, Screen, ScreenHeader, Text } from '@/components/ui';

const back = () => (router.canGoBack() ? router.back() : router.navigate('/profile'));

// Stub: replaced by the full edit form.
export default function EditProfileScreen() {
  return (
    <Screen>
      <ScreenHeader title="Edit profile" left={<IconButton icon="close" label="Close" onPress={back} />} />
      <Text variant="body">Coming soon</Text>
    </Screen>
  );
}
