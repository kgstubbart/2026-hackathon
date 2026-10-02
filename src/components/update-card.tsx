import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Card, CompanyMark, Icon, Text } from '@/components/ui';
import { colors, radius, spacing, tones } from '@/constants/theme';
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

export function UpdateCard({ update, author, onCongrats, preview }: UpdateCardProps) {
  const celebrate = isCelebration(update.kind);
  const tone = tones[updateKinds[update.kind].tone];

  return (
    <Card style={[styles.card, celebrate && { borderColor: tone.fg + '33' }]}>
      {celebrate ? <View style={[styles.celebrateBar, { backgroundColor: tone.fg }]} /> : null}

      <View style={styles.header}>
        <Avatar user={author} size={40} />
        <View style={styles.headerText}>
          <Text variant="headline" numberOfLines={1}>
            {author.name}
          </Text>
          <Text variant="caption" color={colors.textFaint} numberOfLines={1}>
            {author.school} · {preview ? 'Now' : timeAgo(update.createdAt)}
          </Text>
        </View>
        <KindBadge kind={update.kind} />
      </View>

      <Text variant="title" style={styles.headline}>
        {headlineFor(update)}
      </Text>

      <View style={[styles.role, celebrate && { backgroundColor: tone.bg }]}>
        <CompanyMark company={update.company || '?'} size={38} />
        <View style={styles.roleText}>
          <Text variant="callout" numberOfLines={1}>
            {update.role || 'Internship role'}
          </Text>
          <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
            {[update.term, update.location].filter(Boolean).join(' · ')}
          </Text>
        </View>
      </View>

      {update.note ? (
        <Text variant="body" color={colors.textMuted} style={styles.note}>
          {update.note}
        </Text>
      ) : null}

      {preview ? null : (
        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: update.congratulated }}
            onPress={onCongrats}
            hitSlop={8}
            style={({ pressed }) => [
              styles.congrats,
              update.congratulated && { backgroundColor: colors.primarySoft },
              pressed && styles.pressed,
            ]}>
            <Icon name="party" size={16} color={update.congratulated ? colors.primary : colors.textMuted} />
            <Text variant="callout" color={update.congratulated ? colors.primary : colors.textMuted}>
              {update.congratulated ? 'Congrats sent' : 'Congrats'} · {update.congrats}
            </Text>
          </Pressable>
          <View style={styles.comments}>
            <Icon name="comment" size={16} color={colors.textFaint} />
            <Text variant="callout" color={colors.textFaint}>
              {update.comments}
            </Text>
          </View>
          {update.visibility === 'private' ? (
            <View style={styles.comments}>
              <Icon name="lock" size={13} color={colors.textFaint} />
              <Text variant="caption" color={colors.textFaint}>
                Only you
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', marginBottom: spacing.md },
  celebrateBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerText: { flex: 1, gap: 1 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  badgeText: { fontWeight: '700' },
  headline: { marginTop: spacing.lg },
  role: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  roleText: { flex: 1, gap: 1 },
  note: { marginTop: spacing.md },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.lg },
  congrats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
  },
  comments: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  pressed: { opacity: 0.7 },
});
