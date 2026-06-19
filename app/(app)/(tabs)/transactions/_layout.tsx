import { Stack } from 'expo-router';

// The Transactions tab's own stack: list -> detail -> edit. Titles are set by
// each screen via its own <Stack.Screen options={{ title }} />.
export default function TransactionsStack() {
  return <Stack />;
}
