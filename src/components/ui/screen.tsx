import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, spacing } from '@/constants/theme';
import { Text } from './text';

type ScreenProps = PropsWithChildren<{ scroll?: boolean } & Pick<ScrollViewProps, 'keyboardShouldPersistTaps'>>;

export function Screen({ children, scroll = true, keyboardShouldPersistTaps }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const top = Math.max(insets.top, spacing.lg);

  if (!scroll) {
    return (
      <View style={[styles.screen, { paddingTop: top }]}>
        <View style={styles.column}>{children}</View>
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
      <View style={styles.column}>{children}</View>
    </ScrollView>
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
  column: { flex: 1, width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center', paddingHorizontal: layout.gutter },
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
