import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import { spacing } from '@/constants/theme';

// Shared empty view (e.g. a FlatList's ListEmptyComponent).
export function EmptyState({
  title = 'Nothing here yet',
  message,
}: {
  title?: string;
  message?: string;
}) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{title}</Text>
      {message ? (
        <Text style={{ marginTop: spacing.xs, textAlign: 'center' }}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: { fontSize: 18, fontWeight: '600' },
});
