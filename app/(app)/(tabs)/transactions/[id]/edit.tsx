import { router, Stack, useLocalSearchParams } from 'expo-router';

import { ErrorState } from '@/components/molecules/ErrorState';
import { Loading } from '@/components/molecules/Loading';
import { TransactionForm } from '@/components/organisms/TransactionForm';
import { ScreenLayout } from '@/components/templates/ScreenLayout';
import { useTransaction } from '@/hooks/useTransactions';
import { useUpdateTransaction } from '@/hooks/useTransactionMutations';

// Edit screen. Loads the transaction, pre-fills the shared form, and saves via
// the update mutation. The id comes from the dynamic [id] segment (fully typed).
export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: transaction, isLoading, isError, refetch } = useTransaction(id);
  const updateTransaction = useUpdateTransaction();

  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: 'Edit' }} />
      {isLoading ? (
        <Loading />
      ) : isError || !transaction ? (
        <ErrorState
          message="Couldn't load this transaction."
          onRetry={() => refetch()}
        />
      ) : (
        <TransactionForm
          submitLabel="Save changes"
          // Map the stored row back into the form's string fields.
          initialValues={{
            type: transaction.type,
            amount: String(transaction.amount),
            categoryId: transaction.category_id,
            date: transaction.date,
            note: transaction.note ?? '',
            paymentMethod: transaction.payment_method ?? '',
            receiptUrl: transaction.receipt_url,
          }}
          onSubmit={async (input) => {
            await updateTransaction.mutateAsync({ id, input });
            router.back();
          }}
          onCancel={() => router.back()}
        />
      )}
    </ScreenLayout>
  );
}
