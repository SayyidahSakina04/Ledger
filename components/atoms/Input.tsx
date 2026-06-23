import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export type InputProps = TextInputProps & {
  // When true, the border turns red to signal a validation error.
  error?: boolean;
}; // has the TextInputProps as well as error

// Themed text input. Forwards all normal TextInput props (value, onChangeText, etc.).
export function Input({ error = false, style, ...rest }: InputProps) {
  const { colors } = useTheme();

  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      style={[
        styles.base,
        {
          color: colors.text,
          backgroundColor: colors.card,
          borderColor: error ? colors.danger : colors.border,
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
});
