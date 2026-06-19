import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { formatAmount, formatDate } from '@/lib/format';
import type { Transaction } from '@/lib/types';

type TransactionRowProps = {
  transaction: Transaction;
  categoryName?: string | null;
  onPress?: () => void;
};

// One transaction in the list. Pure presentational: it gets its data via props
// and reports taps via onPress — it knows nothing about React Query or Supabase.
function TransactionRowBase({
  transaction,
  categoryName,
  onPress,
}: TransactionRowProps) {
  const { colors } = useTheme();
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? colors.success : colors.danger;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.left}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.note || (isIncome ? 'Income' : 'Expense')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {[categoryName, formatDate(transaction.date)]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>

      <Text style={[styles.amount, { color: amountColor }]}>
        {formatAmount(transaction.type, transaction.amount)}
      </Text>
    </Pressable>
  );
}

// memo: the list can re-render often (scroll, refetch); a row only needs to
// re-render when its own props change.
export const TransactionRow = memo(TransactionRowBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  left: { flex: 1, gap: spacing.xs },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 13 },
  amount: { fontSize: 16, fontWeight: '700' },
});
