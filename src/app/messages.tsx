import { Fragment, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Avatar, Divider, HeaderBlock, Icon, IconButton, Screen, ScreenHeader, SearchField, Text } from '@/components/ui';
import { colors, layout, radius, spacing, typography } from '@/constants/theme';
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

  const visible = conversations.filter((conversation) =>
    getUser(conversation.userId).name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Screen flush keyboardShouldPersistTaps="handled">
      <HeaderBlock>
        <ScreenHeader title="Chats" />
        <SearchField value={query} onChangeText={setQuery} placeholder="Search chats" />
      </HeaderBlock>
      <View style={styles.list}>
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
        {visible.length ? null : (
          <Text variant="body" color={colors.textMuted} align="center" style={styles.empty}>
            No chats match “{query}”.
          </Text>
        )}
      </View>
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
    <Screen flush scroll={false}>
      <HeaderBlock>
        <ScreenHeader
          title={user.name}
          left={<IconButton icon="back" label="Back" onPress={onBack} />}
          right={<Avatar user={user} size={40} />}
        />
      </HeaderBlock>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>

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
  // Full-width white list like the feed; rows are separated by hairline dividers, not a card.
  list: { backgroundColor: colors.surface, paddingVertical: spacing.xs },
  empty: { paddingVertical: spacing.xxl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: layout.gutter },
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
  messages: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: layout.gutter,
  },
  bubble: { maxWidth: '80%', paddingHorizontal: spacing.md + 2, paddingVertical: spacing.sm + 2, borderRadius: radius.lg },
  incoming: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderBottomLeftRadius: spacing.xs },
  outgoing: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: spacing.xs },
  // White bottom bar mirroring the top bar.
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: layout.gutter,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  input: {
    ...typography.body,
    flex: 1,
    height: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
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
