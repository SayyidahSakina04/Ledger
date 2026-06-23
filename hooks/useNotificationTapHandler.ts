import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { log } from '@/lib/logger';

const SCOPE = 'notifications';

// Routes the app when a notification is TAPPED. useLastNotificationResponse
// returns the most recent tap and survives a cold start, so one hook handles the
// app being open, backgrounded, or fully killed. The `data` we attached when
// creating each notification tells us where to go.
export function useNotificationTapHandler(): void {
  const router = useRouter();
  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!response) return;

    const data = response.notification.request.content.data as {
      kind?: string;
      transactionId?: string;
    };
    log.info(SCOPE, 'notification tapped', { kind: data?.kind });

    if (data?.kind === 'transaction-saved' && data.transactionId) {
      // Open that transaction's detail screen.
      router.push(`/transactions/${data.transactionId}`);
    } else if (data?.kind === 'daily-reminder') {
      // No specific transaction — drop them on the list to log one.
      router.push('/transactions');
    }
  }, [response, router]);
}
