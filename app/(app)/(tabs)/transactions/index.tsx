import { Link, Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Input } from '@/components/atoms/Input';
import { Spinner } from '@/components/atoms/Spinner';
import { CategoryChip } from '@/components/molecules/CategoryChip';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ErrorState } from '@/components/molecules/ErrorState';
import { Loading } from '@/components/molecules/Loading';
import { TransactionRow } from '@/components/organisms/TransactionRow';
import { Text } from '@/components/Themed';
import { ScreenLayout } from '@/components/templates/ScreenLayout';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { setCategoryFilter, setSearch } from '@/store/filtersSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export default function TransactionsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const dispatch = useAppDispatch();

  // Filters live in Redux (UI state the server doesn't own). The query key in
  // useTransactions includes them, so changing them refetches automatically.
  const { search, categoryId } = useAppSelector((state) => state.filters);

  // Local mirror of the search box so typing is instant; we debounce the push
  // into Redux so we don't refetch on every keystroke.
  const [searchText, setSearchText] = useState(search);
  useEffect(() => {
    const id = setTimeout(() => dispatch(setSearch(searchText)), 300);
    return () => clearTimeout(id);
  }, [searchText, dispatch]);

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTransactions({ search, categoryId });

  // Categories load separately; we build an id → name map so each row can show
  // its category name without the row having to fetch anything itself.
  const { data: categories } = useCategories();
  const categoryName = useMemo(() => {
    const map = new Map<string, string>();
    categories?.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  // useInfiniteQuery gives us pages; the list wants one flat array.
  const transactions = useMemo(() => data?.pages.flat() ?? [], [data]);

  return (
    <ScreenLayout>
      <Stack.Screen
        options={{
          title: 'Transactions',
          headerRight: () => (
            <Link href="/add-transaction" asChild>
              <Text style={[styles.addButton, { color: colors.primary }]}>
                + Add
              </Text>
            </Link>
          ),
        }}
      />

      <Input
        placeholder="Search notes…"
        value={searchText}
        onChangeText={setSearchText}
        autoCorrect={false}
        style={styles.search}
      />

      {categories && categories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
          style={styles.filterBar}
        >
          {/* "All" clears the category filter (categoryId = null). */}
          <CategoryChip
            label="All"
            selected={categoryId == null}
            onPress={() => dispatch(setCategoryFilter(null))}
          />
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              label={c.name}
              selected={categoryId === c.id}
              onPress={() => dispatch(setCategoryFilter(c.id))}
            />
          ))}
        </ScrollView>
      ) : null}

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorState
          message="Couldn't load your transactions."
          onRetry={() => refetch()}
        />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionRow
              transaction={item}
              categoryName={
                item.category_id ? categoryName.get(item.category_id) : null
              }
              onPress={() => router.push(`/transactions/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          // Pull down to refetch the first page.
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={refetch}
              tintColor={colors.textMuted}
            />
          }
          // Infinite scroll: ask for the next page near the bottom.
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListEmptyComponent={
            <EmptyState
              title="No transactions yet"
              message="Your income and expenses will appear here."
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footer}>
                <Spinner />
              </View>
            ) : null
          }
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  search: { marginBottom: spacing.md },
  // flexGrow: 0 stops the horizontal scroller from expanding to fill the column.
  filterBar: { flexGrow: 0, marginBottom: spacing.md },
  filterChips: { gap: spacing.sm, paddingRight: spacing.md },
  listContent: { flexGrow: 1, gap: spacing.sm },
  footer: { paddingVertical: spacing.md },
  addButton: { fontSize: 16, fontWeight: '600', paddingHorizontal: spacing.sm },
});
