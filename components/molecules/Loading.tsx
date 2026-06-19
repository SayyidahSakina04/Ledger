import { StyleSheet, View } from 'react-native';

import { Spinner } from '@/components/atoms/Spinner';
import { Text } from '@/components/Themed';
import { spacing } from '@/constants/theme';

// Shared loading view. Every screen uses the same one (Step 3 guideline).
export function Loading({ message = 'Loading…' }: { message?: string }) {
  return (
    <View style={styles.center}>
      <Spinner size="large" />
      <Text style={{ marginTop: spacing.sm }}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
