import { Pressable, StyleSheet, type StyleProp, type ViewStyle, } from 'react-native';
import { Text } from '@/components/Themed';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'danger';

export type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

// Themed button. While `loading`, it shows a spinner and can't be pressed.
export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === 'primary'
      ? colors.primary
      : variant === 'danger'
        ? colors.danger
        : colors.card;
  // Secondary sits on a card background, so its text uses the normal text color.
  const textColor = variant === 'secondary' ? colors.text : colors.onPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor, opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === 'secondary' && {
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {loading ? (
        <Spinner color={textColor} />
      ) : (
        <Text style={{ color: textColor, fontSize: 16, fontWeight: '600' }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
