import Constants from 'expo-constants';
import * as Device from 'expo-device';
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

// --- Push token (the address the backend sends a remote push to) ----------------

// Returns this device's Expo push token, or null if unavailable (simulator, no
// permission, missing projectId, or — on Android — FCM not yet configured).
// Best-effort: never throws. The backend stores this per user and sends the
// daily reminder to it, so it fires even when the app is killed.
export async function getExpoPushToken(): Promise<string | null> {
  // Push tokens only exist on real hardware.
  if (!Device.isDevice) {
    log.warn(SCOPE, 'not a physical device; no push token');
    return null;
  }

  const granted = await ensureNotificationPermissions();
  if (!granted) return null;

  // getExpoPushTokenAsync needs the EAS project id from app.json (extra.eas).
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as
    | string
    | undefined;
  if (!projectId) {
    log.error(SCOPE, 'missing EAS projectId; cannot get a push token');
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    log.info(SCOPE, 'obtained expo push token');
    return token.data;
  } catch (err) {
    // Until FCM credentials are configured (Android), this fails — expected
    // until the prerequisite rebuild is done.
    log.warn(SCOPE, 'could not get push token', { reason: String(err) });
    return null;
  }
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
