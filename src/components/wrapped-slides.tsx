import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';

import { Avatar, Icon, Text, type IconName } from '@/components/ui';
import { Wordmark } from '@/components/wordmark';
import { radius, spacing, wrapped, wrappedGlass, type WrappedSlideTheme } from '@/constants/theme';
import type { User } from '@/data/mock-data';

export type WrappedData = {
  user: User;
  year: number;
  applications: number;
  interviews: number;
  takehomes: number;
  offers: number;
  longestStreakWeeks: number;
  congratsReceived: number;
  congratsGiven: number;
  topCompany: string;
  topCompanyInterviews: number;
  busiestMonth: string;
  hypeFriend: User;
  hypeFriendCongrats: number;
  friendWins: { friend: User; company: string }[];
};

export type Slide = { key: string; theme: WrappedSlideTheme; render: (data: WrappedData) => ReactNode };

// Staggered entrance so each slide builds up line by line.
const delayFor = (step: number) => 150 + step * 220;

// Entrance animation driven by a shared value (works the same on iOS, Android and web).
// `rise` fades and slides up; `pop` springs in from a smaller scale.
function Reveal({
  step = 0,
  delay,
  effect = 'rise',
  style,
  children,
}: {
  step?: number;
  delay?: number;
  effect?: 'rise' | 'pop';
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const progress = useSharedValue(0);
  const wait = delay ?? delayFor(step);
  useEffect(() => {
    progress.value = withDelay(
      wait,
      effect === 'pop'
        ? withSpring(1, { damping: 11, stiffness: 140 })
        : withTiming(1, { duration: 550, easing: Easing.out(Easing.cubic) }),
    );
  }, [effect, progress, wait]);
  const animated = useAnimatedStyle(() =>
    effect === 'pop'
      ? { opacity: Math.min(1, progress.value * 2), transform: [{ scale: 0.5 + 0.5 * progress.value }] }
      : { opacity: progress.value, transform: [{ translateY: (1 - progress.value) * 28 }] },
  );
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

export const slides: Slide[] = [
  {
    key: 'intro',
    theme: wrapped.intro,
    render: (data) => (
      <View style={styles.body}>
        <Reveal effect="pop" delay={0}>
          <Wordmark size={44} color={wrapped.intro.fg} />
        </Reveal>
        <Reveal step={1}>
          <Text variant="poster" color={wrapped.intro.fg}>
            Your {data.year} internship season,{' '}
            <Text variant="poster" color={wrapped.intro.accent}>
              wrapped.
            </Text>
          </Text>
        </Reveal>
        <Reveal step={3}>
          <Text variant="headline" color={wrapped.intro.fg} style={styles.dim}>
            Tap to see how you did →
          </Text>
        </Reveal>
      </View>
    ),
  },
  {
    key: 'applications',
    theme: wrapped.applications,
    render: (data) => (
      <View style={styles.body}>
        <Lead theme={wrapped.applications} step={0}>
          You hit send on
        </Lead>
        <BigNumber value={data.applications} theme={wrapped.applications} />
        <Lead theme={wrapped.applications} step={2}>
          applications
        </Lead>
        <Caption theme={wrapped.applications} step={3}>
          That&apos;s about one every 3 days. {data.busiestMonth} was your busiest month.
        </Caption>
      </View>
    ),
  },
  {
    key: 'interviews',
    theme: wrapped.interviews,
    render: (data) => (
      <View style={styles.body}>
        <Lead theme={wrapped.interviews} step={0}>
          Which turned into
        </Lead>
        <BigNumber value={data.interviews} theme={wrapped.interviews} />
        <Lead theme={wrapped.interviews} step={2}>
          interviews
        </Lead>
        <Reveal step={3} style={styles.pills}>
          <Pill theme={wrapped.interviews} icon="code" label={`${data.takehomes} take-homes & OAs`} />
          <Pill theme={wrapped.interviews} icon="star" label={`${data.topCompanyInterviews} rounds at ${data.topCompany}`} />
        </Reveal>
      </View>
    ),
  },
  {
    key: 'streak',
    theme: wrapped.streak,
    render: (data) => (
      <View style={[styles.body, styles.center]}>
        <Reveal effect="pop" delay={100} style={styles.flame}>
          <View style={[styles.drop, { backgroundColor: wrapped.streak.accent }]} />
          <Text variant="poster" color={wrapped.streak.colors[0]} style={styles.flameNumber}>
            {data.longestStreakWeeks}
          </Text>
        </Reveal>
        <Lead theme={wrapped.streak} step={1} align="center">
          week streak
        </Lead>
        <Caption theme={wrapped.streak} step={2} align="center">
          You logged something every single week since summer. Consistency is your superpower.
        </Caption>
      </View>
    ),
  },
  {
    key: 'circle',
    theme: wrapped.circle,
    render: (data) => (
      <View style={styles.body}>
        <Lead theme={wrapped.circle} step={0}>
          Your circle was on fire
        </Lead>
        <BigNumber value={data.friendWins.length} theme={wrapped.circle} />
        <Lead theme={wrapped.circle} step={2}>
          friends landed offers
        </Lead>
        <View style={styles.list}>
          {data.friendWins.map(({ friend, company }, index) => (
            <Reveal key={friend.id} step={3 + index} style={styles.listRow}>
              <Avatar user={friend} size={40} ring={wrapped.circle.accent} />
              <Text variant="headline" color={wrapped.circle.fg} style={styles.flex}>
                {friend.name.split(' ')[0]}
              </Text>
              <Text variant="headline" color={wrapped.circle.accent}>
                {company}
              </Text>
            </Reveal>
          ))}
        </View>
      </View>
    ),
  },
  {
    key: 'hype',
    theme: wrapped.hype,
    render: (data) => (
      <View style={styles.body}>
        <Lead theme={wrapped.hype} step={0}>
          Your biggest hype person
        </Lead>
        <Reveal effect="pop" delay={300} style={styles.hypeRow}>
          <Avatar user={data.hypeFriend} size={96} ring={wrapped.hype.accent} />
          <View style={styles.flex}>
            <Text variant="poster" color={wrapped.hype.fg}>
              {data.hypeFriend.name.split(' ')[0]}
            </Text>
            <Text variant="headline" color={wrapped.hype.accent}>
              sent you {data.hypeFriendCongrats} congrats
            </Text>
          </View>
        </Reveal>
        <Reveal step={3} style={styles.statRow}>
          <MiniStat theme={wrapped.hype} value={data.congratsReceived} label="congrats received" />
          <MiniStat theme={wrapped.hype} value={data.congratsGiven} label="congrats given" />
        </Reveal>
      </View>
    ),
  },
  {
    key: 'archetype',
    theme: wrapped.archetype,
    render: (data) => {
      const archetype = archetypeFor(data);
      return (
        <View style={styles.body}>
          <Lead theme={wrapped.archetype} step={0}>
            Your intern archetype is
          </Lead>
          <Reveal effect="pop" delay={350}>
            <Text variant="hero" color={wrapped.archetype.accent} style={styles.archetype}>
              {archetype.name}
            </Text>
          </Reveal>
          <Caption theme={wrapped.archetype} step={2}>
            {archetype.blurb}
          </Caption>
          <Reveal step={3} style={styles.pills}>
            {archetype.traits.map((trait) => (
              <Pill key={trait} theme={wrapped.archetype} label={trait} solid />
            ))}
          </Reveal>
        </View>
      );
    },
  },
  {
    key: 'summary',
    theme: wrapped.summary,
    render: (data) => (
      <View style={styles.body}>
        <Reveal delay={0} style={styles.card}>
          <View style={styles.cardTop}>
            <Wordmark size={22} color={wrapped.summary.fg} />
            <Text variant="label" color={wrapped.summary.accent}>
              Wrapped {data.year}
            </Text>
          </View>
          <View style={styles.cardUser}>
            <Avatar user={data.user} size={52} ring={wrapped.summary.accent} />
            <View style={styles.flex}>
              <Text variant="title" color={wrapped.summary.fg}>
                {data.user.name}
              </Text>
              <Text variant="callout" color={wrapped.summary.fg} style={styles.dim}>
                {archetypeFor(data).name} · {data.user.school}
              </Text>
            </View>
          </View>
          <View style={styles.grid}>
            <GridStat value={data.applications} label="Applications" />
            <GridStat value={data.interviews} label="Interviews" />
            <GridStat value={data.takehomes} label="Take-homes" />
            <GridStat value={data.offers} label="Offers" />
            <GridStat value={data.longestStreakWeeks} label="Week streak" />
            <GridStat value={data.congratsReceived} label="Congrats" />
          </View>
          <Text variant="callout" color={wrapped.summary.fg} style={styles.dim}>
            Top company · <Text variant="callout" color={wrapped.summary.accent}>{data.topCompany}</Text>
          </Text>
        </Reveal>
      </View>
    ),
  },
];

export function archetypeFor(data: WrappedData) {
  if (data.offers > 0)
    return {
      name: 'The Closer',
      blurb: 'You turned interviews into offers. When it counted, you delivered.',
      traits: ['Clutch', 'Calm under pressure', 'Offer magnet'],
    };
  if (data.interviews >= 5)
    return {
      name: 'The Ace',
      blurb: 'Recruiters kept calling you back. The offers are on their way.',
      traits: ['Smooth talker', 'Prepared', 'Persistent'],
    };
  return {
    name: 'The Grinder',
    blurb: 'Application after application, you never stopped shipping.',
    traits: ['Relentless', 'Consistent', 'Unbothered'],
  };
}

function Lead({ theme, step, align, children }: { theme: WrappedSlideTheme; step: number; align?: 'center'; children: ReactNode }) {
  return (
    <Reveal step={step}>
      <Text variant="title" color={theme.fg} align={align}>
        {children}
      </Text>
    </Reveal>
  );
}

function Caption({ theme, step, align, children }: { theme: WrappedSlideTheme; step: number; align?: 'center'; children: ReactNode }) {
  return (
    <Reveal step={step}>
      <Text variant="headline" color={theme.fg} align={align} style={styles.dim}>
        {children}
      </Text>
    </Reveal>
  );
}

// Huge number that counts up from zero when the slide appears.
function BigNumber({ value, theme }: { value: number; theme: WrappedSlideTheme }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let frame = 0;
    const start = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / 1100);
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return (
    <Reveal effect="pop" delay={250}>
      <Text variant="hero" color={theme.accent}>
        {shown}
      </Text>
    </Reveal>
  );
}

function Pill({ theme, label, icon, solid }: { theme: WrappedSlideTheme; label: string; icon?: IconName; solid?: boolean }) {
  return (
    <View style={[styles.pill, solid ? { backgroundColor: theme.fg } : { borderColor: theme.fg }]}>
      {icon ? <Icon name={icon} size={14} color={solid ? theme.colors[0] : theme.fg} /> : null}
      <Text variant="callout" color={solid ? theme.colors[0] : theme.fg} style={styles.bold}>
        {label}
      </Text>
    </View>
  );
}

function MiniStat({ theme, value, label }: { theme: WrappedSlideTheme; value: number; label: string }) {
  return (
    <View style={styles.miniStat}>
      <Text variant="poster" color={theme.accent}>
        {value}
      </Text>
      <Text variant="callout" color={theme.fg} style={styles.dim}>
        {label}
      </Text>
    </View>
  );
}

function GridStat({ value, label }: { value: number; label: string }) {
  return (
    <Reveal delay={400} style={styles.gridStat}>
      <Text variant="poster" color={wrapped.summary.fg}>
        {value}
      </Text>
      <Text variant="label" color={wrapped.summary.accent}>
        {label}
      </Text>
    </Reveal>
  );
}

const DROP = 150;

const styles = StyleSheet.create({
  body: { gap: spacing.lg },
  center: { alignItems: 'center' },
  flex: { flex: 1 },
  dim: { opacity: 0.85 },
  bold: { fontWeight: '700' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  flame: { width: DROP + 20, height: DROP + 30, alignItems: 'center', justifyContent: 'flex-end' },
  drop: {
    position: 'absolute',
    bottom: 10,
    width: DROP,
    height: DROP,
    borderRadius: DROP / 2,
    borderTopRightRadius: spacing.sm,
    transform: [{ rotate: '-45deg' }],
  },
  flameNumber: { marginBottom: DROP * 0.28 },
  list: { gap: spacing.md, marginTop: spacing.sm },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    paddingRight: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: wrappedGlass.fill,
  },
  hypeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginVertical: spacing.md },
  statRow: { flexDirection: 'row', gap: spacing.md },
  miniStat: { flex: 1, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: wrappedGlass.fill },
  archetype: { marginVertical: spacing.sm },
  card: {
    gap: spacing.xl,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: wrappedGlass.fill,
    borderWidth: 1,
    borderColor: wrappedGlass.line,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardUser: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.lg },
  gridStat: { width: '33.33%', gap: spacing.xxs },
});
