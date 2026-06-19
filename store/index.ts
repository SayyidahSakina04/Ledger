import { configureStore } from '@reduxjs/toolkit';

import filtersReducer from './filtersSlice';

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
  },
});

// Types inferred from the store itself, so they stay correct as we add slices.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
