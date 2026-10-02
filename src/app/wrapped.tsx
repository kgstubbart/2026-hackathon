import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { Button, Icon } from '@/components/ui';
import { slides, type WrappedData } from '@/components/wrapped-slides';
import { layout, radius, spacing, wrappedGlass } from '@/constants/theme';
import { seasonStats } from '@/data/mock-data';
import { useStore } from '@/data/store';

const SLIDE_MS = 6000;

// StrJava Wrapped: Spotify Wrapped-style stories of the user's internship season.
export default function WrappedScreen() {
  const insets = useSafeAreaInsets();
  const { currentUser, updates, friendIds, getUser } = useStore();
  const [index, setIndex] = useState(0);
  const progress = useSharedValue(0);
  const last = index === slides.length - 1;
  const slide = slides[index];

  // Always start from the first slide when the page is opened.
  useFocusEffect(useCallback(() => setIndex(0), []));

  const go = useCallback((delta: number) => {
    setIndex((current) => Math.min(slides.length - 1, Math.max(0, current + delta)));
  }, []);

  // Auto-advance like stories; the summary slide stays put.
  useEffect(() => {
    progress.value = 0;
    if (last) {
      progress.value = 1;
      return;
    }
    progress.value = withTiming(1, { duration: SLIDE_MS, easing: Easing.linear }, (finished) => {
      if (finished) scheduleOnRN(go, 1);
    });
  }, [index, last, go, progress]);

  const activeBar = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  const friendWins = updates
    .filter((update) => friendIds.includes(update.userId) && (update.kind === 'offer' || update.kind === 'accepted'))
    .filter((update, i, all) => all.findIndex((other) => other.userId === update.userId) === i)
    .map((update) => ({ friend: getUser(update.userId), company: update.company }));

  const data: WrappedData = {
    ...seasonStats,
    user: currentUser,
    hypeFriend: getUser(seasonStats.hypeFriendId),
    friendWins,
  };

  return (
    <LinearGradient colors={slide.theme.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.screen}>
      {/* Decorative shapes; re-keyed so they drift in fresh on every slide. */}
      <Animated.View key={`blob-a-${index}`} style={[styles.blob, styles.blobA, { backgroundColor: slide.theme.accent }]} />
      <View style={[styles.blob, styles.blobB]} />

      {/* Tap zones: left third goes back, the rest goes forward. Content sits above with box-none. */}
      <View style={StyleSheet.absoluteFill}>
        <Pressable accessibilityLabel="Previous" style={styles.zoneBack} onPress={() => go(-1)} />
        <Pressable accessibilityLabel="Next" style={styles.zoneNext} onPress={() => go(1)} />
      </View>

      <View pointerEvents="box-none" style={[styles.column, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.xl }]}>
        <View pointerEvents="box-none" style={styles.top}>
          <View style={styles.bars}>
            {slides.map((item, i) => (
              <View key={item.key} style={[styles.track, { backgroundColor: wrappedGlass.track }]}>
                {i < index ? <View style={[styles.fill, { backgroundColor: slide.theme.fg }]} /> : null}
                {i === index ? <Animated.View style={[styles.fill, { backgroundColor: slide.theme.fg }, activeBar]} /> : null}
              </View>
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close Wrapped"
            hitSlop={10}
            onPress={() => router.navigate('/')}
            style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
            <Icon name="close" size={20} color={slide.theme.fg} />
          </Pressable>
        </View>

        <View key={slide.key} pointerEvents="box-none" style={styles.content}>
          {slide.render(data)}
        </View>

        {last ? (
          <View style={styles.actions}>
            <Button label="Share your Wrapped" icon="share" size="lg" fullWidth />
            <Button label="Watch again" variant="ghost" onPress={() => setIndex(0)} />
          </View>
        ) : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  column: { flex: 1, width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center', paddingHorizontal: layout.gutter },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bars: { flex: 1, flexDirection: 'row', gap: spacing.xs },
  track: { flex: 1, height: 3, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
  close: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: wrappedGlass.fill,
  },
  pressed: { opacity: 0.6 },
  content: { flex: 1, justifyContent: 'center' },
  actions: { gap: spacing.sm },
  zoneBack: { position: 'absolute', top: 0, bottom: 0, left: 0, width: '33%' },
  zoneNext: { position: 'absolute', top: 0, bottom: 0, right: 0, width: '67%' },
  blob: { position: 'absolute', borderRadius: 999 },
  blobA: { width: 340, height: 340, top: -110, right: -130, opacity: 0.35 },
  blobB: { width: 420, height: 420, bottom: -190, left: -170, backgroundColor: wrappedGlass.fill },
});
