import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import {
  fetchTransaction,
  fetchTransactionsPage,
  PAGE_SIZE,
} from '@/lib/api/transactions';
import { queryKeys } from '@/lib/queryKeys';
import type { TransactionFilters } from '@/lib/types';

// Paginated list of transactions. The FlatList calls fetchNextPage() on scroll.
export function useTransactions(filters: TransactionFilters = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.transactions(filters),
    queryFn: ({ pageParam }) => fetchTransactionsPage(pageParam, filters),
    initialPageParam: 0,
    // If the last page was full, there may be more — ask for the next index.
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
  });
}

// A single transaction (the detail screen).
export function useTransaction(id: string) {
  return useQuery({
    queryKey: queryKeys.transaction(id),
    queryFn: () => fetchTransaction(id),
    enabled: Boolean(id),
  });
}
