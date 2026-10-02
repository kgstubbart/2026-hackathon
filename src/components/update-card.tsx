import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, CompanyMark, Icon, Text, type IconName } from '@/components/ui';
import { colors, layout, radius, spacing, tones } from '@/constants/theme';
import type { Update, User } from '@/data/mock-data';
import { headlineFor, isCelebration, timeAgo, updateKinds } from '@/data/update-kinds';

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
  onCongrats?: () => void;
  preview?: boolean;
};

// Full-width feed post: LinkedIn-style author header and attachment, Threads-style action row.
export function UpdateCard({ update, author, onCongrats, preview }: UpdateCardProps) {
  const tone = tones[updateKinds[update.kind].tone];
  const celebrate = isCelebration(update.kind);

  return (
    <View style={styles.post}>
      <View style={styles.header}>
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
        <Icon name="more" size={18} color={colors.textFaint} />
      </View>

      <View style={styles.content}>
        <Text variant="headline">{headlineFor(update)}</Text>
        {update.interviewType ? (
          <Text variant="callout" color={colors.textMuted}>
            {update.interviewType}
          </Text>
        ) : null}
        {update.note ? <Text variant="body">{update.note}</Text> : null}
      </View>

      {update.questions?.length ? (
        <View style={styles.questions}>
          {update.questions.map((question, index) => (
            <View key={index} style={styles.question}>
              <Text variant="body" style={styles.questionText}>
                {question.text || `${question.difficulty} question`}
              </Text>
              {question.text && question.difficulty ? (
                <Text variant="caption" color={colors.textMuted}>
                  {question.difficulty}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      <View style={[styles.attachment, celebrate && { backgroundColor: tone.bg, borderColor: tone.bg }]}>
        <CompanyMark company={update.company || '?'} size={40} />
        <View style={styles.attachmentText}>
          <Text variant="callout" style={styles.role} numberOfLines={1}>
            {update.role || 'Internship role'}
          </Text>
          <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
            {[update.company, update.term, update.location].filter(Boolean).join(' · ')}
          </Text>
        </View>
        <KindBadge kind={update.kind} />
      </View>

      {preview ? null : (
        <View style={styles.actions}>
          <Action
            icon="party"
            count={update.congrats}
            active={update.congratulated}
            label={update.congratulated ? 'Remove congrats' : 'Send congrats'}
            onPress={onCongrats}
          />
          <Action icon="comment" count={update.comments} label="Comment" />
          <Action icon="send" label="Send" />
        </View>
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
  author: { flex: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  content: { gap: spacing.xs },
  questions: { gap: spacing.xs },
  question: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  questionText: { flexShrink: 1 },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  attachmentText: { flex: 1, gap: 1 },
  role: { fontWeight: '700' },
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
