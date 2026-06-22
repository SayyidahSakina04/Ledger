import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { CategoryChip } from '@/components/molecules/CategoryChip';
import { Text } from '@/components/Themed';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type { Category } from '@/lib/types';

type CategoryFilterProps = {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

// A "Filter" button that opens a bottom sheet of categories to filter the list
// by. Keeps the filter UI out of the way until the user wants it.
export function CategoryFilter({
  categories,
  selectedId,
  onSelect,
}: CategoryFilterProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  const selectedName = selectedId
    ? categories.find((c) => c.id === selectedId)?.name
    : null;
  const isActive = Boolean(selectedId);

  const choose = (id: string | null) => {
    onSelect(id);
    setOpen(false);
  };

  return (
    <>
      {/* The trigger. Turns into the primary color and shows the active
          category's name when a filter is applied. */}
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.trigger,
          {
            backgroundColor: isActive ? colors.primary : colors.card,
            borderColor: isActive ? colors.primary : colors.border,
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={{
            color: isActive ? colors.onPrimary : colors.text,
            fontWeight: '600',
          }}
        >
          {selectedName ? `Filter: ${selectedName}` : 'Filter'}
        </Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        {/* Tapping the dim backdrop closes the sheet. */}
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          {/* Stop taps inside the sheet from closing it. */}
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.background }]}
            onPress={() => {}}
          >
            <Text style={styles.title}>Filter by category</Text>
            <View style={styles.chips}>
              <CategoryChip
                label="All"
                selected={selectedId == null}
                onPress={() => choose(null)}
              />
              {categories.map((c) => (
                <CategoryChip
                  key={c.id}
                  label={c.name}
                  selected={selectedId === c.id}
                  onPress={() => choose(c.id)}
                />
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    maxWidth: 160,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    padding: spacing.lg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    gap: spacing.md,
  },
  title: { fontSize: 18, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
