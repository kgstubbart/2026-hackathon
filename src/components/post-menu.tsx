import { router } from 'expo-router';
import { Fragment, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Divider, Icon, Sheet, Text, type IconName } from '@/components/ui';
import { colors, spacing, tones } from '@/constants/theme';
import type { Update, User } from '@/data/mock-data';
import { useStore } from '@/data/store';

type PostMenuProps = {
  visible: boolean;
  onClose: () => void;
  update: Update;
  author: User;
  /** Opens the "Send to" sheet; the menu closes first. */
  onSend: () => void;
  /** Called after the post has been removed from the store. */
  onDeleted?: () => void;
};

type Row = { key: string; icon: IconName; label: string; color?: string; onPress: () => void };

// The "more" menu on a post: a flat list of actions in a bottom sheet.
// Deleting asks for a second tap on the same row instead of a system dialog.
export function PostMenu({ visible, onClose, update, author, onSend, onDeleted }: PostMenuProps) {
  const { currentUser, removeUpdate } = useStore();
  const [armed, setArmed] = useState(false);
  const mine = author.id === currentUser.id;
  const danger = tones.rose.fg;

  // Closing disarms the delete row, so the next open starts fresh.
  const close = () => {
    setArmed(false);
    onClose();
  };
  const go = (action: () => void) => () => {
    close();
    action();
  };

  const rows: Row[] = [
    { key: 'send', icon: 'send', label: 'Send to a friend', onPress: go(onSend) },
    ...(mine
      ? [
          {
            key: 'delete',
            icon: 'trash' as const,
            label: armed ? 'Tap again to delete' : 'Delete post',
            color: danger,
            onPress: () => {
              if (!armed) {
                setArmed(true);
                return;
              }
              removeUpdate(update.id);
              close();
              onDeleted?.();
            },
          },
        ]
      : [
          {
            key: 'message',
            icon: 'chat' as const,
            label: `Message ${author.name.split(' ')[0]}`,
            onPress: go(() => router.navigate({ pathname: '/messages', params: { user: author.id } })),
          },
          {
            key: 'profile',
            icon: 'profile' as const,
            label: 'View profile',
            onPress: go(() => router.navigate({ pathname: '/user/[id]', params: { id: author.id } })),
          },
        ]),
  ];

  return (
    <Sheet visible={visible} onClose={close}>
      {rows.map((row, index) => (
        <Fragment key={row.key}>
          {index > 0 ? <Divider /> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={row.label}
            onPress={row.onPress}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <Icon name={row.icon} size={22} color={row.color ?? colors.text} />
            <Text variant="headline" color={row.color ?? colors.text}>
              {row.label}
            </Text>
          </Pressable>
        </Fragment>
      ))}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, minHeight: 52, paddingVertical: spacing.sm },
  pressed: { opacity: 0.6 },
});
