import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ProfileIdentity } from '@/components/profile-identity';
import { ProfileStats } from '@/components/profile-stats';
import { IconButton, Screen, ScreenHeader, SegmentedControl, Text } from '@/components/ui';
import { UpdateCard } from '@/components/update-card';
import { colors, layout, spacing } from '@/constants/theme';
import { useStore } from '@/data/store';

const profileTabs = [
  { label: 'History', value: 'history' },
  { label: 'Stats', value: 'stats' },
] as const;

export default function ProfileScreen() {
  const [selectedTab, setSelectedTab] = useState<(typeof profileTabs)[number]['value']>('history');
  const { currentUser, updates, friendIds, toggleCongrats, commentsFor } = useStore();
  const mine = updates.filter((update) => update.userId === currentUser.id);

  return (
    <Screen>
      <ScreenHeader title="Profile" />
      <ProfileIdentity
        user={currentUser}
        action={<IconButton icon="edit" label="Edit profile" onPress={() => router.navigate('/edit-profile')} />}
        counts={[
          { value: friendIds.length, label: 'friends', onPress: () => router.navigate('/friends') },
          { value: mine.filter((update) => update.visibility === 'friends').length, label: 'shared updates' },
        ]}
      />

      <View style={styles.tabs}>
        <SegmentedControl options={profileTabs} value={selectedTab} onChange={setSelectedTab} />
      </View>

      {selectedTab === 'history' ? (
        <View style={styles.history}>
          {mine.length ? (
            mine.map((update) => (
              <UpdateCard
                key={update.id}
                commentCount={commentsFor(update.id).length}
                update={update}
                author={currentUser}
                onCongrats={() => toggleCongrats(update.id)}
              />
            ))
          ) : (
            <Text variant="body" color={colors.textMuted} align="center">
              No updates yet. Share one to start your history.
            </Text>
          )}
        </View>
      ) : (
        <ProfileStats updates={mine} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { marginTop: spacing.xxl, marginBottom: spacing.lg },
  history: { gap: spacing.sm, marginHorizontal: -layout.gutter },
});
