import { Link, Stack } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/Themed';
import { ScreenLayout } from '@/components/templates/ScreenLayout';
import { spacing } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';

// Settings home: links to sub-screens + logout (wired to the session Context).
export default function SettingsScreen() {
  const { signOut } = useSession();

  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: 'Settings' }} />
      <View style={{ flex: 1, gap: spacing.md }}>
        <Link href="/settings/appearance" asChild>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Appearance</Text>
        </Link>
        <Link href="/settings/notifications" asChild>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Notifications</Text>
        </Link>
        <View style={{ flex: 1 }} />
        <Button title="Log out" variant="danger" onPress={signOut} />
      </View>
    </ScreenLayout>
  );
}
