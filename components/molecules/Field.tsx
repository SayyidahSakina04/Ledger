import { StyleSheet, View } from 'react-native';

import { Input, type InputProps } from '@/components/atoms/Input';
import { Text } from '@/components/Themed';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

// Omit Input's boolean `error` so we can redefine it as the error *message*.
export type FieldProps = Omit<InputProps, 'error'> & {
  label: string;
  // A validation message; when present the input shows its error state.
  error?: string;
};

// Molecule: a labelled input with an error message. Atoms (Text + Input) combined.
export function Field({ label, error, ...inputProps }: FieldProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <Input error={Boolean(error)} {...inputProps} />
      {error ? (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  // Small, muted, uppercase labels give the forms a cleaner, more designed look.
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  error: { fontSize: 13 },
});
