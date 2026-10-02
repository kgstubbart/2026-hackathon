import type { Href } from 'expo-router';

import type { IconName } from '@/components/ui';

// Every top-level page. The tab bar shows the `tab` ones; the feed's menu shows all of them.
export const pages: { name: string; href: Href; icon: IconName; label: string; tab: boolean }[] = [
  { name: 'index', href: '/', icon: 'home', label: 'Feed', tab: true },
  { name: 'search', href: '/search', icon: 'search', label: 'Search', tab: true },
  { name: 'share', href: '/share', icon: 'plus', label: 'Share', tab: true },
  { name: 'messages', href: '/messages', icon: 'chat', label: 'Chats', tab: true },
  { name: 'profile', href: '/profile', icon: 'profile', label: 'Profile', tab: true },
  { name: 'friends', href: '/friends', icon: 'friends', label: 'Friends', tab: false },
];
