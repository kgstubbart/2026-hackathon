import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import type { Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';

const navItems = [
  { name: 'index', href: '/', icon: '⌂', label: 'Feed' },
  { name: 'search', href: '/search', icon: '⌕', label: 'Search' },
  { name: 'add', href: '/add', icon: '+', label: 'Add' },
  { name: 'messages', href: '/messages', icon: '◯', label: 'Messages' },
  { name: 'profile', href: '/profile', icon: '♙', label: 'Profile' },
] as const;

export default function AppTabs() {
  return <Tabs><TabSlot style={styles.slot} /><TabList asChild><BottomTabs>{navItems.map((item) => <TabTrigger key={item.name} name={item.name} href={item.href as Href} asChild><TabButton {...item} /></TabTrigger>)}</BottomTabs></TabList></Tabs>;
}

function BottomTabs({ children }: { children: React.ReactNode }) { const insets = useSafeAreaInsets(); return <View style={[styles.tabs, { paddingBottom: Math.max(insets.bottom, 10) }]}>{children}</View>; }
function TabButton({ icon, label, isFocused, ...props }: TabTriggerSlotProps & { icon: string; label: string }) {
  const isAdd = label === 'Add';
  return <Pressable {...props} style={styles.tabButton}><View style={[isAdd ? styles.addButton : styles.tabIcon]}><Text style={[isAdd ? styles.addIcon : styles.icon, isFocused && !isAdd && styles.iconActive]}>{icon}</Text></View><Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{label}</Text>{isFocused && !isAdd ? <View style={styles.dot} /> : null}</Pressable>;
}
const styles = StyleSheet.create({ slot: { flex: 1 }, tabs: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: theme.colors.line, justifyContent: 'space-around', paddingTop: 8, minHeight: 78 }, tabButton: { alignItems: 'center', width: 66, minHeight: 58 }, tabIcon: { height: 29, justifyContent: 'center', alignItems: 'center' }, icon: { fontSize: 27, color: '#A0A29C', fontWeight: '300' }, iconActive: { color: theme.colors.coral }, tabLabel: { fontSize: 13, color: '#92958F', marginTop: 2 }, tabLabelActive: { color: theme.colors.coral, fontWeight: '800' }, addButton: { width: 62, height: 62, borderRadius: 31, backgroundColor: theme.colors.coral, alignItems: 'center', justifyContent: 'center', marginTop: -35, shadowColor: theme.colors.coral, shadowOpacity: 0.28, shadowRadius: 16, shadowOffset: { width: 0, height: 7 }, elevation: 8 }, addIcon: { color: '#fff', fontSize: 46, fontWeight: '200', lineHeight: 48 }, dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.coral, marginTop: 4 } });
