import { Fragment, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Avatar, Card, Divider, Icon, IconButton, Screen, ScreenHeader, SearchField, Text } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { conversations, type Conversation, type Message } from '@/data/mock-data';
import { useStore } from '@/data/store';

export default function MessagesScreen() {
  const { getUser } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sent, setSent] = useState<Record<string, Message[]>>({});
  const [readIds, setReadIds] = useState<string[]>([]);
  const unreadFor = (conversation: Conversation) => (readIds.includes(conversation.userId) ? 0 : (conversation.unread ?? 0));

  const open = conversations.find((conversation) => conversation.userId === openId);
  if (open) {
    return (
      <Thread
        conversation={open}
        extra={sent[open.userId] ?? []}
        onBack={() => setOpenId(null)}
        onSend={(body) =>
          setSent((all) => ({
            ...all,
            [open.userId]: [...(all[open.userId] ?? []), { id: `${Date.now()}`, fromMe: true, body, time: 'Now' }],
          }))
        }
      />
    );
  }

  const unread = conversations.reduce((sum, conversation) => sum + unreadFor(conversation), 0);
  const visible = conversations.filter((conversation) =>
    getUser(conversation.userId).name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Screen keyboardShouldPersistTaps="handled" header={<AppHeader />}>
      <ScreenHeader eyebrow={unread ? `${unread} unread` : 'All caught up'} title="Chats" />
      <SearchField value={query} onChangeText={setQuery} placeholder="Search chats" />
      <Card flush style={styles.list}>
        {visible.map((conversation, index) => {
          const user = getUser(conversation.userId);
          const all = [...conversation.messages, ...(sent[conversation.userId] ?? [])];
          const last = all[all.length - 1];
          const unreadCount = unreadFor(conversation);
          return (
            <Fragment key={conversation.userId}>
              {index > 0 ? <Divider /> : null}
              <Pressable
                onPress={() => {
                  setOpenId(conversation.userId);
                  setReadIds((ids) => [...ids, conversation.userId]);
                }}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                <Avatar user={user} size={48} />
                <View style={styles.rowText}>
                  <View style={styles.rowTop}>
                    <Text variant="headline" numberOfLines={1} style={styles.flex}>
                      {user.name}
                    </Text>
                    <Text variant="caption" color={unreadCount ? colors.primary : colors.textFaint}>
                      {last.time}
                    </Text>
                  </View>
                  <View style={styles.rowTop}>
                    <Text
                      variant="callout"
                      numberOfLines={1}
                      color={unreadCount ? colors.text : colors.textMuted}
                      style={styles.flex}>
                      {last.fromMe ? `You: ${last.body}` : last.body}
                    </Text>
                    {unreadCount ? (
                      <View style={styles.unread}>
                        <Text variant="caption" color={colors.onPrimary} style={styles.unreadText}>
                          {unreadCount}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            </Fragment>
          );
        })}
      </Card>
    </Screen>
  );
}

type ThreadProps = {
  conversation: Conversation;
  extra: Message[];
  onBack: () => void;
  onSend: (body: string) => void;
};

function Thread({ conversation, extra, onBack, onSend }: ThreadProps) {
  const { getUser } = useStore();
  const [draft, setDraft] = useState('');
  const user = getUser(conversation.userId);
  const send = () => {
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft('');
  };

  return (
    <Screen scroll={false} header={<AppHeader />}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.threadHeader}>
          <IconButton icon="back" label="Back" onPress={onBack} />
          <Avatar user={user} size={40} />
          <View style={styles.flex}>
            <Text variant="headline">{user.name}</Text>
            <Text variant="caption" color={colors.textMuted}>
              {user.school}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.flex} contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false}>
          {[...conversation.messages, ...extra].map((message) => (
            <View key={message.id} style={[styles.bubble, message.fromMe ? styles.outgoing : styles.incoming]}>
              <Text variant="body" color={message.fromMe ? colors.onPrimary : colors.text}>
                {message.body}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={send}
            placeholder={`Message ${user.name.split(' ')[0]}`}
            placeholderTextColor={colors.textFaint}
            style={styles.input}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send"
            onPress={send}
            disabled={!draft.trim()}
            style={[styles.send, !draft.trim() && styles.sendDisabled]}>
            <Icon name="arrowUp" size={18} color={colors.onPrimary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { marginTop: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  rowText: { flex: 1, gap: 3 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  unread: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: { fontWeight: '700' },
  pressed: { opacity: 0.6 },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  messages: { flexGrow: 1, justifyContent: 'flex-end', gap: spacing.sm, paddingVertical: spacing.lg },
  bubble: { maxWidth: '80%', paddingHorizontal: spacing.md + 2, paddingVertical: spacing.sm + 2, borderRadius: radius.lg },
  incoming: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderBottomLeftRadius: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  outgoing: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: spacing.xs },
  composer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  input: {
    ...typography.body,
    flex: 1,
    height: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    color: colors.text,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },
});
