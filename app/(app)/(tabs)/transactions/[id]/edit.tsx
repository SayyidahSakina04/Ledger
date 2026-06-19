import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Text } from '@/components/Themed';
import { ScreenLayout } from '@/components/templates/ScreenLayout';
import { spacing } from '@/constants/theme';

// Edit screen. Reuses the same form as Add (Step 5), pre-filled for this id.
export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: 'Edit' }} />
      <View style={{ gap: spacing.md }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>Edit {id}</Text>
        <Text>The shared add/edit form is built in Step 5.</Text>
      </View>
    </ScreenLayout>
  );
}
