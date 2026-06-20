import { log } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import type {
  Transaction,
  TransactionFilters,
  TransactionInput,
} from '@/lib/types';

const SCOPE = 'api/transactions';

export const PAGE_SIZE = 20;

// One page of transactions, newest first, with optional search/category filter.
export async function fetchTransactionsPage(
  page: number,
  filters: TransactionFilters,
): Promise<Transaction[]> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  log.debug(SCOPE, 'fetchTransactionsPage', { page, filters });

  let query = supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (filters.search) {
    query = query.ilike('note', `%${filters.search}%`);
  }
  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  const { data, error } = await query;
  if (error) {
    log.error(SCOPE, 'fetchTransactionsPage failed', error.message);
    throw new Error(error.message);
  }
  log.debug(SCOPE, 'fetchTransactionsPage ok', { count: data?.length ?? 0 });
  return (data ?? []) as Transaction[];
}

export async function fetchTransaction(id: string): Promise<Transaction> {
  log.debug(SCOPE, 'fetchTransaction', { id });
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    log.error(SCOPE, 'fetchTransaction failed', error.message);
    throw new Error(error.message);
  }
  return data as Transaction;
}

export async function createTransaction(
  userId: string,
  input: TransactionInput,
): Promise<Transaction> {
  log.info(SCOPE, 'createTransaction', {
    type: input.type,
    amount: input.amount,
  });
  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...input, user_id: userId })
    .select('*')
    .single();

  if (error) {
    log.error(SCOPE, 'createTransaction failed', error.message);
    throw new Error(error.message);
  }
  log.info(SCOPE, 'createTransaction ok', { id: data.id });
  return data as Transaction;
}

export async function updateTransaction(
  id: string,
  input: Partial<TransactionInput>,
): Promise<Transaction> {
  log.info(SCOPE, 'updateTransaction', { id });
  const { data, error } = await supabase
    .from('transactions')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    log.error(SCOPE, 'updateTransaction failed', error.message);
    throw new Error(error.message);
  }
  return data as Transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  log.info(SCOPE, 'deleteTransaction', { id });
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) {
    log.error(SCOPE, 'deleteTransaction failed', error.message);
    throw new Error(error.message);
  }
}
