import { StyleSheet, View } from 'react-native';

import { CardCollection } from '@/components/card-collection';
import { Card, Text } from '@/components/ui';
import { colors, radius, spacing, tones } from '@/constants/theme';
import type { Update } from '@/data/mock-data';

const chartHeight = spacing.xxxl * 4;
export function ProfileStats({ updates }: { updates: Update[] }) {
  const applications = updates.filter((update) => update.kind === 'applied');
  const stats = [
    { label: 'Applied', value: applications.length, tone: tones.sky },
    { label: 'Interviews', value: updates.filter((update) => update.kind === 'interview').length, tone: tones.amber },
    { label: 'Offers', value: updates.filter((update) => update.kind === 'offer' || update.kind === 'accepted').length, tone: tones.mint },
  ];

  const firstDay = new Date();
  firstDay.setHours(0, 0, 0, 0);
  firstDay.setDate(firstDay.getDate() - 6);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(firstDay);
    date.setDate(firstDay.getDate() + index);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    return {
      date,
      count: applications.filter((update) => update.createdAt >= date.getTime() && update.createdAt < nextDay.getTime()).length,
    };
  });
  const chartMax = Math.max(2, ...days.map((day) => day.count));

  return (
    <View>
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

      <Card style={styles.chartCard}>
        <Text variant="headline">Applications over time</Text>
        <Text variant="caption" color={colors.textMuted}>
          Last 7 days
        </Text>
        <View style={styles.chart}>
          {days.map(({ date, count }) => (
            <View
              key={date.getTime()}
              accessible
              accessibilityRole="image"
              accessibilityLabel={`${date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}: ${count} ${count === 1 ? 'application' : 'applications'}`}
              style={styles.day}>
              <Text variant="caption" color={colors.textMuted} align="center">
                {count || ' '}
              </Text>
              <View style={styles.plot}>
                <View style={[styles.bar, { height: (count / chartMax) * chartHeight }]} />
              </View>
              <Text variant="caption" color={colors.textMuted} align="center">
                {date.toLocaleDateString(undefined, { weekday: 'short' })}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <CardCollection updates={updates} emptyText="No cards yet. Log an application to collect your first company." />
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: spacing.sm },
  stat: { flex: 1, padding: spacing.md + 2, borderRadius: radius.lg, gap: spacing.xxs },
  chartCard: { marginTop: spacing.xl, gap: spacing.xs },
  chart: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.lg },
  day: { flex: 1, gap: spacing.xs },
  plot: { height: chartHeight, justifyContent: 'flex-end', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  bar: { width: spacing.xl, maxWidth: '100%', backgroundColor: tones.sky.fg, borderTopLeftRadius: radius.sm, borderTopRightRadius: radius.sm },
});
