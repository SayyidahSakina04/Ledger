import type { TransactionFilters } from '@/lib/types';

// Centralised React Query keys so caches, invalidation, and optimistic updates all reference the exact same keys.
// Filters are part of the list key, so each filter combination is cached separately.
export const queryKeys = {
  categories: ['categories'] as const,
  transactions: (filters: TransactionFilters = {}) =>
    ['transactions', 'list', filters] as const,
  transaction: (id: string) => ['transactions', 'detail', id] as const,
  reminderSettings: (userId: string) => ['reminderSettings', userId] as const,
};
