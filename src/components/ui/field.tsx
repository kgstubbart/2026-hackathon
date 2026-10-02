import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';
import { Icon } from './icon';
import { Text } from './text';

export function FieldLabel({ children }: { children: string }) {
  return (
    <Text variant="label" color={colors.textFaint} style={styles.label}>
      {children}
    </Text>
  );
}

export function TextField({ label, multiline, style, ...props }: TextInputProps & { label?: string }) {
  return (
    <View style={styles.field}>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <TextInput
        placeholderTextColor={colors.textFaint}
        multiline={multiline}
        {...props}
        style={[styles.input, multiline && styles.multiline, style]}
      />
    </View>
  );
}

export function SearchField(props: TextInputProps) {
  return (
    <View style={styles.search}>
      <Icon name="search" size={18} color={colors.textFaint} />
      <TextInput placeholderTextColor={colors.textFaint} {...props} style={styles.searchInput} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  label: { marginLeft: spacing.xxs },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  multiline: { minHeight: 96, paddingTop: spacing.md, paddingBottom: spacing.md, textAlignVertical: 'top' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 46,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  searchInput: { ...typography.body, flex: 1, color: colors.text, height: '100%' },
});
