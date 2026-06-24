import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import { useTheme } from '@/context/ThemeContext';

// The app's wordmark: just "Ledger". Used on the logged-out screens.
export function Brand() {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.word, { color: colors.text }]}>Ledger</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  word: { fontSize: 40, fontWeight: '800', letterSpacing: 1 },
});
