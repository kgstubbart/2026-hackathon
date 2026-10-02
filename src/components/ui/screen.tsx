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
  } & Pick<ScrollViewProps, 'keyboardShouldPersistTaps'>
>;

export function Screen({ children, scroll = true, flush, keyboardShouldPersistTaps }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const top = Math.max(insets.top, spacing.lg);
  const column = [styles.column, flush ? styles.flush : styles.gutter];

  if (!scroll) {
    return (
      <View style={[styles.screen, { paddingTop: top }]}>
        <View style={column}>{children}</View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: top }]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}>
      <View style={column}>{children}</View>
    </ScrollView>
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

export function ScreenHeader({
  title,
  left,
  right,
}: {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      {left ? <View style={styles.headerLeft}>{left}</View> : null}
      <View style={styles.headerText}>
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
  headerBlock: { paddingHorizontal: layout.gutter },
  sectionBlock: {
    backgroundColor: colors.surface,
    paddingHorizontal: layout.gutter,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  header: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  headerLeft: { alignSelf: 'center' },
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
