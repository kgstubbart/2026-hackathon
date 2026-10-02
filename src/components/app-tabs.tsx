import type { Href } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, Text, type IconName } from '@/components/ui';
import { colors, radius, shadow, spacing } from '@/constants/theme';

const tabs: { name: string; href: Href; icon: IconName; label: string }[] = [
  { name: 'index', href: '/', icon: 'home', label: 'Feed' },
  { name: 'search', href: '/search', icon: 'search', label: 'Search' },
  { name: 'share', href: '/share', icon: 'plus', label: 'Share' },
  { name: 'messages', href: '/messages', icon: 'chat', label: 'Chats' },
  { name: 'profile', href: '/profile', icon: 'profile', label: 'Profile' },
];

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <TabBar>
          {tabs.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton icon={tab.icon} label={tab.label} primary={tab.name === 'share'} />
            </TabTrigger>
          ))}
          {/* Friends is a route but not a tab; reachable from Search. */}
          <TabTrigger name="friends" href="/friends" style={styles.hidden} />
        </TabBar>
      </TabList>
    </Tabs>
  );
}

function TabBar({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>{children}</View>;
}

type TabButtonProps = TabTriggerSlotProps & { icon: IconName; label: string; primary?: boolean };

function TabButton({ icon, label, primary, isFocused, ...props }: TabButtonProps) {
  const color = isFocused ? colors.primary : colors.textFaint;
  return (
    <Pressable {...props} accessibilityLabel={label} style={styles.tab}>
      {primary ? (
        <View style={[styles.share, shadow.raised]}>
          <Icon name={icon} size={22} color={colors.onPrimary} />
        </View>
      ) : (
        <>
          <Icon name={icon} size={22} color={color} />
          <Text variant="caption" color={color} style={isFocused && styles.activeLabel}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1 },
  hidden: { display: 'none' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 48 },
  activeLabel: { fontWeight: '700' },
  share: {
    width: 48,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
