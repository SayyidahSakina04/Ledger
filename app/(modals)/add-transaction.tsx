import { router, Stack } from 'expo-router';

import { TransactionForm } from '@/components/organisms/TransactionForm';
import { ScreenLayout } from '@/components/templates/ScreenLayout';
import { useCreateTransaction } from '@/hooks/useTransactionMutations';

// Modal pop-up, reachable from the list's "+ Add". The form itself is shared
// with the edit screen — here we just hand it a "create" submit handler.
export default function AddTransactionModal() {
  const createTransaction = useCreateTransaction();

  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: 'Add transaction' }} />
      <TransactionForm
        submitLabel="Save"
        onSubmit={async (input) => {
          await createTransaction.mutateAsync(input);
          // The optimistic update already added the row to the list behind us.
          router.back();
        }}
        onCancel={() => router.back()}
      />
    </ScreenLayout>
  );
}
