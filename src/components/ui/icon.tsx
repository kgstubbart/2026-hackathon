import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';

import { colors } from '@/constants/theme';

// One place to map product icon names to SF Symbols (iOS) and Material Symbols (Android + web).
const icons = {
  home: ['house.fill', 'home'],
  friends: ['person.2.fill', 'group'],
  plus: ['plus', 'add'],
  chat: ['bubble.left.and.bubble.right.fill', 'forum'],
  profile: ['person.crop.circle.fill', 'account_circle'],
  search: ['magnifyingglass', 'search'],
  send: ['paperplane.fill', 'send'],
  calendar: ['calendar', 'calendar_month'],
  trophy: ['trophy.fill', 'emoji_events'],
  briefcase: ['briefcase.fill', 'work'],
  star: ['star.fill', 'star'],
  party: ['party.popper.fill', 'celebration'],
  comment: ['bubble.left', 'chat_bubble'],
  location: ['mappin.and.ellipse', 'location_on'],
  school: ['graduationcap.fill', 'school'],
  back: ['chevron.left', 'chevron_left'],
  forward: ['chevron.right', 'chevron_right'],
  close: ['xmark', 'close'],
  check: ['checkmark', 'check'],
  personAdd: ['person.badge.plus', 'person_add'],
  bell: ['bell', 'notifications'],
  settings: ['gearshape', 'settings'],
  edit: ['pencil', 'edit'],
  compose: ['square.and.pencil', 'edit_square'],
  lock: ['lock.fill', 'lock'],
  arrowUp: ['arrow.up', 'arrow_upward'],
  flame: ['flame.fill', 'local_fire_department'],
  sparkles: ['sparkles', 'auto_awesome'],
  clock: ['clock', 'schedule'],
  more: ['ellipsis', 'more_horiz'],
  share: ['square.and.arrow.up', 'ios_share'],
  clear: ['xmark.circle', 'cancel'],
  globe: ['globe', 'language'],
  code: ['chevron.left.forwardslash.chevron.right', 'code'],
  trash: ['trash', 'delete'],
  menu: ['line.3.horizontal', 'menu'],
} satisfies Record<string, [SFSymbol, AndroidSymbol]>;

export type IconName = keyof typeof icons;

export function Icon({ name, size = 22, color = colors.text }: { name: IconName; size?: number; color?: string }) {
  const [ios, android] = icons[name];
  return <SymbolView name={{ ios, android, web: android }} size={size} tintColor={color} />;
}
