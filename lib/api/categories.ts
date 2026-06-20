import { log } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/types';

const SCOPE = 'api/categories';

// All Supabase access for categories lives here. Categories are a shared,
// read-only reference table — every signed-in user sees the same predefined
// rows (RLS allows read for all authenticated users; no writes from the app).
export async function fetchCategories(): Promise<Category[]> {
  log.debug(SCOPE, 'fetchCategories');
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    log.error(SCOPE, 'fetchCategories failed', error.message);
    throw new Error(error.message);
  }
  log.debug(SCOPE, 'fetchCategories ok', { count: data?.length ?? 0 });
  return (data ?? []) as Category[];
}
