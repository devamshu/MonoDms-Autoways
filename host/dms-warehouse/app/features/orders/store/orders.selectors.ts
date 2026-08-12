import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/app/features/store";

// Base selector
const selectOrdersState = (state: RootState) => state.orders;

// Memoized selectors for orders
export const selectOrders = createSelector(
  [selectOrdersState],
  (state) => state?.orders ?? []
);

export const selectOrdersCount = createSelector(
  [selectOrdersState],
  (state) => state?.count ?? 0
);

export const selectOrdersLoading = createSelector(
  [selectOrdersState],
  (state) => state?.loading ?? false
);

export const selectOrdersUpdating = createSelector(
  [selectOrdersState],
  (state) => state?.updating ?? false
);

export const selectOrdersError = createSelector(
  [selectOrdersState],
  (state) => state?.error ?? null
);

export const selectOrdersNextPage = createSelector(
  [selectOrdersState],
  (state) => state?.next ?? null
);

export const selectOrdersPreviousPage = createSelector(
  [selectOrdersState],
  (state) => state?.previous ?? null
);

// Combined selector for list data
export const selectOrdersListData = createSelector(
  [selectOrders, selectOrdersCount, selectOrdersLoading, selectOrdersError],
  (orders, count, loading, error) => ({
    orders,
    count,
    loading,
    error,
  })
);

// Combined selector for loading states
export const selectOrdersLoadingStates = createSelector(
  [selectOrdersLoading, selectOrdersUpdating],
  (loading, updating) => ({
    loading,
    updating,
  })
);
