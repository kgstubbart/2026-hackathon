import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StreakCard } from '@/components/streak-card';
import { IconButton } from '@/components/ui';
import { UpdateCard } from '@/components/update-card';
import { Wordmark } from '@/components/wordmark';
import { colors, layout, spacing } from '@/constants/theme';
import { currentStreakWeeks } from '@/data/mock-data';
import { useStore } from '@/data/store';

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { updates, friendIds, currentUser, getUser, toggleCongrats } = useStore();

  const mine = updates.filter((update) => update.userId === currentUser.id);
  const feed = updates.filter(
    (update) => update.userId === currentUser.id || (friendIds.includes(update.userId) && update.visibility === 'friends'),
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <View style={[styles.column, styles.topRow]}>
          <View style={styles.side}>
            <IconButton icon="plus" label="Share an update" tone="muted" onPress={() => router.navigate('/share')} />
            <IconButton icon="search" label="Search" tone="muted" onPress={() => router.navigate('/search')} />
          </View>
          <Wordmark />
          <View style={[styles.side, styles.sideRight]}>
            <IconButton icon="chat" label="Chats" tone="muted" onPress={() => router.navigate('/messages')} />
            <IconButton icon="bell" label="Notifications" tone="muted" badge />
          </View>
        </View>
      </View>

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
  topBar: {
    backgroundColor: colors.surface,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  side: { flexDirection: 'row', gap: spacing.sm, flex: 1 },
  sideRight: { justifyContent: 'flex-end' },
  content: { paddingBottom: spacing.xxl },
  stack: { gap: spacing.sm },
});
