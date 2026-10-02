import Constants from 'expo-constants';
import type { PropsWithChildren, ReactNode } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { initialWindowMetrics, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, spacing } from '@/constants/theme';
import { Text } from './text';

type ScreenProps = PropsWithChildren<
  {
    scroll?: boolean;
    /** Feed-style: no side gutter, children are full-width `Section`s separated by thin gaps. */
    flush?: boolean;
    /** Rendered above the scrolling content, pinned to the top (use `TopBar`). */
    header?: ReactNode;
  } & Pick<ScrollViewProps, 'keyboardShouldPersistTaps'>
>;

// Top inset that is never 0 on a phone: the largest of the live inset, the window's initial metrics (the
// first frame can render before the provider measures), the status bar height expo-constants reports
// (59pt on Dynamic Island phones) and a platform floor, so a header never sits under the status bar or
// the Dynamic Island.
export function useTopInset() {
  const insets = useSafeAreaInsets();
  const floor = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : Platform.OS === 'ios' ? 20 : 0;
  return Math.max(insets.top, initialWindowMetrics?.insets.top ?? 0, Constants.statusBarHeight ?? 0, floor);
}

export function Screen({ children, scroll = true, flush, header, keyboardShouldPersistTaps }: ScreenProps) {
  const topInset = useTopInset();
  // The header handles the safe area; gutter screens still need breathing room below it.
  const top = header ? (flush ? 0 : spacing.lg) : Math.max(topInset, spacing.lg);
  const column = [styles.column, flush ? styles.flush : styles.gutter];

  if (!scroll) {
    return (
      <View style={styles.screen}>
        {header}
        <View style={[styles.screen, { paddingTop: top }]}>
          <View style={column}>{children}</View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {header}
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingTop: top }]}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}>
        <View style={column}>{children}</View>
      </ScrollView>
    </View>
  );
}

// Fixed white bar at the top of a flush screen, like the feed header: a slot on each side and a title in the middle.
export function TopBar({ title, left, right }: { title: ReactNode; left?: ReactNode; right?: ReactNode }) {
  const topInset = useTopInset();
  return (
    <View style={[styles.topBar, { paddingTop: topInset + spacing.md }]}>
      <View style={[styles.column, styles.topRow]}>
        <View style={styles.topSide}>{left}</View>
        {typeof title === 'string' ? <Text variant="headline">{title}</Text> : title}
        <View style={[styles.topSide, styles.topSideRight]}>{right}</View>
      </View>
    </View>
  );
}

// Big page title with optional side slots (back/close on the left, an action on the right). Title only, no subheading.
export function ScreenHeader({ title, left, right }: { title: string; left?: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.header}>
      {left ? <View style={styles.headerSide}>{left}</View> : null}
      <Text variant="display" style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      {right ? <View style={styles.headerSide}>{right}</View> : null}
    </View>
  );
}

// Gutter-padded wrapper so a `ScreenHeader` can sit above the sections of a flush screen.
export function HeaderBlock({ children }: PropsWithChildren) {
  return <View style={styles.headerBlock}>{children}</View>;
}

// Full-width white block inside a flush screen; the gray background shows through the gaps between sections.
export function Section({ title, children }: PropsWithChildren<{ title?: string }>) {
  return (
    <View style={styles.sectionBlock}>
      {title ? <Text variant="headline">{title}</Text> : null}
      {children}
    </View>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="headline">{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  column: { flex: 1, width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center' },
  gutter: { paddingHorizontal: layout.gutter },
  flush: { gap: spacing.sm },
  topBar: {
    backgroundColor: colors.surface,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  topSide: { flexDirection: 'row', gap: spacing.sm, flex: 1 },
  topSideRight: { justifyContent: 'flex-end' },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  headerTitle: { flex: 1 },
  headerSide: { flexDirection: 'row', gap: spacing.sm },
  headerBlock: { paddingHorizontal: layout.gutter },
  sectionBlock: {
    backgroundColor: colors.surface,
    paddingHorizontal: layout.gutter,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
});
