import { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { Activity, activityIcon, activityLabel, User } from '@/data/mock-data';
import { useJobHunt } from '@/data/job-hunt-store';

export function Screen({ children, scroll = false }: PropsWithChildren<{ scroll?: boolean }>) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.screen, { paddingTop: Math.max(insets.top, 18) }]}>{children}</View>;
}

export function Avatar({ user, size = 52 }: { user: User; size?: number }) {
  return <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: user.avatarColor }]}><Text style={[styles.avatarText, { fontSize: size * 0.3 }]}>{user.initials}</Text></View>;
}

const toneFor = (type: Activity['type']) => type === 'interview' ? [theme.colors.blueSoft, theme.colors.blue] : type === 'networking' ? [theme.colors.purpleSoft, theme.colors.purple] : type === 'skill_practice' ? [theme.colors.goldSoft, theme.colors.gold] : [theme.colors.coralSoft, theme.colors.coral];
export function ActivityPill({ type }: { type: Activity['type'] }) { const [backgroundColor, color] = toneFor(type); return <View style={[styles.pill, { backgroundColor }]}><Text style={[styles.pillIcon, { color }]}>{activityIcon[type]}</Text><Text style={styles.pillText}>{activityLabel[type]}</Text></View>; }

export function ActivityCard({ activity, compact = false }: { activity: Activity; compact?: boolean }) {
  const { users, toggleKudos } = useJobHunt();
  const user = users.find((item) => item.id === activity.user_id)!;
  const time = activity.id.startsWith('logged-') ? 'Just now' : activity.id.endsWith('0') ? '18 min ago' : activity.id.endsWith('1') ? '42 min ago' : activity.id.endsWith('2') ? '1 hr ago' : 'Today';
  const title = activity.type === 'interview' ? `${activity.metadata?.stage ?? 'Interview'} at ${activity.company}` : activity.notes.split('. ')[0];
  if (compact) return <View style={styles.compactActivity}><View style={[styles.typeSquare, { backgroundColor: toneFor(activity.type)[0] }]}><Text style={{ color: toneFor(activity.type)[1], fontSize: 22 }}>{activityIcon[activity.type]}</Text></View><View style={{ flex: 1 }}><Text style={styles.compactTitle}>{title}</Text><Text style={styles.compactMeta}>{activity.role}{activity.duration_minutes ? ` · ${activity.duration_minutes} min` : ''}</Text></View><Text style={styles.muted}>Today</Text></View>;
  return <View style={styles.card}><View style={styles.cardHeader}><Avatar user={user} size={48} /><View style={{ flex: 1 }}><Text style={styles.userName}>{user.name}</Text><Text style={styles.muted}>{time}</Text></View><ActivityPill type={activity.type} /></View><Text style={styles.activityTitle}>{title}</Text><Text style={styles.activityMeta}>{activity.role} · {activity.company}</Text><View style={styles.cardFooter}><Pressable onPress={() => toggleKudos(activity.id)} hitSlop={8} style={styles.kudos}><Text style={[styles.kudosIcon, activity.isKudos && { color: theme.colors.coral }]}>♨</Text><Text style={[styles.muted, activity.isKudos && { color: theme.colors.coral }]}>{activity.kudos}</Text></Pressable><Text style={styles.muted}>◯ {activity.comments}</Text></View></View>;
}

export function Heading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: string }) { return <View style={styles.heading}><View><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.headingTitle}>{title}</Text></View>{action ? <Text style={styles.headingAction}>{action}</Text> : null}</View>; }
export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) { return <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text></Pressable>; }
export function IconButton({ icon, onPress }: { icon: string; onPress?: () => void }) { return <Pressable onPress={onPress} style={styles.iconButton}><Text style={styles.iconButtonText}>{icon}</Text></Pressable>; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background }, avatar: { alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#fff', fontWeight: '800' }, heading: { paddingHorizontal: theme.spacing.xl, marginBottom: theme.spacing.xl, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, eyebrow: { color: theme.colors.muted, fontSize: theme.type.overline, fontWeight: '600', textTransform: 'uppercase', marginBottom: 3 }, headingTitle: { fontSize: theme.type.display, color: theme.colors.ink, letterSpacing: -1.2 }, headingAction: { color: theme.colors.coral, fontSize: 16, fontWeight: '700' },
  card: { backgroundColor: theme.colors.surface, marginHorizontal: theme.spacing.xl, padding: theme.spacing.lg, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.line, marginBottom: theme.spacing.md }, cardHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.lg }, userName: { color: theme.colors.ink, fontWeight: '800', fontSize: 18 }, muted: { color: theme.colors.muted, fontSize: 15 }, pill: { borderRadius: theme.radius.pill, paddingHorizontal: 11, paddingVertical: 7, flexDirection: 'row', gap: 5, alignItems: 'center' }, pillIcon: { fontWeight: '800', fontSize: 16 }, pillText: { color: theme.colors.muted, fontWeight: '700', fontSize: 15 }, activityTitle: { fontSize: 25, color: theme.colors.ink, letterSpacing: -0.4, marginBottom: 2 }, activityMeta: { color: theme.colors.muted, fontSize: 16 }, cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 22, marginTop: 12 }, kudos: { flexDirection: 'row', gap: 6, alignItems: 'center' }, kudosIcon: { color: theme.colors.blue, fontSize: 21 },
  compactActivity: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.md }, typeSquare: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, compactTitle: { color: theme.colors.ink, fontWeight: '600', fontSize: 18, marginBottom: 4 }, compactMeta: { color: theme.colors.muted, fontSize: 15 }, chip: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: theme.radius.pill, backgroundColor: '#ECEDEA' }, chipSelected: { backgroundColor: theme.colors.black }, chipText: { color: theme.colors.muted, fontSize: 17 }, chipTextSelected: { color: '#fff' }, iconButton: { width: 58, height: 58, borderRadius: 29, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }, iconButtonText: { fontSize: 27, color: theme.colors.ink },
});
