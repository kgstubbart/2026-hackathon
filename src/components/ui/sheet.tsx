import type { PropsWithChildren, ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, radius, shadow, spacing } from '@/constants/theme';
import { IconButton } from './button';
import { Text } from './text';

type SheetProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  title?: string;
  /** Optional control on the right of the title, in place of the close button. */
  right?: ReactNode;
}>;

// Bottom sheet: scrim, white panel with rounded top corners and a grab handle. Tapping the scrim closes it.
export function Sheet({ visible, onClose, title, right, children }: SheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close" style={styles.backdrop} onPress={onClose}>
        {/* Inner Pressable swallows taps so they don't close the sheet. */}
        <Pressable style={[styles.panel, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <View style={styles.handle} />
          {title ? (
            <View style={styles.header}>
              <Text variant="title" style={styles.title}>
                {title}
              </Text>
              {right ?? <IconButton icon="close" label="Close" tone="muted" onPress={onClose} />}
            </View>
          ) : null}
          <ScrollView bounces={false} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.scrim },
  panel: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    maxHeight: '80%',
    paddingTop: spacing.sm,
    paddingHorizontal: layout.gutter,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: radius.pill, backgroundColor: colors.border, marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingBottom: spacing.md },
  title: { flex: 1 },
});
