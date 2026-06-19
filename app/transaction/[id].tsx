import { Redirect, useLocalSearchParams } from 'expo-router';

// Deep-link target: ledger://transaction/<id> (used by notifications).
// It forwards to the real detail screen that lives inside the tabs.
export default function TransactionDeepLink() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={`/transactions/${id}`} />;
}
