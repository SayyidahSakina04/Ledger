import { useEffect } from 'react';

import { useSession } from '@/context/SessionContext';
import { updatePushToken } from '@/lib/api/profiles';
import { log } from '@/lib/logger';
import { getExpoPushToken } from '@/lib/notifications';

const SCOPE = 'notifications';

// Once a user is signed in, get this device's push token and store it on their
// profile so the backend can send them reminders. Re-runs when the signed-in
// user changes (fresh login or restored session); storing is idempotent.
export function usePushRegistration(): void {
  const { session } = useSession();
  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;

    let active = true;
    getExpoPushToken().then((token) => {
      // Bail if unmounted, or no token (simulator / denied / FCM not set up yet).
      if (!active || !token) return;
      updatePushToken(userId, token).catch((err) =>
        log.error(SCOPE, 'storing push token failed', String(err)),
      );
    });

    return () => {
      active = false;
    };
  }, [userId]);
}
