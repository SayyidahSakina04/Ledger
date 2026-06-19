import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/Themed';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

// Shared error view with an optional retry action.
export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.center}>
      <Text style={[styles.title, { color: colors.danger }]}>Error</Text>
      <Text style={{ marginTop: spacing.xs, textAlign: 'center' }}>
        {message}
      </Text>
      {onRetry ? (
        <Button
          title="Try again"
          variant="secondary"
          onPress={onRetry}
          style={{ marginTop: spacing.md }}
        />
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
  title: { fontSize: 18, fontWeight: '700' },
});
