import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors } from '@/constants/theme';

// "StrJava" with "Str" struck through by a single bold bar. The bar is a drawn View
// (not textDecorationLine) so its thickness can scale with the wordmark.
export function Wordmark({ size = 24 }: { size?: number }) {
  const lineHeight = size * 1.2;
  const text = [styles.mark, { fontSize: size, lineHeight }];
  return (
    <View accessible accessibilityRole="header" accessibilityLabel="StrJava" style={styles.row}>
      <View>
        <Text style={text}>Str</Text>
        <View
          style={[
            styles.bar,
            { height: Math.max(2, Math.round(size * 0.16)), top: lineHeight * 0.5, left: -size * 0.12, right: size * 0.04 },
          ]}
        />
      </View>
      <Text style={text}>Java</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  mark: { fontWeight: '900', letterSpacing: -0.6 },
  bar: { position: 'absolute', borderRadius: 2, backgroundColor: colors.text },
});
