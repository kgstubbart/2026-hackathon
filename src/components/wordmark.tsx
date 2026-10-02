import { StyleSheet } from 'react-native';

import { Text } from '@/components/ui';

// "StrJava" with "Str" struck through by a single line.
export function Wordmark({ size = 24 }: { size?: number }) {
  return (
    <Text accessibilityRole="header" accessibilityLabel="StrJava" style={[styles.mark, { fontSize: size, lineHeight: size * 1.2 }]}>
      <Text style={[styles.mark, styles.struck, { fontSize: size }]}>Str</Text>
      Java
    </Text>
  );
}

const styles = StyleSheet.create({
  mark: { fontWeight: '900', letterSpacing: -0.6 },
  struck: { textDecorationLine: 'line-through', textDecorationStyle: 'solid' },
});
