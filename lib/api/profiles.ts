import { log } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

const SCOPE = 'api/profiles';

// Save this device's Expo push token onto the user's profile so the backend can
// send them push notifications. RLS limits the update to the user's own row.
export async function updatePushToken(
  userId: string,
  token: string,
): Promise<void> {
  log.info(SCOPE, 'updatePushToken', { userId });
  const { error } = await supabase
    .from('profiles')
    .update({ push_token: token })
    .eq('id', userId);

  if (error) {
    log.error(SCOPE, 'updatePushToken failed', error.message);
    throw new Error(error.message);
  }
}
