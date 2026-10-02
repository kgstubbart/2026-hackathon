import { type TextStyle, type ViewStyle } from 'react-native';

const palette = {
  // Neutrals: warm paper background with cool ink
  paper: '#F6F5F1',
  white: '#FFFFFF',
  sand: '#EEECE6',
  line: '#E6E3DC',
  ink: '#15141A',
  inkSoft: '#5D5B66',
  inkFaint: '#9C9AA5',

  // Brand
  indigo: '#4F46E5',
  indigoDeep: '#2E2A8F',
  indigoSoft: '#ECEBFE',

  // Update tones
  sky: '#2563EB',
  skySoft: '#E5EDFF',
  amber: '#B45309',
  amberSoft: '#FDF0D5',
  mint: '#0F8A5F',
  mintSoft: '#DCF4E8',
  rose: '#D6336C',
  roseSoft: '#FDE4EE',
  teal: '#0E7490',
  tealSoft: '#DDF3F7',

  // Streak
  flame: '#FC5200',
  flameLight: '#FF8A4C',
} as const;

export const colors = {
  background: palette.paper,
  surface: palette.white,
  surfaceMuted: palette.sand,
  border: palette.line,
  text: palette.ink,
  textMuted: palette.inkSoft,
  textFaint: palette.inkFaint,
  primary: palette.indigo,
  primaryDeep: palette.indigoDeep,
  primarySoft: palette.indigoSoft,
  onPrimary: palette.white,
  success: palette.mint,
  streak: palette.flame,
  streakSoft: palette.flameLight,
  ...palette,
} as const;

export type Tone = 'primary' | 'sky' | 'amber' | 'mint' | 'rose' | 'teal';
export const tones: Record<Tone, { fg: string; bg: string }> = {
  primary: { fg: palette.indigo, bg: palette.indigoSoft },
  sky: { fg: palette.sky, bg: palette.skySoft },
  amber: { fg: palette.amber, bg: palette.amberSoft },
  mint: { fg: palette.mint, bg: palette.mintSoft },
  rose: { fg: palette.rose, bg: palette.roseSoft },
  teal: { fg: palette.teal, bg: palette.tealSoft },
};

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: -0.9 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.4 },
  headline: { fontSize: 17, lineHeight: 23, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '400' },
  callout: { fontSize: 14, lineHeight: 19, fontWeight: '500' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

export const shadow = {
  card: { boxShadow: '0 1px 2px rgba(21,20,26,0.04), 0 6px 18px rgba(21,20,26,0.05)' },
  raised: { boxShadow: '0 8px 20px rgba(79,70,229,0.32)' },
} satisfies Record<string, ViewStyle>;

export const layout = {
  gutter: spacing.xl,
  maxContentWidth: 640,
} as const;
