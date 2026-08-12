import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/app/features/store";

// Base selector
const selectDashboardState = (state: RootState) => state.dashboard;

// Parts summary selectors
export const selectPartsData = createSelector(
  [selectDashboardState],
  (state) => state?.partsData ?? null
);

export const selectPartsLoading = createSelector(
  [selectDashboardState],
  (state) => state?.loading?.parts ?? false
);

export const selectPartsError = createSelector(
  [selectDashboardState],
  (state) => state?.error?.parts ?? null
);

// Orders summary selectors
export const selectOrdersData = createSelector(
  [selectDashboardState],
  (state) => state?.ordersData ?? null
);

export const selectOrdersLoading = createSelector(
  [selectDashboardState],
  (state) => state?.loading?.orders ?? false
);

export const selectOrdersError = createSelector(
  [selectDashboardState],
  (state) => state?.error?.orders ?? null
);

// Combined selectors
export const selectDashboardData = createSelector(
  [selectPartsData, selectOrdersData],
  (partsData, ordersData) => ({
    partsData,
    ordersData,
  })
);

export const selectDashboardLoading = createSelector(
  [selectPartsLoading, selectOrdersLoading],
  (partsLoading, ordersLoading) => ({
    partsLoading,
    ordersLoading,
  })
);

export const selectDashboardError = createSelector(
  [selectPartsError, selectOrdersError],
  (partsError, ordersError) => ({
    partsError,
    ordersError,
  })
);

export const selectAllDashboard = createSelector(
  [selectDashboardData, selectDashboardLoading, selectDashboardError],
  (data, loading, error) => ({
    ...data,
    ...loading,
    ...error,
  })
);
