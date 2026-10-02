import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { colors, layout, radius, spacing } from '@/constants/theme';
import { Icon, type IconName } from './icon';
import { Text } from './text';

type ChipProps = { label: string; selected?: boolean; icon?: IconName; onPress?: () => void };

export function Chip({ label, selected, icon, onPress }: ChipProps) {
  const fg = selected ? colors.onPrimary : colors.textMuted;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}>
      {icon ? <Icon name={icon} size={14} color={fg} /> : null}
      <Text variant="callout" color={fg}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  bleed,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  /** Let the row scroll edge-to-edge past the screen gutter. */
  bleed?: boolean;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={bleed && styles.bleed}
      contentContainerStyle={[styles.group, bleed && styles.bleedContent]}>
      {options.map((option) => (
        <Chip key={option} label={option} selected={option === value} onPress={() => onChange(option)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: 34,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  selected: { backgroundColor: colors.text, borderColor: colors.text },
  pressed: { opacity: 0.7 },
  group: { gap: spacing.sm },
  bleed: { marginHorizontal: -layout.gutter },
  bleedContent: { paddingHorizontal: layout.gutter },
});
