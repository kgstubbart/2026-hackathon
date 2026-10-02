import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';
import { FieldLabel } from './field';
import { Icon } from './icon';
import { Text } from './text';

const MAX_OPTIONS = 6;
// Long enough for a tap on an option to land before the list closes on blur (web blurs first).
const CLOSE_DELAY = 150;

type ComboFieldProps = Omit<TextInputProps, 'value' | 'onChangeText'> & {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  options: readonly string[];
};

// Dropdown you can also type into: pick a matching option, or keep whatever you typed.
export function ComboField({ label, value, onChangeText, options, onFocus, onBlur, ...props }: ComboFieldProps) {
  const [open, setOpen] = useState(false);
  const input = useRef<TextInput>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => clearTimeout(closeTimer.current ?? undefined), []);

  const query = value.trim().toLowerCase();
  const picked = options.some((option) => option.toLowerCase() === query);
  // After picking, show the whole list again so the choice is easy to change.
  const matches = (picked ? options : options.filter((option) => option.toLowerCase().includes(query))).slice(
    0,
    MAX_OPTIONS,
  );

  const choose = (option: string) => {
    clearTimeout(closeTimer.current ?? undefined);
    onChangeText(option);
    setOpen(false);
    input.current?.blur();
  };

  return (
    <View style={styles.field}>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <View style={[styles.box, open && styles.boxOpen]}>
        <TextInput
          ref={input}
          placeholderTextColor={colors.textFaint}
          autoCorrect={false}
          {...props}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            setOpen(true);
          }}
          onFocus={(event) => {
            clearTimeout(closeTimer.current ?? undefined);
            setOpen(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
            onBlur?.(event);
          }}
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Show ${label ?? 'options'}`}
          hitSlop={10}
          onPress={() => input.current?.focus()}>
          <Icon name="chevronDown" size={16} color={colors.textFaint} />
        </Pressable>
      </View>
      {open && matches.length ? (
        <View style={styles.menu}>
          {matches.map((option, index) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: option.toLowerCase() === query }}
              onPress={() => choose(option)}
              style={({ pressed }) => [styles.option, index > 0 && styles.optionDivider, pressed && styles.pressed]}>
              <Text variant="body" style={styles.optionText} numberOfLines={1}>
                {option}
              </Text>
              {option.toLowerCase() === query ? <Icon name="check" size={14} color={colors.primary} /> : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  boxOpen: { borderWidth: 1.5, borderColor: colors.text },
  input: { ...typography.body, flex: 1, color: colors.text, minHeight: 48 },
  menu: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  optionDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  optionText: { flex: 1 },
  pressed: { opacity: 0.6 },
});
