import { Redirect } from 'expo-router';

import { Loading } from '@/components/molecules/Loading';
import { useSession } from '@/context/SessionContext';

// Entry point: wait for the launch session check, then send the user to the right place. Deep links that land deeper are guarded by the group layouts.
export default function Index() {
  const { session, isLoading } = useSession();

  if (isLoading) return <Loading />;
  return <Redirect href={session ? '/transactions' : '/login'} />;
}
