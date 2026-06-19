import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Text } from '@/components/Themed';
import { ScreenLayout } from '@/components/templates/ScreenLayout';
import { spacing } from '@/constants/theme';

// Detail screen. The id comes from the dynamic [id] segment, fully typed (no any).
export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: 'Details' }} />
      <View style={{ gap: spacing.md }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>
          Transaction {id}
        </Text>
        <Text>Full details, edit, and delete are built in Steps 3–4.</Text>
        <Link href={`/transactions/${id}/edit`} asChild>
          <Text style={{ fontWeight: '600' }}>Edit →</Text>
        </Link>
      </View>
    </ScreenLayout>
  );
}
