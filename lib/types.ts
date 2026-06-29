// types mirroring the Supabase tables. Dates come back as ISO strings.

export type TransactionType = 'income' | 'expense';

// Categories: a shared, predefined reference table for all users.
export type Category = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};

export type Transaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category_id: string | null;
  date: string; // 'YYYY-MM-DD'
  note: string | null;
  payment_method: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
};

// What the form provides when creating/editing (user_id is added server-side).
export type TransactionInput = {
  type: TransactionType;
  amount: number;
  category_id: string | null;
  date: string;
  note?: string | null;
  payment_method?: string | null;
  receipt_url?: string | null;
};

// The list's search/filter inputs (their values live in Redux).
export type TransactionFilters = {
  search?: string;
  categoryId?: string | null;
};
