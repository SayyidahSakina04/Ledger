import { router, Stack } from 'expo-router';

import { TransactionForm } from '@/components/organisms/TransactionForm';
import { ScreenLayout } from '@/components/templates/ScreenLayout';
import { useNotifications } from '@/context/NotificationsContext';
import { useCreateTransaction } from '@/hooks/useTransactionMutations';
import { notifyTransactionSaved } from '@/lib/notifications';

// Modal pop-up, reachable from the list's "+ Add". The form itself is shared
// with the edit screen — here we just hand it a "create" submit handler.
export default function AddTransactionModal() {
  const createTransaction = useCreateTransaction();
  // The same Settings switch that controls the daily reminder also gates the
  // "saved" confirmation, so we only fire it when notifications are on.
  const { enabled } = useNotifications();

  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: 'Add transaction' }} />
      <TransactionForm
        submitLabel="Save"
        onSubmit={async (input) => {
          // mutateAsync resolves with the created row, so we get its real id for
          // the confirmation's deep link.
          const created = await createTransaction.mutateAsync(input);
          if (enabled) await notifyTransactionSaved(created.id);
          // The optimistic update already added the row to the list behind us.
          router.back();
        }}
        onCancel={() => router.back()}
      />
    </ScreenLayout>
  );
}
