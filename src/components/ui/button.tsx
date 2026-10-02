import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { colors, radius, shadow, spacing } from '@/constants/theme';
import { Icon, type IconName } from './icon';
import { Text } from './text';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantColors: Record<ButtonVariant, { bg: string; fg: string }> = {
  primary: { bg: colors.primary, fg: colors.onPrimary },
  secondary: { bg: colors.primarySoft, fg: colors.primary },
  outline: { bg: 'transparent', fg: colors.text },
  ghost: { bg: 'transparent', fg: colors.textMuted },
};

const sizes: Record<ButtonSize, { height: number; paddingHorizontal: number; icon: number }> = {
  sm: { height: 34, paddingHorizontal: spacing.md, icon: 15 },
  md: { height: 44, paddingHorizontal: spacing.lg, icon: 18 },
  lg: { height: 54, paddingHorizontal: spacing.xl, icon: 20 },
};

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  icon?: IconName;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export function Button({ label, icon, variant = 'primary', size = 'md', fullWidth, disabled, ...props }: ButtonProps) {
  const { bg, fg } = variantColors[variant];
  const dims = sizes[size];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      {...props}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, height: dims.height, paddingHorizontal: dims.paddingHorizontal },
        variant === 'outline' && styles.outline,
        fullWidth && styles.fullWidth,
        variant === 'primary' && size === 'lg' && !disabled && shadow.raised,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      {icon ? <Icon name={icon} size={dims.icon} color={fg} /> : null}
      <Text variant={size === 'sm' ? 'callout' : 'headline'} color={fg} style={size === 'sm' && styles.smLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

type IconButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  icon: IconName;
  label: string;
  badge?: boolean;
  tone?: 'surface' | 'muted' | 'plain';
};

export function IconButton({ icon, label, badge, tone = 'surface', ...props }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      {...props}
      style={({ pressed }) => [
        styles.iconButton,
        tone === 'surface' && styles.iconSurface,
        tone === 'muted' && styles.iconMuted,
        pressed && styles.pressed,
      ]}>
      <Icon name={icon} size={20} />
      {badge ? <View style={styles.badge} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.pill,
  },
  outline: { borderWidth: 1.5, borderColor: colors.border },
  fullWidth: { alignSelf: 'stretch' },
  smLabel: { fontWeight: '600' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.4 },
  iconButton: { width: 42, height: 42, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  iconMuted: { backgroundColor: colors.background },
  iconSurface: { backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  badge: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.rose,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
});
