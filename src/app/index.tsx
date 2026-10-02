import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { UpdateCard } from '@/components/update-card';
import { Avatar, ChipGroup, Icon, IconButton, Screen, ScreenHeader, SectionHeader, Text } from '@/components/ui';
import { colors, layout, radius, spacing, tones } from '@/constants/theme';
import type { UpdateKind } from '@/data/mock-data';
import { useStore } from '@/data/store';
import { isCelebration } from '@/data/update-kinds';

const filters = ['All', 'Wins', 'Interviews', 'Applied', 'Milestones'] as const;
type Filter = (typeof filters)[number];
const filterKinds: Record<Filter, UpdateKind[] | null> = {
  All: null,
  Wins: ['offer', 'accepted'],
  Interviews: ['interview'],
  Applied: ['applied'],
  Milestones: ['milestone'],
};

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

export default function FeedScreen() {
  const { updates, friendIds, currentUser, getUser, toggleCongrats } = useStore();
  const [filter, setFilter] = useState<Filter>('All');

  const circle = updates.filter(
    (update) => update.userId === currentUser.id || (friendIds.includes(update.userId) && update.visibility === 'friends'),
  );
  const wins = circle.filter((update) => isCelebration(update.kind) && update.userId !== currentUser.id);
  const interviews = circle.filter((update) => update.kind === 'interview').length;
  const kinds = filterKinds[filter];
  const visible = kinds ? circle.filter((update) => kinds.includes(update.kind)) : circle;

  return (
    <Screen>
      <ScreenHeader eyebrow={today} title="Your circle" right={<IconButton icon="bell" label="Notifications" badge />} />

      <View style={styles.summary}>
        <View style={styles.summaryIcon}>
          <Icon name="sparkles" size={20} color={colors.onPrimary} />
        </View>
        <View style={styles.summaryText}>
          <Text variant="headline" color={colors.onPrimary}>
            {wins.length} friends landed internships this week
          </Text>
          <Text variant="callout" color="#C9C6FF">
            {interviews} interviews in progress across your circle
          </Text>
        </View>
      </View>

      {wins.length ? (
        <>
          <SectionHeader title="Recent wins" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.wins}>
            {wins.map((update) => {
              const friend = getUser(update.userId);
              return (
                <View key={update.id} style={styles.win}>
                  <Avatar user={friend} size={56} ring={tones.mint.fg} />
                  <Text variant="callout" numberOfLines={1}>
                    {friend.name.split(' ')[0]}
                  </Text>
                  <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
                    {update.company}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </>
      ) : null}

      <SectionHeader title="Updates" />
      <View style={styles.filters}>
        <ChipGroup options={filters} value={filter} onChange={setFilter} bleed />
      </View>

      {visible.map((update) => (
        <UpdateCard
          key={update.id}
          update={update}
          author={getUser(update.userId)}
          onCongrats={() => toggleCongrats(update.id)}
        />
      ))}
      {visible.length === 0 ? (
        <Text variant="body" color={colors.textMuted} align="center" style={styles.empty}>
          Nothing here yet. Check back soon.
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryDeep,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: { flex: 1, gap: 2 },
  bleed: { marginHorizontal: -layout.gutter },
  wins: { gap: spacing.lg, paddingHorizontal: layout.gutter },
  win: { width: 68, alignItems: 'center', gap: 2 },
  filters: { marginBottom: spacing.md },
  empty: { marginTop: spacing.xxl },
});
