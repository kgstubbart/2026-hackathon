import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { ProfileStats } from '@/components/profile-stats';
import { Avatar, Icon, IconButton, Screen, SegmentedControl, Text } from '@/components/ui';
import { UpdateCard } from '@/components/update-card';
import { colors, layout, spacing } from '@/constants/theme';
import { useStore } from '@/data/store';

const profileTabs = [
  { label: 'Stats', value: 'stats' },
  { label: 'History', value: 'history' },
] as const;

export default function ProfileScreen() {
  const [selectedTab, setSelectedTab] = useState<(typeof profileTabs)[number]['value']>('stats');
  const { currentUser, updates, friendIds, toggleCongrats, commentsFor } = useStore();
  const mine = updates.filter((update) => update.userId === currentUser.id);

  return (
    <Screen header={<AppHeader />}>
      <View style={styles.profile}>
        <View style={styles.profileTop}>
          <Avatar user={currentUser} size={72} />
          <View style={styles.identity}>
            <Text variant="title">{currentUser.name}</Text>
            <View style={styles.meta}>
              <Icon name="school" size={14} color={colors.textMuted} />
              <Text variant="callout" color={colors.textMuted} numberOfLines={1} style={styles.flex}>
                {currentUser.major} · {currentUser.school}
              </Text>
            </View>
            <View style={styles.meta}>
              <Icon name="location" size={14} color={colors.textMuted} />
              <Text variant="callout" color={colors.textMuted} numberOfLines={1} style={styles.flex}>
                {currentUser.location} · Class of {currentUser.gradYear}
              </Text>
            </View>
          </View>
          <IconButton icon="edit" label="Edit profile" />
        </View>
        <View style={styles.counts}>
          <Text variant="callout">
            <Text variant="callout" style={styles.bold}>
              {friendIds.length}
            </Text>{' '}
            <Text variant="callout" color={colors.textMuted}>
              friends
            </Text>
          </Text>
          <Text variant="callout">
            <Text variant="callout" style={styles.bold}>
              {mine.filter((update) => update.visibility === 'friends').length}
            </Text>{' '}
            <Text variant="callout" color={colors.textMuted}>
              shared updates
            </Text>
          </Text>
        </View>
      </View>

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
  flex: { flexShrink: 1 },
  bold: { fontWeight: '700' },
  profile: { gap: spacing.lg, marginTop: spacing.sm },
  profileTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  identity: { flex: 1, gap: spacing.xs },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  counts: { flexDirection: 'row', gap: spacing.xl },
  tabs: { marginTop: spacing.xxl, marginBottom: spacing.lg },
  history: { gap: spacing.sm, marginHorizontal: -layout.gutter },
});
