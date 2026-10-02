import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { StreakCard } from '@/components/streak-card';
import { UpdateCard } from '@/components/update-card';
import { colors, layout, spacing } from '@/constants/theme';
import { currentStreakWeeks } from '@/data/mock-data';
import { useStore } from '@/data/store';
import { feedKinds } from '@/data/update-kinds';

export default function FeedScreen() {
  const { updates, friendIds, currentUser, getUser, toggleCongrats } = useStore();

  const mine = updates.filter((update) => update.userId === currentUser.id);
  const feed = updates.filter(
    (update) =>
      feedKinds.includes(update.kind) &&
      (update.userId === currentUser.id || (friendIds.includes(update.userId) && update.visibility === 'friends')),
  );

  return (
    <View style={styles.screen}>
      <AppHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.column, styles.stack]}>
          <StreakCard updates={mine} priorWeeks={currentStreakWeeks} />
          {feed.map((update) => (
            <UpdateCard
              key={update.id}
              update={update}
              author={getUser(update.userId)}
              onCongrats={() => toggleCongrats(update.id)}
            />
          ))}
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
});
