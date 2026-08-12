import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/app/features/store";

// Base selector
const selectMasterState = (state: RootState) => state.master;

// Vehicles selectors
export const selectVehicles = createSelector(
  [selectMasterState],
  (state) => state?.vehicles ?? []
);

export const selectVehiclesLoading = createSelector(
  [selectMasterState],
  (state) => state?.vehiclesLoading ?? false
);

export const selectVehiclesHasMore = createSelector(
  [selectMasterState],
  (state) => state?.vehiclesHasMore ?? false
);

export const selectVehiclesError = createSelector(
  [selectMasterState],
  (state) => state?.vehiclesError ?? null
);

// Variants selectors
export const selectVariants = createSelector(
  [selectMasterState],
  (state) => state?.variants ?? []
);

export const selectVariantsLoading = createSelector(
  [selectMasterState],
  (state) => state?.variantsLoading ?? false
);

export const selectVariantsHasMore = createSelector(
  [selectMasterState],
  (state) => state?.variantsHasMore ?? false
);

export const selectVariantsError = createSelector(
  [selectMasterState],
  (state) => state?.variantsError ?? null
);

// Colors selectors
export const selectColors = createSelector(
  [selectMasterState],
  (state) => state?.colors ?? []
);

export const selectColorsLoading = createSelector(
  [selectMasterState],
  (state) => state?.colorsLoading ?? false
);

export const selectColorsHasMore = createSelector(
  [selectMasterState],
  (state) => state?.colorsHasMore ?? false
);

export const selectColorsError = createSelector(
  [selectMasterState],
  (state) => state?.colorsError ?? null
);

// Stockyards selectors
export const selectStockyards = createSelector(
  [selectMasterState],
  (state) => state?.stockyards ?? []
);

export const selectStockyardsLoading = createSelector(
  [selectMasterState],
  (state) => state?.stockyardsLoading ?? false
);

export const selectStockyardsHasMore = createSelector(
  [selectMasterState],
  (state) => state?.stockyardsHasMore ?? false
);

export const selectStockyardsError = createSelector(
  [selectMasterState],
  (state) => state?.stockyardsError ?? null
);

// Locations selectors
export const selectLocations = createSelector(
  [selectMasterState],
  (state) => state?.locations ?? []
);

export const selectLocationsLoading = createSelector(
  [selectMasterState],
  (state) => state?.locationsLoading ?? false
);

export const selectLocationsHasMore = createSelector(
  [selectMasterState],
  (state) => state?.locationsHasMore ?? false
);

export const selectLocationsError = createSelector(
  [selectMasterState],
  (state) => state?.locationsError ?? null
);

// Combined selectors
export const selectAllMasterData = createSelector(
  [selectVehicles, selectVariants, selectColors, selectStockyards, selectLocations],
  (vehicles, variants, colors, stockyards, locations) => ({
    vehicles,
    variants,
    colors,
    stockyards,
    locations,
  })
);

export const selectAllMasterLoading = createSelector(
  [selectVehiclesLoading, selectVariantsLoading, selectColorsLoading, selectStockyardsLoading, selectLocationsLoading],
  (vehiclesLoading, variantsLoading, colorsLoading, stockyardsLoading, locationsLoading) => ({
    vehiclesLoading,
    variantsLoading,
    colorsLoading,
    stockyardsLoading,
    locationsLoading,
  })
);
