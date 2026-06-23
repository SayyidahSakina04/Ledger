import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import { ErrorState } from '@/components/molecules/ErrorState';
import { Loading } from '@/components/molecules/Loading';
import { Text } from '@/components/Themed';
import { ScreenLayout } from '@/components/templates/ScreenLayout';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useCategories } from '@/hooks/useCategories';
import { useDeleteTransaction } from '@/hooks/useTransactionMutations';
import { useTransaction } from '@/hooks/useTransactions';
import { getReceiptSignedUrl } from '@/lib/api/storage';
import { formatAmount, formatDate } from '@/lib/format';

// One labelled line in the details list, e.g. "Date    Jun 19, 2026".
function DetailRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.detailRow}>
      <Text style={{ color: colors.textMuted }}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

// Detail screen. The id comes from the dynamic [id] segment, fully typed (no any).
export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const { data: transaction, isLoading, isError, refetch } = useTransaction(id);
  const { data: categories } = useCategories();
  const deleteTransaction = useDeleteTransaction();

  const categoryName = transaction?.category_id
    ? categories?.find((c) => c.id === transaction.category_id)?.name
    : null;

  // The bucket is private, so we swap the stored path for a short-lived signed
  // URL the <Image> can load. Re-runs if the receipt changes.
  const receiptPath = transaction?.receipt_url ?? null;
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  // Whether the full-screen receipt viewer is open.
  const [viewerOpen, setViewerOpen] = useState(false);
  useEffect(() => {
    let active = true;
    if (receiptPath) {
      getReceiptSignedUrl(receiptPath)
        .then((url) => active && setReceiptUrl(url))
        .catch(() => active && setReceiptUrl(null));
    } else {
      setReceiptUrl(null);
    }
    return () => {
      active = false;
    };
  }, [receiptPath]);

  const confirmDelete = () => {
    Alert.alert('Delete transaction', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction.mutateAsync(id);
          // Optimistic delete already removed the row from the list behind us.
          router.back();
        },
      },
    ]);
  };

  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: 'Details' }} />
      {isLoading ? (
        <Loading />
      ) : isError || !transaction ? (
        <ErrorState
          message="Couldn't load this transaction."
          onRetry={() => refetch()}
        />
      ) : (
        <View style={styles.container}>
          <Text
            style={[
              styles.amount,
              {
                color:
                  transaction.type === 'income'
                    ? colors.success
                    : colors.danger,
              },
            ]}
          >
            {formatAmount(transaction.type, transaction.amount)}
          </Text>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <DetailRow
              label="Type"
              value={transaction.type === 'income' ? 'Income' : 'Expense'}
            />
            <DetailRow label="Date" value={formatDate(transaction.date)} />
            <DetailRow label="Category" value={categoryName ?? '—'} />
            <DetailRow label="Note" value={transaction.note ?? '—'} />
            <DetailRow
              label="Payment method"
              value={transaction.payment_method ?? '—'}
            />
          </View>

          {receiptUrl ? (
            <>
              {/* Tap the thumbnail to open the receipt full-screen. */}
              <Pressable onPress={() => setViewerOpen(true)}>
                <Image source={{ uri: receiptUrl }} style={styles.receipt} />
              </Pressable>

              <Modal
                visible={viewerOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setViewerOpen(false)}
              >
                {/* Tap anywhere (or back) to close. contain shows the whole image. */}
                <Pressable
                  style={styles.viewerBackdrop}
                  onPress={() => setViewerOpen(false)}
                >
                  <Image
                    source={{ uri: receiptUrl }}
                    style={styles.viewerImage}
                    resizeMode="contain"
                  />
                </Pressable>
              </Modal>
            </>
          ) : null}

          <View style={styles.actions}>
            <Button
              title="Edit"
              onPress={() => router.push(`/transactions/${id}/edit`)}
            />
            <Button
              title="Delete"
              variant="danger"
              onPress={confirmDelete}
              loading={deleteTransaction.isPending}
            />
          </View>
        </View>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  amount: { fontSize: 32, fontWeight: '800', textAlign: 'center' },
  card: { borderRadius: 10, padding: spacing.md, gap: spacing.sm },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailValue: { fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  receipt: { width: '100%', height: 220, borderRadius: radius.md },
  actions: { gap: spacing.sm },
  viewerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImage: { width: '100%', height: '100%' },
});
