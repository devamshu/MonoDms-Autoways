import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/app/features/store";

// Base selectors
const selectVehicleState = (state: RootState) => state.vehicleStock;

// Memoized selectors for inventory
export const selectVehicleInventory = createSelector(
  [selectVehicleState],
  (state) => state?.inventory ?? []
);

export const selectVehicleCount = createSelector(
  [selectVehicleState],
  (state) => state?.count ?? 0
);

export const selectVehicleLoading = createSelector(
  [selectVehicleState],
  (state) => state?.loading ?? false
);

export const selectVehicleError = createSelector(
  [selectVehicleState],
  (state) => state?.error ?? null
);

export const selectVehicleNextPage = createSelector(
  [selectVehicleState],
  (state) => state?.next ?? null
);

export const selectVehiclePreviousPage = createSelector(
  [selectVehicleState],
  (state) => state?.previous ?? null
);

// Combined selector for list data
export const selectVehicleListData = createSelector(
  [selectVehicleInventory, selectVehicleCount, selectVehicleLoading, selectVehicleError],
  (inventory, count, loading, error) => ({
    inventory,
    count,
    loading,
    error,
  })
);

// Form selectors
const selectVehicleForm = createSelector(
  [selectVehicleState],
  (state) => state?.form ?? null
);

export const selectVehicleFormData = createSelector(
  [selectVehicleForm],
  (form) => form?.formData ?? null
);

export const selectVehicleFormSubmitting = createSelector(
  [selectVehicleForm],
  (form) => form?.isSubmitting ?? false
);

export const selectVehicleFormError = createSelector(
  [selectVehicleForm],
  (form) => form?.error ?? null
);

export const selectVehicleFormSuccess = createSelector(
  [selectVehicleForm],
  (form) => form?.success ?? false
);
