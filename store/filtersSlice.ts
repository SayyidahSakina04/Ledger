import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// UI state the SERVER doesn't own: what the user is currently searching/filtering by.
// (The transactions themselves live in React Query, never here.)
type FiltersState = {
  search: string;
  categoryId: string | null;
};

const initialState: FiltersState = {
  search: '',
  categoryId: null,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setCategoryFilter(state, action: PayloadAction<string | null>) {
      state.categoryId = action.payload;
    },
    clearFilters(state) {
      state.search = '';
      state.categoryId = null;
    },
  },
});

export const { setSearch, setCategoryFilter, clearFilters } =
  filtersSlice.actions;
export default filtersSlice.reducer;
