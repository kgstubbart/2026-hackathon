import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Avatar, HeaderBlock, Icon, IconButton, Screen, ScreenHeader, Section, Text } from '@/components/ui';
import { UpdateCard } from '@/components/update-card';
import { colors, layout, radius, spacing, typography } from '@/constants/theme';
import { useStore } from '@/data/store';
import { timeAgo } from '@/data/update-kinds';

const back = () => (router.canGoBack() ? router.back() : router.navigate('/'));

// A single post: the full update with its details, then the comment thread and a composer.
export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updates, getUser, commentsFor, addComment, toggleCongrats } = useStore();
  const [draft, setDraft] = useState('');
  const update = updates.find((item) => item.id === id);

  if (!update) {
    return (
      <Screen>
        <ScreenHeader title="Post" left={<IconButton icon="back" label="Back" onPress={back} />} />
        <Text variant="body" color={colors.textMuted} align="center" style={styles.empty}>
          This post is gone.
        </Text>
      </Screen>
    );
  }

  const comments = commentsFor(update.id);
  const send = () => {
    if (!draft.trim()) return;
    addComment(update.id, draft.trim());
    setDraft('');
  };

  return (
    <Screen flush scroll={false}>
      <HeaderBlock>
        <ScreenHeader title="Post" left={<IconButton icon="back" label="Back" onPress={back} />} />
      </HeaderBlock>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.stack} showsVerticalScrollIndicator={false}>
          <UpdateCard
            detail
            update={update}
            author={getUser(update.userId)}
            commentCount={comments.length}
            onCongrats={() => toggleCongrats(update.id)}
          />
          <Section title={comments.length ? `Comments · ${comments.length}` : 'Comments'}>
            {comments.length ? (
              comments.map((comment) => {
                const user = getUser(comment.userId);
                return (
                  <View key={comment.id} style={styles.comment}>
                    <Avatar user={user} size={32} />
                    <View style={styles.flex}>
                      <View style={styles.commentTop}>
                        <Text variant="callout" style={styles.commentName}>
                          {user.name}
                        </Text>
                        <Text variant="caption" color={colors.textFaint}>
                          {timeAgo(comment.createdAt)}
                        </Text>
                      </View>
                      <Text variant="body">{comment.body}</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text variant="body" color={colors.textMuted} align="center">
                No comments yet. Say something nice.
              </Text>
            )}
          </Section>
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={send}
            placeholder="Add a comment"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send comment"
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
  empty: { paddingVertical: spacing.xxl },
  stack: { gap: spacing.sm, paddingBottom: spacing.xxl },
  comment: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  commentTop: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  commentName: { fontWeight: '700' },
  // Same white bottom bar as the chat thread.
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
