import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadow, spacing } from '@/constants/theme';

export function Card({ children, style, flush }: PropsWithChildren<{ style?: StyleProp<ViewStyle>; flush?: boolean }>) {
  return <View style={[styles.card, flush && styles.flush, style]}>{children}</View>;
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadow.card,
  },
  flush: { paddingVertical: spacing.xs },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
