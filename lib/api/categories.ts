import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/types';

// All Supabase access for categories lives here. RLS restricts rows to the
// current user automatically, so we don't filter by user_id ourselves.
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw new Error(error.message);
  return (data ?? []) as Category[];
}
