import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSession } from '@/context/SessionContext';
import {
  fetchReminderSettings,
  updateReminderSettings,
  type ReminderSettings,
} from '@/lib/api/reminders';
import { queryKeys } from '@/lib/queryKeys';

// Reads the signed-in user's reminder settings. This is SERVER data now (it
// lives on the profile so the backend can send the push), so it belongs in
// React Query — not Context.
export function useReminderSettings() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: queryKeys.reminderSettings(userId ?? ''),
    queryFn: () => fetchReminderSettings(userId as string),
    enabled: Boolean(userId),
  });
}

// Saves the settings, optimistically (the toggle flips instantly; rolls back on
// error). Same pattern as the transaction mutations.
export function useUpdateReminderSettings() {
  const queryClient = useQueryClient();
  const { session } = useSession();
  const userId = session?.user.id;
  const key = queryKeys.reminderSettings(userId ?? '');

  return useMutation({
    mutationFn: (settings: ReminderSettings) =>
      updateReminderSettings(userId as string, settings),
    onMutate: async (settings) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ReminderSettings>(key);
      queryClient.setQueryData<ReminderSettings>(key, settings);
      return { previous };
    },
    onError: (_err, _settings, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
  });
}
