import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { Card, SectionHeader, Text } from '@/components/ui';
import { colors, radius, shadow, spacing, tones } from '@/constants/theme';
import { companySuggestions, type Update } from '@/data/mock-data';

const chartHeight = spacing.xxxl * 4;
const cardThemes = [
  { frame: '#172A47', art: '#315D82', accent: '#F3D58A', glow: '#A7D8ED' },
  { frame: '#382548', art: '#744779', accent: '#F0CB91', glow: '#E7B5D9' },
  { frame: '#173E39', art: '#2D766A', accent: '#E8D394', glow: '#ACDEBD' },
  { frame: '#59372D', art: '#AA6345', accent: '#F4D7A1', glow: '#F4BFA3' },
  { frame: '#263750', art: '#5276A9', accent: '#E9D6AD', glow: '#BDD4F3' },
  { frame: '#493044', art: '#96627B', accent: '#F5D6A0', glow: '#F1C4CC' },
] as const;

function companyKey(name: string) {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

function companyCard(name: string) {
  const key = companyKey(name);
  const displayName = companySuggestions.find((suggestion) => companyKey(suggestion) === key)
    ?? key.split(' ').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
  const words = displayName.split(/\s+/);
  const monogram = (words.length > 1 ? words[0][0] + words[1][0] : displayName.slice(0, 2)).toUpperCase();
  let hash = 0;
  for (const character of key) hash = (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0;
  return {
    key,
    displayName,
    monogram,
    serial: String(hash % 1000).padStart(3, '0'),
    shineStart: 0.07 + (hash % 4) * 0.17,
    theme: cardThemes[hash % cardThemes.length],
  };
}

function CompanyTradingCard({ card, shine, reduceMotion }: {
  card: ReturnType<typeof companyCard>;
  shine: SharedValue<number>;
  reduceMotion: boolean;
}) {
  const { displayName, monogram, serial, theme } = card;
  const shineStart = card.shineStart;
  const shineStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(shine.value, [0, shineStart, shineStart + 0.14, 1], [-170, -170, 400, 400]) },
      { rotate: '20deg' },
    ],
  }));

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${displayName} company trading card, number ${serial}`}
      style={[styles.companyCard, { backgroundColor: theme.frame, borderColor: theme.accent }]}>
      <View style={[styles.cardInset, { borderColor: theme.accent }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardSmallText} color={theme.accent}>STRJAVA</Text>
          <Text style={styles.cardSmallText} color={theme.accent}>NO. {serial}</Text>
        </View>
        <View style={[styles.cardArt, { backgroundColor: theme.art, borderColor: theme.accent }]}>
          <View style={[styles.artStripeTop, { backgroundColor: theme.glow }]} />
          <View style={[styles.artStripeBottom, { backgroundColor: theme.glow }]} />
          <View style={[styles.artRing, { borderColor: theme.glow }]} />
          <View style={[styles.artRingInner, { borderColor: theme.accent }]} />
          <View style={[styles.artEmblem, { backgroundColor: theme.frame, borderColor: theme.accent }]}>
            <Text style={styles.emblemText} color={theme.accent}>{monogram}</Text>
          </View>
          {!reduceMotion ? (
            <Animated.View pointerEvents="none" style={[styles.cardShine, shineStyle]}>
              <View style={styles.cardShineCore} />
            </Animated.View>
          ) : null}
        </View>
        <View style={styles.cardNameplate}>
          <Text style={styles.cardName} color={colors.white} numberOfLines={2}>{displayName}</Text>
          <View style={[styles.nameplateRule, { backgroundColor: theme.accent }]} />
          <Text style={styles.cardSmallText} color={theme.accent}>APPLICATION SERIES</Text>
        </View>
      </View>
    </View>
  );
}

export function ProfileStats({ updates }: { updates: Update[] }) {
  const reduceMotion = useReducedMotion();
  const shine = useSharedValue(0);
  const applications = updates.filter((update) => update.kind === 'applied');
  const stats = [
    { label: 'Applied', value: applications.length, tone: tones.sky },
    { label: 'Interviews', value: updates.filter((update) => update.kind === 'interview').length, tone: tones.amber },
    { label: 'Offers', value: updates.filter((update) => update.kind === 'offer' || update.kind === 'accepted').length, tone: tones.mint },
  ];

  const seenCompanies = new Set<string>();
  const companies = [...applications]
    .filter((update) => update.company.trim())
    .sort((a, b) => b.createdAt - a.createdAt)
    .filter((update) => {
      const key = companyKey(update.company);
      if (seenCompanies.has(key)) return false;
      seenCompanies.add(key);
      return true;
    })
    .map((update) => companyCard(update.company));
  const hasCompanies = companies.length > 0;

  useEffect(() => {
    if (reduceMotion || !hasCompanies) return;
    shine.value = 0;
    shine.value = withRepeat(withTiming(1, { duration: 5400, easing: Easing.linear }), -1);
    return () => cancelAnimation(shine);
  }, [hasCompanies, reduceMotion, shine]);

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

      <SectionHeader
        title="Card collection"
        action={<Text variant="caption" color={colors.textMuted}>{companies.length} collected</Text>}
      />
      {companies.length ? (
        <View style={styles.collection}>
          {companies.map((card) => (
            <CompanyTradingCard key={card.key} card={card} shine={shine} reduceMotion={reduceMotion} />
          ))}
        </View>
      ) : (
        <Text variant="body" color={colors.textMuted} align="center" style={styles.empty}>
          No cards yet. Log an application to collect your first company.
        </Text>
      )}
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
  collection: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md },
  companyCard: {
    width: '48%',
    aspectRatio: 0.7,
    borderRadius: radius.md,
    borderWidth: 2,
    padding: 3,
    ...shadow.card,
  },
  cardInset: { flex: 1, borderRadius: radius.sm, borderWidth: 1, padding: 7, gap: 6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardSmallText: { fontSize: 8, lineHeight: 11, fontWeight: '800', letterSpacing: 0.8 },
  cardArt: {
    flex: 1,
    borderRadius: 5,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artStripeTop: { position: 'absolute', width: 190, height: 18, top: 8, left: -44, opacity: 0.2, transform: [{ rotate: '-28deg' }] },
  artStripeBottom: { position: 'absolute', width: 190, height: 10, bottom: 13, left: -27, opacity: 0.25, transform: [{ rotate: '-28deg' }] },
  artRing: { position: 'absolute', width: 106, height: 106, borderRadius: 53, borderWidth: 1, opacity: 0.65 },
  artRingInner: { position: 'absolute', width: 84, height: 84, borderRadius: 42, borderWidth: 1, opacity: 0.8 },
  cardShine: {
    position: 'absolute',
    top: -80,
    bottom: -80,
    left: -70,
    width: 70,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  cardShineCore: { position: 'absolute', top: 0, bottom: 0, left: 27, width: 14, backgroundColor: 'rgba(255,255,255,0.12)' },
  artEmblem: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemText: { fontSize: 23, lineHeight: 29, fontWeight: '900', letterSpacing: -1 },
  cardNameplate: { minHeight: 50, justifyContent: 'flex-end', gap: 3 },
  cardName: { fontSize: 15, lineHeight: 17, fontWeight: '800', letterSpacing: -0.3 },
  nameplateRule: { height: 1, opacity: 0.6 },
  empty: { paddingVertical: spacing.xl },
});
