import { Stack } from 'expo-router';

import { Text } from '@/components/Themed';
import { ScreenLayout } from '@/components/templates/ScreenLayout';

// Placeholder for notification settings (on/off toggle + daily reminder time).
export default function NotificationsSettingsScreen() {
  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <Text>Notification settings will appear here.</Text>
    </ScreenLayout>
  );
}
