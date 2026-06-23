import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { log } from '@/lib/logger';
import {
  cancelDailyReminder,
  ensureNotificationPermissions,
  scheduleDailyReminder,
} from '@/lib/notifications';

const SCOPE = 'notifications';

// Where the preference is saved on the device so it survives relaunches.
const STORAGE_KEY = 'ledger.notifications.reminder';

export type ReminderTime = { hour: number; minute: number };

// 8:00 pm — a sensible default time to nudge someone to log the day's spending.
const DEFAULT_TIME: ReminderTime = { hour: 20, minute: 0 };

type NotificationsContextValue = {
  // Whether the daily reminder is on.
  enabled: boolean;
  // What time it fires.
  time: ReminderTime;
  // False until the saved preference has loaded (so the UI doesn't flash).
  isReady: boolean;
  // Turn the reminder on/off. Turning on asks permission and schedules it.
  setEnabled: (on: boolean) => Promise<void>;
  // Change the time; reschedules if the reminder is currently on.
  setTime: (time: ReminderTime) => Promise<void>;
};

const NotificationsContext = createContext<
  NotificationsContextValue | undefined
>(undefined);

type Persisted = { enabled: boolean; time: ReminderTime };

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(false);
  const [time, setTimeState] = useState<ReminderTime>(DEFAULT_TIME);
  const [isReady, setIsReady] = useState(false);

  // Load the saved preference once on launch. The OS keeps the actual schedule
  // across launches, so we only need to restore what the UI should show.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const saved = JSON.parse(raw) as Persisted;
          setEnabledState(saved.enabled);
          setTimeState(saved.time);
        }
      })
      .catch((err) =>
        log.warn(SCOPE, 'failed to load reminder pref', String(err)),
      )
      .finally(() => setIsReady(true));
  }, []);

  const value = useMemo<NotificationsContextValue>(() => {
    const persist = (next: Persisted) =>
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    return {
      enabled,
      time,
      isReady,
      setEnabled: async (on) => {
        if (on) {
          // Can't schedule without permission; if denied, stay off.
          const granted = await ensureNotificationPermissions();
          if (!granted) return;
          await scheduleDailyReminder(time.hour, time.minute);
        } else {
          await cancelDailyReminder();
        }
        setEnabledState(on);
        await persist({ enabled: on, time });
      },
      setTime: async (next) => {
        setTimeState(next);
        await persist({ enabled, time: next });
        // Only touch the OS schedule if the reminder is actually on.
        if (enabled) await scheduleDailyReminder(next.hour, next.minute);
      },
    };
  }, [enabled, time, isReady]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      'useNotifications must be used inside a NotificationsProvider',
    );
  }
  return ctx;
}
