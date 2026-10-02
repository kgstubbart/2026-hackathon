import { Platform } from 'react-native';

export const theme = {
  colors: {
    ink: '#191A19', muted: '#747771', background: '#F7F7F4', surface: '#FFFFFF',
    line: '#E2E3DE', coral: '#FA513A', coralSoft: '#FFE1DA', blue: '#397EF4',
    blueSoft: '#E4EDFF', navy: '#254291', green: '#159565', greenSoft: '#DCF5E8',
    purple: '#7657DD', purpleSoft: '#EEE8FF', gold: '#D99305', goldSoft: '#FFF0C8',
    black: '#181A18', lightText: '#A0A29C', input: '#F3F4F1',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 12, md: 18, lg: 28, pill: 999 },
  type: { overline: 14, caption: 16, body: 17, title: 28, display: 40 },
} as const;

export const MaxContentWidth = 680;

// Compatibility exports for the starter's shared components. New product UI uses `theme` above.
export const Colors = {
  light: { text: theme.colors.ink, background: theme.colors.background, backgroundElement: theme.colors.input, backgroundSelected: theme.colors.line, textSecondary: theme.colors.muted },
  dark: { text: '#FFFFFF', background: '#191A19', backgroundElement: '#2A2C29', backgroundSelected: '#3A3C38', textSecondary: '#B5B8B1' },
} as const;
export type ThemeColor = keyof typeof Colors.light;
export const Fonts = Platform.select({ ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' }, default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' } });
export const Spacing = { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 } as const;
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
