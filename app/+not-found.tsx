import { Link, Stack } from 'expo-router';
import { View } from 'react-native';

import { Text } from '@/components/Themed';
import { ScreenLayout } from '@/components/templates/ScreenLayout';
import { spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.md,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: '700' }}>
          This screen doesn&apos;t exist.
        </Text>
        <Link href="/" asChild>
          <Text style={{ fontWeight: '600' }}>Go to home screen</Text>
        </Link>
      </View>
    </ScreenLayout>
  );
}
