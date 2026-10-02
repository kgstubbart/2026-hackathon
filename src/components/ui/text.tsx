import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, typography, type TypographyVariant } from '@/constants/theme';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
};

export function Text({ variant = 'body', color = colors.text, align, style, ...props }: TextProps) {
  return <RNText {...props} style={[typography[variant], { color, textAlign: align }, style]} />;
}
