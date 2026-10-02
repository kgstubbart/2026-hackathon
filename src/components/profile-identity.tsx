import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Icon, Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import type { User } from '@/data/mock-data';

export type ProfileCount = { value: number; label: string; onPress?: () => void };

type ProfileIdentityProps = {
  user: User;
  /** Rendered to the right of the name, e.g. the Edit button on your own profile. */
  action?: ReactNode;
  counts: ProfileCount[];
};

// The block at the top of a profile: avatar, name, school and location lines, then a row of counts.
// Shared by your own profile and other people's pages so they read the same.
export function ProfileIdentity({ user, action, counts }: ProfileIdentityProps) {
  return (
    <View style={styles.profile}>
      <View style={styles.profileTop}>
        <Avatar user={user} size={72} />
        <View style={styles.identity}>
          <Text variant="title">{user.name}</Text>
          <View style={styles.meta}>
            <Icon name="school" size={14} color={colors.textMuted} />
            <Text variant="callout" color={colors.textMuted} numberOfLines={1} style={styles.flex}>
              {user.major} · {user.school}
            </Text>
          </View>
          <View style={styles.meta}>
            <Icon name="location" size={14} color={colors.textMuted} />
            <Text variant="callout" color={colors.textMuted} numberOfLines={1} style={styles.flex}>
              {user.location} · Class of {user.gradYear}
            </Text>
          </View>
        </View>
        {action}
      </View>
      <View style={styles.counts}>
        {counts.map((count) => {
          const text = (
            <Text variant="callout">
              <Text variant="callout" style={styles.bold}>
                {count.value}
              </Text>{' '}
              <Text variant="callout" color={count.onPress ? colors.primary : colors.textMuted}>
                {count.label}
              </Text>
            </Text>
          );
          if (!count.onPress) return <View key={count.label}>{text}</View>;
          return (
            <Pressable
              key={count.label}
              accessibilityRole="link"
              accessibilityLabel={`${count.value} ${count.label}`}
              hitSlop={8}
              onPress={count.onPress}
              style={({ pressed }) => pressed && styles.pressed}>
              {text}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flexShrink: 1 },
  bold: { fontWeight: '700' },
  profile: { gap: spacing.lg, marginTop: spacing.sm },
  profileTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  identity: { flex: 1, gap: spacing.xs },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  counts: { flexDirection: 'row', gap: spacing.xl },
  pressed: { opacity: 0.6 },
});
