import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/Themed';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

// A selectable pill — used for choosing a category in the form and (later) for
// filtering the list. Selected = filled with the primary color.
export function CategoryChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
    >
      <Text
        style={{
          color: selected ? colors.onPrimary : colors.text,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
  },
});
