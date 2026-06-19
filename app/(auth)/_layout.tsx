import { Redirect, Stack } from 'expo-router';

import { Loading } from '@/components/molecules/Loading';
import { useSession } from '@/context/SessionContext';

// Guard for the logged-OUT flow: if a session exists, redirect into the app so
// you can't reach the login screens while signed in.
export default function AuthLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) return <Loading />;
  if (session) return <Redirect href="/transactions" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
