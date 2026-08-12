import { createSlice } from "@reduxjs/toolkit";
import {
  MasterVehicle,
  MasterVariant,
  MasterColor,
  MasterStockyard,
  MasterLocation,
} from "../types";
import {
  fetchMasterVehicles,
  fetchMasterVariants,
  fetchMasterColors,
  fetchMasterStockyards,
  fetchMasterLocations,
} from "./master.thunks";

interface MasterState {
  vehicles: MasterVehicle[];
  variants: MasterVariant[];
  colors: MasterColor[];
  stockyards: MasterStockyard[];
  locations: MasterLocation[];
  vehiclesLoading: boolean;
  variantsLoading: boolean;
  colorsLoading: boolean;
  stockyardsLoading: boolean;
  locationsLoading: boolean;
  vehiclesHasMore: boolean;
  variantsHasMore: boolean;
  colorsHasMore: boolean;
  stockyardsHasMore: boolean;
  locationsHasMore: boolean;
  vehiclesError: string | null;
  variantsError: string | null;
  colorsError: string | null;
  stockyardsError: string | null;
  locationsError: string | null;
}

const initialState: MasterState = {
  vehicles: [],
  variants: [],
  colors: [],
  stockyards: [],
  locations: [],
  vehiclesLoading: false,
  variantsLoading: false,
  colorsLoading: false,
  stockyardsLoading: false,
  locationsLoading: false,
  vehiclesHasMore: true,
  variantsHasMore: true,
  colorsHasMore: true,
  stockyardsHasMore: true,
  locationsHasMore: true,
  vehiclesError: null,
  variantsError: null,
  colorsError: null,
  stockyardsError: null,
  locationsError: null,
};

const masterSlice = createSlice({
  name: "master",
  initialState,
  reducers: {
    clearMasterData: (state) => {
      state.vehicles = [];
      state.variants = [];
      state.colors = [];
      state.stockyards = [];
      state.locations = [];
      state.vehiclesHasMore = true;
      state.variantsHasMore = true;
      state.colorsHasMore = true;
      state.stockyardsHasMore = true;
      state.locationsHasMore = true;
      state.vehiclesError = null;
      state.variantsError = null;
      state.colorsError = null;
      state.stockyardsError = null;
      state.locationsError = null;
    },
  },
  extraReducers: (builder) => {
    // Vehicles
    builder
      .addCase(fetchMasterVehicles.pending, (state) => {
        state.vehiclesLoading = true;
        state.vehiclesError = null;
      })
      .addCase(fetchMasterVehicles.fulfilled, (state, action) => {
        state.vehiclesLoading = false;
        state.vehicles =
          action.payload.page > 1
            ? [...state.vehicles, ...action.payload.results]
            : action.payload.results;
        state.vehiclesHasMore = action.payload.next !== null;
      })
      .addCase(fetchMasterVehicles.rejected, (state, action) => {
        state.vehiclesLoading = false;
        state.vehiclesError = action.payload ?? "Something went wrong";
      });

    // Variants
    builder
      .addCase(fetchMasterVariants.pending, (state) => {
        state.variantsLoading = true;
        state.variantsError = null;
      })
      .addCase(fetchMasterVariants.fulfilled, (state, action) => {
        state.variantsLoading = false;
        state.variants =
          action.payload.page > 1
            ? [...state.variants, ...action.payload.results]
            : action.payload.results;
        state.variantsHasMore = action.payload.next !== null;
      })
      .addCase(fetchMasterVariants.rejected, (state, action) => {
        state.variantsLoading = false;
        state.variantsError = action.payload ?? "Something went wrong";
      });

    // Colors
    builder
      .addCase(fetchMasterColors.pending, (state) => {
        state.colorsLoading = true;
        state.colorsError = null;
      })
      .addCase(fetchMasterColors.fulfilled, (state, action) => {
        state.colorsLoading = false;
        state.colors =
          action.payload.page > 1
            ? [...state.colors, ...action.payload.results]
            : action.payload.results;
        state.colorsHasMore = action.payload.next !== null;
      })
      .addCase(fetchMasterColors.rejected, (state, action) => {
        state.colorsLoading = false;
        state.colorsError = action.payload ?? "Something went wrong";
      });

    // Stockyards
    builder
      .addCase(fetchMasterStockyards.pending, (state) => {
        state.stockyardsLoading = true;
        state.stockyardsError = null;
      })
      .addCase(fetchMasterStockyards.fulfilled, (state, action) => {
        state.stockyardsLoading = false;
        state.stockyards =
          action.payload.page > 1
            ? [...state.stockyards, ...action.payload.results]
            : action.payload.results;
        state.stockyardsHasMore = action.payload.next !== null;
      })
      .addCase(fetchMasterStockyards.rejected, (state, action) => {
        state.stockyardsLoading = false;
        state.stockyardsError = action.payload ?? "Something went wrong";
      });

    // Locations
    builder
      .addCase(fetchMasterLocations.pending, (state) => {
        state.locationsLoading = true;
        state.locationsError = null;
      })
      .addCase(fetchMasterLocations.fulfilled, (state, action) => {
        state.locationsLoading = false;
        state.locations =
          action.payload.page > 1
            ? [...state.locations, ...action.payload.results]
            : action.payload.results;
        state.locationsHasMore = action.payload.next !== null;
      })
      .addCase(fetchMasterLocations.rejected, (state, action) => {
        state.locationsLoading = false;
        state.locationsError = action.payload ?? "Something went wrong";
      });
  },
});

export const { clearMasterData } = masterSlice.actions;
export default masterSlice.reducer;
