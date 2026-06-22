import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';

import { useSession } from '@/context/SessionContext';
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from '@/lib/api/transactions';
import { log } from '@/lib/logger';
import { queryKeys } from '@/lib/queryKeys';
import type { Transaction, TransactionInput } from '@/lib/types';

const SCOPE = 'mutation/transactions';

// The cached shape of an infinite transactions list: pages of rows.
type TxListData = InfiniteData<Transaction[]>;

// Prefix that matches every cached list query (all filter combinations).
const LIST_KEY = ['transactions', 'list'] as const;

// --- Create -----------------------------------------------------------------
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { session } = useSession();

  return useMutation({
    mutationFn: (input: TransactionInput) => {
      const userId = session?.user.id;
      if (!userId) throw new Error('Not signed in');
      return createTransaction(userId, input);
    },
    onMutate: async (input) => {
      log.debug(SCOPE, 'create: optimistic insert', { type: input.type });
      // Stop in-flight refetches so they don't overwrite our optimistic change.
      await queryClient.cancelQueries({ queryKey: LIST_KEY });
      const previous = queryClient.getQueriesData<TxListData>({
        queryKey: LIST_KEY,
      });

      // A stand-in row to show instantly; replaced by the real one on refetch.
      const optimistic: Transaction = {
        id: `temp-${Date.now()}`,
        user_id: session?.user.id ?? '',
        type: input.type,
        amount: input.amount,
        category_id: input.category_id,
        date: input.date,
        note: input.note ?? null,
        payment_method: input.payment_method ?? null,
        receipt_url: input.receipt_url ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Prepend it to the first page of every cached list.
      queryClient.setQueriesData<TxListData>({ queryKey: LIST_KEY }, (old) => {
        if (!old) return old;
        const [first, ...rest] = old.pages;
        return { ...old, pages: [[optimistic, ...(first ?? [])], ...rest] };
      });

      return { previous };
    },
    onError: (err, _input, context) => {
      log.error(SCOPE, 'create failed, rolling back', String(err));
      // Roll every list back to its pre-mutation snapshot.
      context?.previous?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
    },
    onSettled: () => {
      log.debug(SCOPE, 'create settled, invalidating lists');
      // Reconcile with the server (replaces the temp row with the real one).
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// --- Update -----------------------------------------------------------------
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<TransactionInput>;
    }) => updateTransaction(id, input),
    onMutate: async ({ id, input }) => {
      log.debug(SCOPE, 'update: optimistic patch', { id });
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previousLists = queryClient.getQueriesData<TxListData>({
        queryKey: LIST_KEY,
      });
      const previousDetail = queryClient.getQueryData<Transaction>(
        queryKeys.transaction(id),
      );

      // Patch the row wherever it appears in any list.
      queryClient.setQueriesData<TxListData>({ queryKey: LIST_KEY }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((t) => (t.id === id ? { ...t, ...input } : t)),
          ),
        };
      });
      // Patch the detail cache too.
      if (previousDetail) {
        queryClient.setQueryData<Transaction>(queryKeys.transaction(id), {
          ...previousDetail,
          ...input,
        });
      }

      return { previousLists, previousDetail, id };
    },
    onError: (err, _vars, context) => {
      log.error(SCOPE, 'update failed, rolling back', String(err));
      context?.previousLists?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
      if (context?.previousDetail) {
        queryClient.setQueryData(
          queryKeys.transaction(context.id),
          context.previousDetail,
        );
      }
    },
    onSettled: () => {
      log.debug(SCOPE, 'update settled, invalidating');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// --- Delete -----------------------------------------------------------------
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onMutate: async (id) => {
      log.debug(SCOPE, 'delete: optimistic remove', { id });
      await queryClient.cancelQueries({ queryKey: LIST_KEY });
      const previous = queryClient.getQueriesData<TxListData>({
        queryKey: LIST_KEY,
      });

      // Remove the row from every list immediately.
      queryClient.setQueriesData<TxListData>({ queryKey: LIST_KEY }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => page.filter((t) => t.id !== id)),
        };
      });

      return { previous };
    },
    onError: (err, _id, context) => {
      log.error(SCOPE, 'delete failed, rolling back', String(err));
      context?.previous?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
    },
    onSettled: (_data, _err, id) => {
      log.debug(SCOPE, 'delete settled, invalidating lists');
      // Only refresh the lists. Invalidating the whole 'transactions' prefix
      // would also refetch this row's detail — which is now gone, so .single()
      // would throw "Cannot coerce the result to a single JSON object".
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
      // Drop the deleted row's detail cache outright (no refetch).
      queryClient.removeQueries({ queryKey: queryKeys.transaction(id) });
    },
  });
}
