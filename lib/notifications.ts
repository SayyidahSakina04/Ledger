import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { log } from '@/lib/logger';

const SCOPE = 'notifications';

// The channel notifications are posted to on Android. Android 8+ refuses to show
// a notification that has no channel, so we create one (idempotent — safe to
// call on every launch).
const ANDROID_CHANNEL_ID = 'default';

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

// Make sure we have permission to show notifications, asking once if needed.
// Returns whether it's granted. This — not a push token — is the only thing
// local notifications require, so the Settings toggle calls it before scheduling.
export async function ensureNotificationPermissions(): Promise<boolean> {
  await ensureAndroidChannel();
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;

  const { status: requested } = await Notifications.requestPermissionsAsync();
  const granted = requested === 'granted';
  if (!granted)
    log.warn(SCOPE, 'notification permission not granted', { status });
  return granted;
}

// --- The daily "log your spending" reminder (a local, repeating notification) --

// We only ever schedule this one repeating reminder, so cancelling everything
// before (re)scheduling guarantees we never stack duplicates.
export async function scheduleDailyReminder(
  hour: number,
  minute: number,
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Log your spending',
      body: "Add today's income and expenses to keep your ledger up to date.",
      data: { kind: 'daily-reminder' },
    },
    // A DAILY trigger fires every day at this local time and repeats on its own —
    // the OS keeps firing it even when the app is closed.
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  log.info(SCOPE, 'scheduled daily reminder', { hour, minute });
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  log.info(SCOPE, 'cancelled daily reminder');
}

// --- Confirmation when a transaction is added (an immediate local notification) -

// `trigger: null` means "show it now". We tuck the transaction id into `data` so
// the tap handler knows which detail screen to open.
export async function notifyTransactionSaved(
  transactionId: string,
): Promise<void> {
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Transaction saved',
      body: 'Your transaction was added to your ledger.',
      data: { kind: 'transaction-saved', transactionId },
    },
    trigger: null,
  });
  log.info(SCOPE, 'fired transaction-saved notification', { transactionId });
}
