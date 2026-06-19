import { useQuery } from '@tanstack/react-query';

import { fetchCategories } from '@/lib/api/categories';
import { queryKeys } from '@/lib/queryKeys';

// Loads the user's categories. Screens read this instead of fetching directly.
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: fetchCategories,
  });
}
