import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { Text } from '@/components/Themed';
import { ScreenLayout } from '@/components/templates/ScreenLayout';
import { radius, spacing } from '@/constants/theme';
import {
  useNotifications,
  type ReminderTime,
} from '@/context/NotificationsContext';
import { useTheme } from '@/context/ThemeContext';

// Turn { hour, minute } into a local, human time like "8:00 PM".
function formatReminderTime({ hour, minute }: ReminderTime): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function NotificationsSettingsScreen() {
  const { colors } = useTheme();
  const { enabled, time, isReady, setEnabled, setTime } = useNotifications();
  const [showPicker, setShowPicker] = useState(false);

  // The picker wants a Date; build one at the saved hour/minute.
  const pickerValue = new Date();
  pickerValue.setHours(time.hour, time.minute, 0, 0);

  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Daily reminder</Text>
            <Text style={{ color: colors.textMuted }}>
              A nudge to log your spending each day.
            </Text>
          </View>
          {/* Disabled until the saved preference has loaded, so it can't flip
              from a wrong initial value. Denied permission leaves it off. */}
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            disabled={!isReady}
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
                {formatReminderTime(time)}
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
                setTime({
                  hour: selected.getHours(),
                  minute: selected.getMinutes(),
                });
              }
            }}
          />
        ) : null}
      </View>
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
