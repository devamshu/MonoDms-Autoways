import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/app/features/store";

// Base selector
const selectPartsState = (state: RootState) => state.partStock;

// Memoized selectors for inventory
export const selectPartsInventory = createSelector(
  [selectPartsState],
  (state) => state?.inventory ?? []
);

export const selectPartsCount = createSelector(
  [selectPartsState],
  (state) => state?.count ?? 0
);

export const selectPartsLoading = createSelector(
  [selectPartsState],
  (state) => state?.loading ?? false
);

export const selectPartsError = createSelector(
  [selectPartsState],
  (state) => state?.error ?? null
);

export const selectPartsNextPage = createSelector(
  [selectPartsState],
  (state) => state?.next ?? null
);

export const selectPartsPreviousPage = createSelector(
  [selectPartsState],
  (state) => state?.previous ?? null
);

export const selectPartsInitialLoadDone = createSelector(
  [selectPartsState],
  (state) => state?.initialLoadDone ?? false
);

// Combined selector for list data
export const selectPartsListData = createSelector(
  [selectPartsInventory, selectPartsCount, selectPartsLoading, selectPartsError],
  (inventory, count, loading, error) => ({
    inventory,
    count,
    loading,
    error,
  })
);
