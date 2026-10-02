import { router, usePathname } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconButton, Text } from '@/components/ui';
import { colors, layout, radius, shadow, spacing } from '@/constants/theme';
import { pages } from '@/constants/pages';

// Header menu button that opens a dropdown listing every page in the app.
export function NavMenu() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton icon="menu" label="Menu" tone="muted" onPress={() => setOpen(true)} />
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable accessibilityLabel="Close menu" style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.column, { paddingTop: insets.top + spacing.sm + 48 }]}>
            {/* Inner Pressable swallows taps so they don't close the menu. */}
            <Pressable style={styles.panel}>
              {pages.map((page) => {
                const active = pathname === page.href;
                const color = active ? colors.primary : colors.text;
                return (
                  <Pressable
                    key={page.name}
                    accessibilityRole="link"
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      setOpen(false);
                      router.navigate(page.href);
                    }}
                    style={({ pressed }) => [styles.item, active && styles.itemActive, pressed && styles.pressed]}>
                    <Icon name={page.icon} size={20} color={color} />
                    <Text variant="headline" color={color}>
                      {page.label}
                    </Text>
                  </Pressable>
                );
              })}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.scrim },
  column: { width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center', paddingHorizontal: spacing.lg },
  panel: {
    width: 240,
    padding: spacing.sm,
    gap: spacing.xxs,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadow.card,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  itemActive: { backgroundColor: colors.primarySoft },
  pressed: { opacity: 0.6 },
});
