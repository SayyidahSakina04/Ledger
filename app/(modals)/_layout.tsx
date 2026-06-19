import { Stack } from 'expo-router';

// Stack for screens presented as modals (pop-ups). The modal presentation itself
// is set on the (modals) group in the root layout.
export default function ModalsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
