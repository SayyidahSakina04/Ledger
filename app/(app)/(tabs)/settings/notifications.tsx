import { Stack } from 'expo-router';

import { Text } from '@/components/Themed';
import { ScreenLayout } from '@/components/templates/ScreenLayout';

// Placeholder. The on/off toggle + daily reminder time are built in Step 6.
export default function NotificationsSettingsScreen() {
  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <Text>Notification settings are built in Step 6.</Text>
    </ScreenLayout>
  );
}
