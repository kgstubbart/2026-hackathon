import { StyleSheet, View } from 'react-native';

import { Button, Icon, Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import type { Update } from '@/data/mock-data';

type DayState = 'done' | 'today' | 'missed' | 'upcoming';
const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// Strava-style weekly streak: flame with week count, then this week's days (Mon–Sun).
export function StreakCard({ updates, priorWeeks }: { updates: Update[]; priorWeeks: number }) {
  const now = new Date();
  const todayIndex = (now.getDay() + 6) % 7;
  const week = dayLetters.map((letter, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - todayIndex + index);
    const done = updates.some((update) => sameDay(new Date(update.createdAt), date));
    const state: DayState = done ? 'done' : index === todayIndex ? 'today' : index < todayIndex ? 'missed' : 'upcoming';
    return { letter, date: date.getDate(), state };
  });
  const weeks = priorWeeks + (week.some((day) => day.state === 'done') ? 1 : 0);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Text variant="headline">Your streak</Text>
        <Button label="Share" icon="share" size="sm" variant="outline" />
      </View>

      <View style={styles.body}>
        <View style={styles.flame}>
          <View style={styles.flameIcon}>
            <View style={styles.drop} />
            <View style={styles.innerDrop} />
            <Text style={styles.flameCount} color={colors.onPrimary}>
              {weeks}
            </Text>
          </View>
          <Text variant="callout" color={colors.streak} style={styles.flameLabel}>
            Weeks
          </Text>
        </View>

        <View style={styles.days}>
          {week.map((day, index) => (
            <View key={index} style={styles.day}>
              <Text variant="callout" color={colors.textMuted}>
                {day.letter}
              </Text>
              <View style={[styles.circle, styles[day.state]]}>
                {day.state === 'done' ? (
                  <Icon name="briefcase" size={15} color={colors.onPrimary} />
                ) : (
                  <Text variant="callout" color={day.state === 'today' ? colors.text : colors.textMuted}>
                    {day.date}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const CIRCLE = 34;

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, gap: spacing.lg },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  body: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flame: { alignItems: 'center', width: 70 },
  // Flame drawn as a teardrop (square with one sharp corner, rotated to point up) so it renders filled everywhere.
  flameIcon: { width: 60, height: 64, alignItems: 'center', justifyContent: 'flex-end' },
  drop: {
    position: 'absolute',
    bottom: 4,
    width: 46,
    height: 46,
    borderRadius: 23,
    borderTopRightRadius: 2,
    backgroundColor: colors.streak,
    transform: [{ rotate: '-45deg' }],
  },
  innerDrop: {
    position: 'absolute',
    bottom: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderTopRightRadius: 2,
    backgroundColor: colors.streakSoft,
    transform: [{ rotate: '-45deg' }],
  },
  flameCount: { position: 'absolute', bottom: 13, fontSize: 18, lineHeight: 22, fontWeight: '800' },
  flameLabel: { fontWeight: '700', marginTop: 2 },
  days: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: spacing.sm },
  circle: { width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2, alignItems: 'center', justifyContent: 'center' },
  done: { backgroundColor: colors.text },
  today: { borderWidth: 2, borderColor: colors.text },
  missed: { backgroundColor: colors.surfaceMuted },
  upcoming: { borderWidth: 1.5, borderColor: colors.border },
});
