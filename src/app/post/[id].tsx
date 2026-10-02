import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Avatar, Button, Icon, IconButton, Screen, Section, Text, TopBar } from '@/components/ui';
import { UpdateCard } from '@/components/update-card';
import { colors, layout, radius, spacing, typography } from '@/constants/theme';
import { useStore } from '@/data/store';
import { timeAgo } from '@/data/update-kinds';

const back = () => (router.canGoBack() ? router.back() : router.navigate('/'));

function PostBar() {
  return <TopBar title="Post" left={<IconButton icon="back" label="Back" tone="muted" onPress={back} />} />;
}

// A single post: the full update with its details, then the comment thread and a composer.
export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updates, currentUser, getUser, commentsFor, addComment, addUpdate, toggleCongrats } = useStore();
  const [draft, setDraft] = useState('');
  const update = updates.find((item) => item.id === id);

  if (!update) {
    return (
      <Screen header={<PostBar />}>
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
  const openProfile = (userId: string) =>
    userId === currentUser.id ? router.navigate('/profile') : router.navigate({ pathname: '/user/[id]', params: { id: userId } });

  // Your own offer can be turned into an accepted post from here.
  const ownOffer = update.kind === 'offer' && update.userId === currentUser.id;
  const accepted = updates.some(
    (item) =>
      item.kind === 'accepted' &&
      item.userId === currentUser.id &&
      item.company === update.company &&
      item.role === update.role,
  );
  const acceptOffer = () => {
    addUpdate({ kind: 'accepted', company: update.company, role: update.role });
    router.navigate('/');
  };

  return (
    <Screen flush scroll={false} header={<PostBar />}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.stack} showsVerticalScrollIndicator={false}>
          <UpdateCard
            detail
            update={update}
            author={getUser(update.userId)}
            commentCount={comments.length}
            onCongrats={() => toggleCongrats(update.id)}
            onDeleted={back}
          />
          {ownOffer ? (
            <Section title="Did you accept?">
              {accepted ? (
                <Text variant="caption" color={colors.textMuted}>
                  You accepted this offer.
                </Text>
              ) : (
                <>
                  <Text variant="body" color={colors.textMuted}>
                    Accepting posts to your feed so friends can celebrate.
                  </Text>
                  <Button label="I accepted this offer" icon="briefcase" size="lg" fullWidth onPress={acceptOffer} />
                </>
              )}
            </Section>
          ) : null}
          <Section title={comments.length ? `Comments · ${comments.length}` : 'Comments'}>
            {comments.length ? (
              comments.map((comment) => {
                const user = getUser(comment.userId);
                return (
                  <View key={comment.id} style={styles.comment}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="View profile"
                      hitSlop={6}
                      onPress={() => openProfile(user.id)}
                      style={({ pressed }) => pressed && styles.pressed}>
                      <Avatar user={user} size={32} />
                    </Pressable>
                    <View style={styles.flex}>
                      <View style={styles.commentTop}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="View profile"
                          hitSlop={6}
                          onPress={() => openProfile(user.id)}
                          style={({ pressed }) => pressed && styles.pressed}>
                          <Text variant="callout" style={styles.commentName}>
                            {user.name}
                          </Text>
                        </Pressable>
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
  pressed: { opacity: 0.6 },
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
