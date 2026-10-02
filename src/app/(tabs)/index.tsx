import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { StreakCard } from '@/components/streak-card';
import { Button, Text } from '@/components/ui';
import { UpdateCard } from '@/components/update-card';
import { colors, layout, spacing } from '@/constants/theme';
import { currentStreakWeeks } from '@/data/mock-data';
import { useStore } from '@/data/store';
import { feedKinds } from '@/data/update-kinds';

const refreshMs = 600;

export default function FeedScreen() {
  const { updates, friendIds, currentUser, getUser, toggleCongrats, commentsFor } = useStore();

  // Data is in-memory, so a pull just spins briefly; the real fetch arrives with the backend.
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
  }, []);
  const refresh = useCallback(() => {
    setRefreshing(true);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => setRefreshing(false), refreshMs);
  }, []);

  const mine = updates.filter((update) => update.userId === currentUser.id);
  const feed = updates.filter(
    (update) =>
      feedKinds.includes(update.kind) &&
      (update.userId === currentUser.id || (friendIds.includes(update.userId) && update.visibility === 'friends')),
  );

  return (
    <View style={styles.screen}>
      <AppHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} colors={[colors.primary]} />}>
        <View style={[styles.column, styles.stack]}>
          <StreakCard updates={mine} priorWeeks={currentStreakWeeks} />
          {feed.length ? (
            feed.map((update) => (
              <UpdateCard
                key={update.id}
                commentCount={commentsFor(update.id).length}
                update={update}
                author={getUser(update.userId)}
                onCongrats={() => toggleCongrats(update.id)}
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Text variant="headline">Nothing here yet</Text>
              <Text variant="body" color={colors.textMuted}>
                Add friends to see their interviews, OAs and offers, or share your own.
              </Text>
              <View style={styles.emptyActions}>
                <Button label="Find friends" icon="friends" onPress={() => router.navigate('/friends')} />
                <Button label="Share an update" icon="plus" variant="outline" onPress={() => router.navigate('/share')} />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  column: { width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center' },
  content: { paddingBottom: spacing.xxl },
  stack: { gap: spacing.sm },
  // Same look as a `Section`: white, gutter padding, no radius.
  empty: { backgroundColor: colors.surface, paddingHorizontal: layout.gutter, paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
});
