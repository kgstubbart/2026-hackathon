import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { Text } from './text';

type Option<T extends string> = { label: string; value: T };

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View accessibilityRole="tablist" style={styles.container}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [styles.tab, selected && styles.selected, pressed && styles.pressed]}>
            <Text variant="callout" color={selected ? colors.primary : colors.textMuted} style={selected && styles.selectedText}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', padding: spacing.xxs, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
  tab: { flex: 1, minHeight: spacing.xxxl + spacing.xxs, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  selected: { backgroundColor: colors.surface },
  selectedText: { fontWeight: '700' },
  pressed: { opacity: 0.7 },
});
