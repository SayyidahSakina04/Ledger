import { log } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const SCOPE = 'api/reminders';

// The daily-reminder preference, stored on the user's profile so the backend
// (not the device) can send the push at the chosen time.
export type ReminderSettings = {
  enabled: boolean;
  hour: number; // 0–23, local to the user's timezone
  minute: number; // 0–59
  timezone: string; // IANA, e.g. "Asia/Karachi"
};

export async function fetchReminderSettings(
  userId: string,
): Promise<ReminderSettings> {
  log.debug(SCOPE, 'fetchReminderSettings', { userId });
  const { data, error } = await supabase
    .from('profiles')
    .select('reminder_enabled, reminder_hour, reminder_minute, timezone')
    .eq('id', userId)
    .single();

  if (error) {
    log.error(SCOPE, 'fetchReminderSettings failed', error.message);
    throw new Error(error.message);
  }

  // Fall back to sensible defaults for a profile that hasn't set these yet.
  return {
    enabled: data.reminder_enabled ?? false,
    hour: data.reminder_hour ?? 20, // 8:00 pm
    minute: data.reminder_minute ?? 0,
    timezone: data.timezone ?? 'UTC',
  };
}

export async function updateReminderSettings(
  userId: string,
  settings: ReminderSettings,
): Promise<void> {
  log.info(SCOPE, 'updateReminderSettings', {
    enabled: settings.enabled,
    hour: settings.hour,
    minute: settings.minute,
  });
  const { error } = await supabase
    .from('profiles')
    .update({
      reminder_enabled: settings.enabled,
      reminder_hour: settings.hour,
      reminder_minute: settings.minute,
      timezone: settings.timezone,
    })
    .eq('id', userId);

  if (error) {
    log.error(SCOPE, 'updateReminderSettings failed', error.message);
    throw new Error(error.message);
  }
}
