import { useDispatch, useSelector, type TypedUseSelectorHook, } from 'react-redux';

import type { AppDispatch, RootState } from './index';

// Typed versions of the Redux hooks — use these everywhere instead of the
// plain ones, so selectors and dispatch are fully typed (no `any`).
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
