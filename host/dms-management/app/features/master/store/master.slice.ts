import { createSlice } from "@reduxjs/toolkit";
import {
  MasterBrand,
  MasterDealer,
  MasterFiscalYear,
  MasterVehicle,
} from "../types";
import {
  fetchMasterBrands,
  fetchMasterDealers,
  fetchMasterFiscalYears,
  fetchMasterVehicles,
} from "./master.thunks";

interface MasterState {
  vehicles: MasterVehicle[];
  brands: MasterBrand[];
  dealers: MasterDealer[];
  fiscalYears: MasterFiscalYear[];
  fiscalYearsLoading: boolean;
  fiscalYearsError: string | null;
  vehiclesLoading: boolean;
  brandsLoading: boolean;
  dealersLoading: boolean;
  vehiclesError: string | null;
  brandsError: string | null;
  dealersError: string | null;
}

const initialState: MasterState = {
  vehicles: [],
  brands: [],
  dealers: [],
  fiscalYears: [],
  vehiclesLoading: false,
  brandsLoading: false,
  dealersLoading: false,
  fiscalYearsLoading: false,
  fiscalYearsError: null,
  vehiclesError: null,
  brandsError: null,
  dealersError: null,
};

const masterSlice = createSlice({
  name: "master",
  initialState,
  reducers: {
    clearMasterData: (state) => {
      state.vehicles = [];
      state.brands = [];
      state.dealers = [];
      state.vehiclesError = null;
      state.brandsError = null;
      state.dealersError = null;
      state.vehiclesLoading = false;
      state.brandsLoading = false;
      state.dealersLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMasterVehicles.pending, (state) => {
        state.vehiclesLoading = true;
        state.vehiclesError = null;
      })
      .addCase(fetchMasterVehicles.fulfilled, (state, action) => {
        state.vehiclesLoading = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchMasterVehicles.rejected, (state, action) => {
        state.vehiclesLoading = false;
        state.vehiclesError = action.payload ?? "Something went wrong";
      });

    builder
      .addCase(fetchMasterBrands.pending, (state) => {
        state.brandsLoading = true;
        state.brandsError = null;
      })
      .addCase(fetchMasterBrands.fulfilled, (state, action) => {
        state.brandsLoading = false;
        state.brands = action.payload;
      })
      .addCase(fetchMasterBrands.rejected, (state, action) => {
        state.brandsLoading = false;
        state.brandsError = action.payload ?? "Something went wrong";
      });

    builder
      .addCase(fetchMasterDealers.pending, (state) => {
        state.dealersLoading = true;
        state.dealersError = null;
      })
      .addCase(fetchMasterDealers.fulfilled, (state, action) => {
        state.dealersLoading = false;
        state.dealers = action.payload;
      })
      .addCase(fetchMasterDealers.rejected, (state, action) => {
        state.dealersLoading = false;
        state.dealersError = action.payload ?? "Something went wrong";
      });

    builder
      .addCase(fetchMasterFiscalYears.pending, (state) => {
        state.fiscalYearsLoading = true;
        state.fiscalYearsError = null;
      })
      .addCase(fetchMasterFiscalYears.fulfilled, (state, action) => {
        state.fiscalYearsLoading = false;
        state.fiscalYears = action.payload;
      })
      .addCase(fetchMasterFiscalYears.rejected, (state, action) => {
        state.fiscalYearsLoading = false;
        state.fiscalYearsError = action.payload ?? "Something went wrong";
      });
  },
});

export const { clearMasterData } = masterSlice.actions;
export default masterSlice.reducer;
