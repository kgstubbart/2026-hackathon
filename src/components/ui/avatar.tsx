import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/constants/theme';
import type { User } from '@/data/mock-data';
import { Text } from './text';

export function Avatar({ user, size = 44, ring }: { user: User; size?: number; ring?: string }) {
  const circle = (
    <View style={[styles.center, { width: size, height: size, borderRadius: size / 2, backgroundColor: user.color }]}>
      <Text style={{ fontSize: size * 0.36, lineHeight: size * 0.44, fontWeight: '700' }} color={colors.onPrimary}>
        {user.initials}
      </Text>
    </View>
  );
  if (!ring) return circle;
  return <View style={[styles.center, styles.ring, { borderRadius: size, borderColor: ring }]}>{circle}</View>;
}

const markColors = ['#4F46E5', '#0F8A5F', '#B45309', '#D6336C', '#2563EB', '#7C3AED', '#0E7490'];

export function CompanyMark({ company, size = 40 }: { company: string; size?: number }) {
  const hash = [...company].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const color = markColors[hash % markColors.length];
  return (
    <View style={[styles.center, styles.mark, { width: size, height: size, borderRadius: size * 0.3 }]}>
      <Text style={{ fontSize: size * 0.42, lineHeight: size * 0.5, fontWeight: '800' }} color={color}>
        {company.charAt(0)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  ring: { padding: 2.5, borderWidth: 2.5 },
  mark: { backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, borderRadius: radius.md },
});
