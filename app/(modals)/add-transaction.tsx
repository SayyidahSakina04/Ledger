import { router, Stack } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/Themed';
import { ScreenLayout } from '@/components/templates/ScreenLayout';
import { spacing } from '@/constants/theme';

// Modal pop-up, reachable from more than one place (e.g. the list and a + button).
// The real form (React Hook Form + zod + pickers) is built in Step 5.
export default function AddTransactionModal() {
  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: 'Add transaction' }} />
      <View style={{ gap: spacing.md }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>Add transaction</Text>
        <Text>The form is built in Step 5.</Text>
        <Button
          title="Close"
          variant="secondary"
          onPress={() => router.back()}
        />
      </View>
    </ScreenLayout>
  );
}
