import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export function Screen({ children, scroll = true, flush, header, keyboardShouldPersistTaps }: ScreenProps) {
  const insets = useSafeAreaInsets();
  // The header handles the safe area; gutter screens still need breathing room below it.
  const top = header ? (flush ? 0 : spacing.lg) : Math.max(insets.top, spacing.lg);
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
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
      <View style={[styles.column, styles.topRow]}>
        <View style={styles.topSide}>{left}</View>
        {typeof title === 'string' ? <Text variant="headline">{title}</Text> : title}
        <View style={[styles.topSide, styles.topSideRight]}>{right}</View>
      </View>
    </View>
  );
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

export function ScreenHeader({ eyebrow, title, right }: { eyebrow?: string; title: string; right?: ReactNode }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        {eyebrow ? (
          <Text variant="label" color={colors.textFaint}>
            {eyebrow}
          </Text>
        ) : null}
        <Text variant="display">{title}</Text>
      </View>
      {right ? <View style={styles.headerRight}>{right}</View> : null}
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
  sectionBlock: {
    backgroundColor: colors.surface,
    paddingHorizontal: layout.gutter,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  header: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  headerText: { flex: 1, gap: spacing.xs },
  headerRight: { flexDirection: 'row', gap: spacing.sm },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
});
