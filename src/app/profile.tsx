import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { KindBadge } from '@/components/update-card';
import { Avatar, Button, Card, Icon, IconButton, Screen, ScreenHeader, SectionHeader, Text } from '@/components/ui';
import { colors, radius, spacing, tones } from '@/constants/theme';
import { useStore } from '@/data/store';
import { headlineFor, timeAgo, updateKinds } from '@/data/update-kinds';

export default function ProfileScreen() {
  const { currentUser, updates, friendIds } = useStore();
  const mine = updates.filter((update) => update.userId === currentUser.id);
  const count = (kinds: string[]) => mine.filter((update) => kinds.includes(update.kind)).length;
  const latest = mine[0];

  const stats = [
    { label: 'Applied', value: count(['applied']), tone: tones.sky },
    { label: 'Interviews', value: count(['interview']), tone: tones.amber },
    { label: 'Offers', value: count(['offer', 'accepted']), tone: tones.mint },
  ];

  return (
    <Screen>
      <ScreenHeader eyebrow="Your internship hunt" title="Profile" right={<IconButton icon="settings" label="Settings" />} />

      <Card style={styles.profile}>
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
            <Text variant="callout" color={colors.textMuted}>
              {currentUser.location} · Class of {currentUser.gradYear}
            </Text>
          </View>
        </View>
        {latest ? (
          <View style={styles.status}>
            <KindBadge kind={latest.kind} />
            <Text variant="callout" numberOfLines={1} style={styles.flex}>
              {headlineFor(latest)}
            </Text>
          </View>
        ) : null}
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
      </Card>

      <View style={styles.stats}>
        {stats.map((stat) => (
          <View key={stat.label} style={[styles.stat, { backgroundColor: stat.tone.bg }]}>
            <Text variant="display" color={stat.tone.fg}>
              {stat.value}
            </Text>
            <Text variant="label" color={stat.tone.fg}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      <SectionHeader
        title="Your journey"
        action={<Button label="Share" icon="plus" size="sm" variant="secondary" onPress={() => router.navigate('/share')} />}
      />
      <Card>
        {mine.map((update, index) => {
          const meta = updateKinds[update.kind];
          const tone = tones[meta.tone];
          const last = index === mine.length - 1;
          return (
            <View key={update.id} style={styles.step}>
              <View style={styles.rail}>
                <View style={[styles.dot, { backgroundColor: tone.bg }]}>
                  <Icon name={meta.icon} size={14} color={tone.fg} />
                </View>
                {last ? null : <View style={styles.line} />}
              </View>
              <View style={[styles.stepText, !last && styles.stepGap]}>
                <Text variant="headline">{headlineFor(update)}</Text>
                <Text variant="caption" color={colors.textMuted}>
                  {update.role} · {update.term}
                </Text>
                <View style={styles.meta}>
                  <Icon name={update.visibility === 'private' ? 'lock' : 'friends'} size={12} color={colors.textFaint} />
                  <Text variant="caption" color={colors.textFaint}>
                    {update.visibility === 'private' ? 'Only you' : 'Friends'} · {timeAgo(update.createdAt)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flexShrink: 1 },
  bold: { fontWeight: '700' },
  profile: { gap: spacing.lg },
  identity: { gap: spacing.xs },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  counts: { flexDirection: 'row', gap: spacing.xl },
  stats: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  stat: { flex: 1, padding: spacing.md + 2, borderRadius: radius.lg, gap: spacing.xxs },
  step: { flexDirection: 'row', gap: spacing.md },
  rail: { alignItems: 'center' },
  dot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  line: { flex: 1, width: 2, marginVertical: spacing.xs, backgroundColor: colors.border, borderRadius: 1 },
  stepText: { flex: 1, gap: 3, paddingTop: 4 },
  stepGap: { paddingBottom: spacing.xl },
});
