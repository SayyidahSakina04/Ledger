import { Link, Stack } from 'expo-router';
import { View } from 'react-native';

import { EmptyState } from '@/components/molecules/EmptyState';
import { Text } from '@/components/Themed';
import { ScreenLayout } from '@/components/templates/ScreenLayout';
import { spacing } from '@/constants/theme';

// Placeholder list. The real FlatList (with search/filter from Redux) is Step 4.
export default function TransactionsScreen() {
  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: 'Transactions' }} />
      <View style={{ flex: 1, gap: spacing.md }}>
        <EmptyState
          title="No transactions yet"
          message="The list is built in Step 4."
        />
        <Link href="/transactions/123" asChild>
          <Text style={{ textAlign: 'center', fontWeight: '600' }}>
            Open a sample detail →
          </Text>
        </Link>
      </View>
    </ScreenLayout>
  );
}
