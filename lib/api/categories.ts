import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/types';

// All Supabase access for categories lives here. Categories are a shared,
// read-only reference table — every signed-in user sees the same predefined
// rows (RLS allows read for all authenticated users; no writes from the app).
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw new Error(error.message);
  return (data ?? []) as Category[];
}
