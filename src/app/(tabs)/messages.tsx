import { router, useLocalSearchParams } from 'expo-router';
import { Fragment, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { SharedPostBubble } from '@/components/shared-post-bubble';
import { Avatar, Button, Divider, HeaderBlock, Icon, IconButton, Screen, ScreenHeader, SearchField, Section, Sheet, Text } from '@/components/ui';
import { colors, layout, radius, spacing, typography } from '@/constants/theme';
import type { Message } from '@/data/mock-data';
import { useStore } from '@/data/store';
import { postSentence } from '@/data/update-kinds';

const firstName = (name: string) => name.split(' ')[0];

export default function MessagesScreen() {
  const { user } = useLocalSearchParams<{ user?: string }>();
  const { conversations, getUser, markRead } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [picking, setPicking] = useState(false);

  // Deep link (`/messages?user=maya`) opens that thread, even before any message exists. When the param changes
  // while the tab is mounted, follow it (state adjusted during render, so no extra effect pass).
  const [seenUser, setSeenUser] = useState(user);
  if (user !== seenUser) {
    setSeenUser(user);
    setOpenId(user ?? null);
  }

  const activeId = openId ?? user ?? null;

  useEffect(() => {
    if (activeId) markRead(activeId);
    // markRead is recreated on every store render; only the opened thread matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const openThread = (id: string) => {
    setPicking(false);
    setOpenId(id);
  };

  if (activeId) {
    return (
      <Thread
        userId={activeId}
        onBack={() => {
          setOpenId(null);
          router.setParams({ user: undefined });
        }}
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
      </HeaderBlock>
      <Section>
        <View style={styles.searchRow}>
          <View style={styles.flex}>
            <SearchField value={query} onChangeText={setQuery} placeholder="Search chats" />
          </View>
          <IconButton icon="compose" label="New chat" tone="muted" onPress={() => setPicking(true)} />
        </View>
      </Section>
      <View style={styles.list}>
        {visible.map((conversation, index) => {
          const other = getUser(conversation.userId);
          const last = conversation.messages[conversation.messages.length - 1];
          const unreadCount = conversation.unread ?? 0;
          const body = last.updateId ? 'Shared a post' : last.body;
          return (
            <Fragment key={conversation.userId}>
              {index > 0 ? <Divider /> : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Chat with ${other.name}`}
                onPress={() => openThread(conversation.userId)}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                <Avatar user={other} size={48} />
                <View style={styles.rowText}>
                  <View style={styles.rowTop}>
                    <Text variant="headline" numberOfLines={1} style={styles.flex}>
                      {other.name}
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
                      {last.fromMe ? `You: ${body}` : body}
                    </Text>
                    {unreadCount ? (
                      <View style={styles.unread}>
                        <Text variant="caption" color={colors.onPrimary} style={styles.bold}>
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
            {conversations.length ? `No chats match “${query}”.` : 'No chats yet. Start one from a friend’s profile.'}
          </Text>
        )}
      </View>

      <NewChatSheet visible={picking} onClose={() => setPicking(false)} onPick={openThread} />
    </Screen>
  );
}

type NewChatSheetProps = { visible: boolean; onClose: () => void; onPick: (userId: string) => void };

// Bottom sheet listing friends; picking one opens (or starts) their thread.
function NewChatSheet({ visible, onClose, onPick }: NewChatSheetProps) {
  const { friendIds, getUser } = useStore();
  const [query, setQuery] = useState('');
  const friends = friendIds
    .map(getUser)
    .filter((friend) => friend.name.toLowerCase().includes(query.trim().toLowerCase()));

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={close} title="New chat">
      {friendIds.length ? (
        <View style={styles.sheetBody}>
          <SearchField value={query} onChangeText={setQuery} placeholder="Search friends" autoFocus />
          <View>
            {friends.map((friend, index) => (
              <Fragment key={friend.id}>
                {index > 0 ? <Divider /> : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Chat with ${friend.name}`}
                  onPress={() => {
                    setQuery('');
                    onPick(friend.id);
                  }}
                  style={({ pressed }) => [styles.friendRow, pressed && styles.pressed]}>
                  <Avatar user={friend} size={40} />
                  <View style={styles.flex}>
                    <Text variant="headline" numberOfLines={1}>
                      {friend.name}
                    </Text>
                    <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
                      {friend.school}
                    </Text>
                  </View>
                </Pressable>
              </Fragment>
            ))}
            {friends.length ? null : (
              <Text variant="body" color={colors.textMuted} align="center" style={styles.empty}>
                No friends match “{query}”.
              </Text>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.sheetEmpty}>
          <Text variant="body" color={colors.textMuted} align="center">
            Add some friends first, then start a chat here.
          </Text>
          <Button
            label="Find friends"
            variant="secondary"
            onPress={() => {
              close();
              router.navigate('/friends');
            }}
          />
        </View>
      )}
    </Sheet>
  );
}

type ThreadProps = { userId: string; onBack: () => void };

function Thread({ userId, onBack }: ThreadProps) {
  const { getUser, conversationWith, sendMessage } = useStore();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const other = getUser(userId);
  const messages = conversationWith(userId)?.messages ?? [];

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    sendMessage(userId, body);
    setDraft('');
  };
  const openProfile = () => router.navigate({ pathname: '/user/[id]', params: { id: userId } });

  return (
    <Screen flush scroll={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.threadBar}>
          <IconButton icon="back" label="Back to chats" tone="muted" onPress={onBack} />
          {/* Avatar and name together open the other person's profile. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${other.name}'s profile`}
            onPress={openProfile}
            style={({ pressed }) => [styles.threadPerson, pressed && styles.pressed]}>
            <Avatar user={other} size={36} />
            <View style={styles.flex}>
              <Text variant="headline" numberOfLines={1}>
                {other.name}
              </Text>
              <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
                {other.school}
              </Text>
            </View>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
          {messages.length ? null : (
            <Text variant="body" color={colors.textMuted} align="center" style={styles.empty}>
              Say hi to {firstName(other.name)}
            </Text>
          )}
          {messages.map((message, index) => {
            const next = messages[index + 1];
            const endOfRun = !next || next.fromMe !== message.fromMe;
            return (
              <View key={message.id} style={[styles.group, message.fromMe ? styles.groupOutgoing : styles.groupIncoming]}>
                <Bubble message={message} />
                {endOfRun ? (
                  <Text variant="caption" color={colors.textFaint}>
                    {message.time}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={send}
            submitBehavior="submit"
            returnKeyType="send"
            placeholder={`Message ${firstName(other.name)}`}
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

// One message: plain text, or a shared-post preview (with the body under it only when it adds something).
function Bubble({ message }: { message: Message }) {
  const { updates, getUser } = useStore();
  const color = message.fromMe ? colors.onPrimary : colors.text;

  if (!message.updateId) {
    return (
      <View style={[styles.bubble, message.fromMe ? styles.outgoing : styles.incoming]}>
        <Text variant="body" color={color}>
          {message.body}
        </Text>
      </View>
    );
  }

  const update = updates.find((item) => item.id === message.updateId);
  const sentence = update
    ? postSentence(update)
        .map((segment) => segment.text)
        .join('')
    : '';
  const body = message.body.trim();
  const showBody = body.length > 0 && body !== sentence;

  return (
    <View style={[styles.bubble, styles.bubbleShared, message.fromMe ? styles.outgoing : styles.incoming]}>
      <SharedPostBubble update={update} author={update ? getUser(update.userId) : undefined} fromMe={message.fromMe} />
      {showBody ? (
        <Text variant="body" color={color}>
          {message.body}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bold: { fontWeight: '700' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  // Full-width white list like the feed; rows are separated by hairline dividers, not a card.
  list: { backgroundColor: colors.surface, paddingVertical: spacing.xs },
  empty: { paddingVertical: spacing.xxl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: layout.gutter },
  rowText: { flex: 1, gap: spacing.xxs + 1 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  unread: {
    minWidth: spacing.xl,
    height: spacing.xl,
    paddingHorizontal: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  sheetBody: { gap: spacing.md, paddingBottom: spacing.lg },
  sheetEmpty: { gap: spacing.lg, alignItems: 'center', paddingVertical: spacing.xl },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  threadBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: layout.gutter,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  threadPerson: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  messages: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: layout.gutter,
  },
  group: { maxWidth: '80%', gap: spacing.xs },
  groupIncoming: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  groupOutgoing: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubble: { paddingHorizontal: spacing.md + 2, paddingVertical: spacing.sm + 2, borderRadius: radius.lg },
  bubbleShared: { gap: spacing.sm, padding: spacing.sm },
  incoming: { backgroundColor: colors.surface, borderBottomLeftRadius: spacing.xs },
  outgoing: { backgroundColor: colors.primary, borderBottomRightRadius: spacing.xs },
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
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },
});
