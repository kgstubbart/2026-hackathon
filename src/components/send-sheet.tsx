import { router } from 'expo-router';
import { Fragment, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar, Button, Divider, SearchField, Sheet, Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import type { Update } from '@/data/mock-data';
import { useStore } from '@/data/store';
import { sentenceText } from '@/data/update-kinds';

type SendSheetProps = { visible: boolean; onClose: () => void; update: Update };

// "Send to" sheet: pick friends to share a post with. Each one gets the post sentence as a chat message.
export function SendSheet({ visible, onClose, update }: SendSheetProps) {
  const { friendIds, getUser, sendMessage } = useStore();
  const [query, setQuery] = useState('');
  const [sentTo, setSentTo] = useState<string[]>([]);

  // Closing clears the search and the "Sent" marks, so the next open starts fresh.
  const close = () => {
    setQuery('');
    setSentTo([]);
    onClose();
  };

  const friends = friendIds.map(getUser);
  const q = query.trim().toLowerCase();
  const shown = q ? friends.filter((user) => user.name.toLowerCase().includes(q)) : friends;

  const send = (userId: string) => {
    sendMessage(userId, sentenceText(update), update.id);
    setSentTo((ids) => [...ids, userId]);
  };

  const findFriends = () => {
    close();
    router.navigate('/friends');
  };

  return (
    <Sheet visible={visible} onClose={close} title="Send to">
      {friends.length ? (
        <View style={styles.list}>
          <SearchField value={query} onChangeText={setQuery} placeholder="Search friends" />
          {shown.length ? (
            shown.map((user, index) => {
              const sent = sentTo.includes(user.id);
              return (
                <Fragment key={user.id}>
                  {index > 0 ? <Divider /> : null}
                  <View style={styles.row}>
                    <Avatar user={user} size={40} />
                    <View style={styles.rowText}>
                      <Text variant="headline" numberOfLines={1}>
                        {user.name}
                      </Text>
                      <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
                        {user.school}
                      </Text>
                    </View>
                    {sent ? (
                      <Button label="Sent" icon="check" size="sm" variant="secondary" disabled />
                    ) : (
                      <Button label="Send" size="sm" onPress={() => send(user.id)} />
                    )}
                  </View>
                </Fragment>
              );
            })
          ) : (
            <Text variant="body" color={colors.textMuted} align="center" style={styles.empty}>
              No one matches “{query}”.
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text variant="body" color={colors.textMuted} align="center">
            Add friends to send them posts.
          </Text>
          <Button label="Find friends" icon="personAdd" variant="secondary" onPress={findFriends} />
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.xs, paddingBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  rowText: { flex: 1, gap: spacing.xxs },
  empty: { paddingVertical: spacing.xl },
  emptyState: { alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.xl },
});
