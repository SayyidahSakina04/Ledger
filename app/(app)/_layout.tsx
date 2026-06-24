import { Redirect, Stack } from 'expo-router';

import { Loading } from '@/components/molecules/Loading';
import { useSession } from '@/context/SessionContext';
import { usePushRegistration } from '@/hooks/usePushRegistration';

// Guard for the logged-IN area: no session -> bounce to login. This also
// protects deep links (e.g. a notification opening a transaction while logged out).
export default function AppLayout() {
  const { session, isLoading } = useSession();

  // Once signed in, store this device's push token so the backend can reach it.
  // Called before the early returns so the hook runs every render (Rules of
  // Hooks); it no-ops until there's a session.
  usePushRegistration();

  if (isLoading) return <Loading />;
  if (!session) return <Redirect href="/login" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
