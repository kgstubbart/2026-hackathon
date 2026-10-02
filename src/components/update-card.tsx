import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PostMenu } from '@/components/post-menu';
import { SendSheet } from '@/components/send-sheet';
import { Avatar, Icon, Text, type IconName } from '@/components/ui';
import { colors, layout, radius, spacing, tones } from '@/constants/theme';
import type { Update, User } from '@/data/mock-data';
import { useStore } from '@/data/store';
import { postSentence, timeAgo, updateKinds } from '@/data/update-kinds';

export function KindBadge({ kind }: { kind: Update['kind'] }) {
  const meta = updateKinds[kind];
  const tone = tones[meta.tone];
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Icon name={meta.icon} size={12} color={tone.fg} />
      <Text variant="caption" color={tone.fg} style={styles.badgeText}>
        {meta.label}
      </Text>
    </View>
  );
}

type UpdateCardProps = {
  update: Update;
  author: User;
  commentCount?: number;
  onCongrats?: () => void;
  preview?: boolean;
  /** On the post's own page: don't link to itself (the page shows details and questions in their own section). */
  detail?: boolean;
  /** Called after the post was deleted from its menu (e.g. to leave the post page). */
  onDeleted?: () => void;
};

// Full-width feed post: LinkedIn-style author header, one-sentence post with optional comment, Threads-style action row.
// In the feed it only shows the sentence; tapping it opens the post page with details and comments.
export function UpdateCard({ update, author, commentCount, onCongrats, preview, detail, onDeleted }: UpdateCardProps) {
  const { currentUser } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const sentence = postSentence(update);
  const open = () => router.navigate({ pathname: '/post/[id]', params: { id: update.id } });
  const canOpen = !preview && !detail;
  const openProfile = () =>
    author.id === currentUser.id
      ? router.navigate('/profile')
      : router.navigate({ pathname: '/user/[id]', params: { id: author.id } });

  return (
    <View style={styles.post}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View profile"
          disabled={preview}
          onPress={openProfile}
          style={({ pressed }) => [styles.authorPress, pressed && styles.pressed]}>
          <Avatar user={author} size={44} />
          <View style={styles.author}>
            <Text variant="headline" numberOfLines={1}>
              {author.name}
            </Text>
            <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
              {author.major} · {author.school}
            </Text>
            <View style={styles.meta}>
              <Text variant="caption" color={colors.textFaint}>
                {preview ? 'Now' : timeAgo(update.createdAt)} ·
              </Text>
              <Icon name={update.visibility === 'private' ? 'lock' : 'friends'} size={11} color={colors.textFaint} />
            </View>
          </View>
        </Pressable>
        {preview ? (
          <Icon name="more" size={18} color={colors.textFaint} />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="More options"
            hitSlop={12}
            onPress={() => setMenuOpen(true)}
            style={({ pressed }) => [styles.more, pressed && styles.pressed]}>
            <Icon name="more" size={18} color={colors.textFaint} />
          </Pressable>
        )}
      </View>

      <Pressable
        accessibilityRole={canOpen ? 'button' : undefined}
        accessibilityLabel={canOpen ? 'Open post' : undefined}
        disabled={!canOpen}
        onPress={open}
        style={({ pressed }) => [styles.content, pressed && styles.pressed]}>
        <Text variant="headline" style={styles.sentence}>
          {sentence.map((segment, index) => (
            <Text key={index} variant="headline" style={segment.bold ? styles.keyword : styles.sentence}>
              {segment.text}
            </Text>
          ))}
        </Text>
        {update.note ? (
          <Text variant="body" color={colors.textMuted}>
            {update.note}
          </Text>
        ) : null}
      </Pressable>

      {preview ? null : (
        <>
          <View style={styles.actions}>
            <Action
              icon="party"
              count={update.congrats}
              active={update.congratulated}
              label={update.congratulated ? 'Remove congrats' : 'Send congrats'}
              onPress={onCongrats}
            />
            <Action icon="comment" count={commentCount} label="Comment" onPress={detail ? undefined : open} />
            <Action icon="send" label="Send" onPress={() => setSendOpen(true)} />
          </View>
          <PostMenu
            visible={menuOpen}
            onClose={() => setMenuOpen(false)}
            update={update}
            author={author}
            onSend={() => setSendOpen(true)}
            onDeleted={onDeleted}
          />
          <SendSheet visible={sendOpen} onClose={() => setSendOpen(false)} update={update} />
        </>
      )}
    </View>
  );
}

type ActionProps = { icon: IconName; label: string; count?: number; active?: boolean; onPress?: () => void };

function Action({ icon, label, count, active, onPress }: ActionProps) {
  const color = active ? colors.primary : colors.textMuted;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
      <Icon name={icon} size={19} color={color} />
      {count ? (
        <Text variant="callout" color={color}>
          {count}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  post: {
    backgroundColor: colors.surface,
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  authorPress: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  author: { flex: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  more: { minWidth: 32, minHeight: 32, alignItems: 'center', justifyContent: 'center' },
  content: { gap: spacing.xs },
  sentence: { fontWeight: '400' },
  keyword: { fontWeight: '700' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  badgeText: { fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxl, paddingTop: spacing.xs },
  action: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2, minHeight: 32 },
  pressed: { opacity: 0.6 },
});
