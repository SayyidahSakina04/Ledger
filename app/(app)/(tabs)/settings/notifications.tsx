import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { Loading } from '@/components/molecules/Loading';
import { Text } from '@/components/Themed';
import { ScreenLayout } from '@/components/templates/ScreenLayout';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import {
  useReminderSettings,
  useUpdateReminderSettings,
} from '@/hooks/useReminderSettings';
import { ensureNotificationPermissions } from '@/lib/notifications';

// The device's IANA timezone (e.g. "Asia/Karachi"). The server uses it to turn
// the user's chosen LOCAL time into when to actually send. Falls back to UTC.
function deviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

// { hour, minute } → a local, human time like "8:00 PM".
function formatTime(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function NotificationsSettingsScreen() {
  const { colors } = useTheme();
  const { data: settings, isLoading } = useReminderSettings();
  const update = useUpdateReminderSettings();
  const [showPicker, setShowPicker] = useState(false);

  const enabled = settings?.enabled ?? false;
  const hour = settings?.hour ?? 20;
  const minute = settings?.minute ?? 0;

  const pickerValue = new Date();
  pickerValue.setHours(hour, minute, 0, 0);

  const onToggle = async (on: boolean) => {
    // Turning it on needs permission to DISPLAY notifications (Android 13+);
    // if denied, leave it off.
    if (on) {
      const granted = await ensureNotificationPermissions();
      if (!granted) return;
    }
    update.mutate({ enabled: on, hour, minute, timezone: deviceTimezone() });
  };

  const onPickTime = (h: number, m: number) => {
    update.mutate({ enabled, hour: h, minute: m, timezone: deviceTimezone() });
  };

  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: 'Notifications' }} />
      {isLoading ? (
        <Loading />
      ) : (
        <View style={styles.container}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Daily reminder</Text>
              <Text style={{ color: colors.textMuted }}>
                A nudge to log your spending each day.
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={onToggle}
              disabled={update.isPending}
            />
          </View>

          {enabled ? (
            <View style={styles.row}>
              <Text style={styles.rowTitle}>Remind me at</Text>
              <Pressable
                onPress={() => setShowPicker(true)}
                style={[
                  styles.timeButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={{ fontWeight: '600' }}>
                  {formatTime(hour, minute)}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {showPicker ? (
            <DateTimePicker
              value={pickerValue}
              mode="time"
              onChange={(event, selected) => {
                // Android dismisses itself; mirror that for both platforms.
                setShowPicker(false);
                if (event.type === 'set' && selected) {
                  onPickTime(selected.getHours(), selected.getMinutes());
                }
              }}
            />
          ) : null}
        </View>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  timeButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
  },
});
