import { Redirect, Stack } from 'expo-router';

import { Loading } from '@/components/molecules/Loading';
import { useSession } from '@/context/SessionContext';

// Guard for the logged-IN area: no session -> bounce to login. This also
// protects deep links (e.g. a notification opening a transaction while logged out).
export default function AppLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) return <Loading />;
  if (!session) return <Redirect href="/login" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
