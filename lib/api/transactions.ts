import { supabase } from '@/lib/supabase';
import type {
  Transaction,
  TransactionFilters,
  TransactionInput,
} from '@/lib/types';

export const PAGE_SIZE = 20;

// One page of transactions, newest first, with optional search/category filter.
export async function fetchTransactionsPage(
  page: number,
  filters: TransactionFilters,
): Promise<Transaction[]> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

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
  if (error) throw new Error(error.message);
  return (data ?? []) as Transaction[];
}

export async function fetchTransaction(id: string): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as Transaction;
}

export async function createTransaction(
  userId: string,
  input: TransactionInput,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...input, user_id: userId })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Transaction;
}

export async function updateTransaction(
  id: string,
  input: Partial<TransactionInput>,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
