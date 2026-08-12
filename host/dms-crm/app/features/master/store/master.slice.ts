import { createSlice } from "@reduxjs/toolkit";
import {
  DmsVehicle,
  MasterCity,
  MasterColor,
  MasterCountry,
  MasterDealer,
  MasterFilterOptions,
  MasterInquiryKind,
  MasterRelation,
  MasterSourceType,
  MasterVariant,
  MasterVehicle,
} from "../types";
import {
  fetchDmsVehiclesForVehicle,
  fetchMasterCities,
  fetchMasterColors,
  fetchMasterCountries,
  fetchMasterDealers,
  fetchMasterFilterOptions,
  fetchMasterInquiryKinds,
  fetchMasterRelations,
  fetchMasterSourceTypes,
  fetchMasterVariants,
  fetchMasterVehicles,
} from "./master.thunks";

interface MasterState {
  vehicles: MasterVehicle[];
  variants: MasterVariant[];
  colors: MasterColor[];
  cities: MasterCity[];
  countries: MasterCountry[];
  inquiryKinds: MasterInquiryKind[];
  sourceTypes: MasterSourceType[];
  dealers: MasterDealer[];
  relations: MasterRelation[];
  filterOptions: MasterFilterOptions | null;
  // DMS combination rows for the currently-selected vehicle in the cascade.
  dmsVehicles: DmsVehicle[];

  vehiclesLoading: boolean;
  variantsLoading: boolean;
  colorsLoading: boolean;
  citiesLoading: boolean;
  countriesLoading: boolean;
  inquiryKindsLoading: boolean;
  sourceTypesLoading: boolean;
  dealersLoading: boolean;
  relationsLoading: boolean;
  filterOptionsLoading: boolean;
  dmsVehiclesLoading: boolean;

  vehiclesError: string | null;
  variantsError: string | null;
  colorsError: string | null;
  citiesError: string | null;
  countriesError: string | null;
  inquiryKindsError: string | null;
  sourceTypesError: string | null;
  dealersError: string | null;
  relationsError: string | null;
  filterOptionsError: string | null;
  dmsVehiclesError: string | null;
}

const initialState: MasterState = {
  vehicles: [],
  variants: [],
  colors: [],
  cities: [],
  countries: [],
  inquiryKinds: [],
  sourceTypes: [],
  dealers: [],
  relations: [],
  filterOptions: null,
  dmsVehicles: [],

  vehiclesLoading: false,
  variantsLoading: false,
  colorsLoading: false,
  citiesLoading: false,
  countriesLoading: false,
  inquiryKindsLoading: false,
  sourceTypesLoading: false,
  dealersLoading: false,
  relationsLoading: false,
  filterOptionsLoading: false,
  dmsVehiclesLoading: false,

  vehiclesError: null,
  variantsError: null,
  colorsError: null,
  citiesError: null,
  countriesError: null,
  inquiryKindsError: null,
  sourceTypesError: null,
  dealersError: null,
  relationsError: null,
  filterOptionsError: null,
  dmsVehiclesError: null,
};

const masterSlice = createSlice({
  name: "master",
  initialState,
  reducers: {
    clearMasterData: (state) => {
      state.vehicles = [];
      state.variants = [];
      state.colors = [];
      state.cities = [];
      state.countries = [];
      state.inquiryKinds = [];
      state.sourceTypes = [];
      state.dealers = [];
      state.filterOptions = null;

      state.vehiclesError = null;
      state.variantsError = null;
      state.colorsError = null;
      state.citiesError = null;
      state.countriesError = null;
      state.inquiryKindsError = null;
      state.sourceTypesError = null;
      state.dealersError = null;
      state.filterOptionsError = null;

      state.vehiclesLoading = false;
      state.variantsLoading = false;
      state.colorsLoading = false;
      state.citiesLoading = false;
      state.countriesLoading = false;
      state.inquiryKindsLoading = false;
      state.sourceTypesLoading = false;
      state.dealersLoading = false;
      state.filterOptionsLoading = false;
    },

    // Clear the DMS combination list (on vehicle change / cascade unmount).
    resetDmsVehicles: (state) => {
      state.dmsVehicles = [];
      state.dmsVehiclesLoading = false;
      state.dmsVehiclesError = null;
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
        state.vehicles = action.payload;
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
        state.variants = action.payload;
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
        state.colors = action.payload;
      })
      .addCase(fetchMasterColors.rejected, (state, action) => {
        state.colorsLoading = false;
        state.colorsError = action.payload ?? "Something went wrong";
      });

    // Cities
    builder
      .addCase(fetchMasterCities.pending, (state) => {
        state.citiesLoading = true;
        state.citiesError = null;
      })
      .addCase(fetchMasterCities.fulfilled, (state, action) => {
        state.citiesLoading = false;
        state.cities = action.payload;
      })
      .addCase(fetchMasterCities.rejected, (state, action) => {
        state.citiesLoading = false;
        state.citiesError = action.payload ?? "Something went wrong";
      });

    // Countries
    builder
      .addCase(fetchMasterCountries.pending, (state) => {
        state.countriesLoading = true;
        state.countriesError = null;
      })
      .addCase(fetchMasterCountries.fulfilled, (state, action) => {
        state.countriesLoading = false;
        state.countries = action.payload;
      })
      .addCase(fetchMasterCountries.rejected, (state, action) => {
        state.countriesLoading = false;
        state.countriesError = action.payload ?? "Something went wrong";
      });

    // Inquiry Kinds
    builder
      .addCase(fetchMasterInquiryKinds.pending, (state) => {
        state.inquiryKindsLoading = true;
        state.inquiryKindsError = null;
      })
      .addCase(fetchMasterInquiryKinds.fulfilled, (state, action) => {
        state.inquiryKindsLoading = false;
        state.inquiryKinds = action.payload;
      })
      .addCase(fetchMasterInquiryKinds.rejected, (state, action) => {
        state.inquiryKindsLoading = false;
        state.inquiryKindsError = action.payload ?? "Something went wrong";
      });

    // Source Types
    builder
      .addCase(fetchMasterSourceTypes.pending, (state) => {
        state.sourceTypesLoading = true;
        state.sourceTypesError = null;
      })
      .addCase(fetchMasterSourceTypes.fulfilled, (state, action) => {
        state.sourceTypesLoading = false;
        state.sourceTypes = action.payload;
      })
      .addCase(fetchMasterSourceTypes.rejected, (state, action) => {
        state.sourceTypesLoading = false;
        state.sourceTypesError = action.payload ?? "Something went wrong";
      });

    // Dealers
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
      .addCase(fetchMasterRelations.pending, (state) => {
        state.relationsLoading = true;
        state.relationsError = null;
      })
      .addCase(fetchMasterRelations.fulfilled, (state, action) => {
        state.relationsLoading = false;
        state.relations = action.payload;
      })
      .addCase(fetchMasterRelations.rejected, (state, action) => {
        state.relationsLoading = false;
        state.relationsError = action.payload ?? "Something went wrong";
      });
    // Filter Options
    builder
      .addCase(fetchMasterFilterOptions.pending, (state) => {
        state.filterOptionsLoading = true;
        state.filterOptionsError = null;
      })
      .addCase(fetchMasterFilterOptions.fulfilled, (state, action) => {
        state.filterOptionsLoading = false;
        state.filterOptions = action.payload;
      })
      .addCase(fetchMasterFilterOptions.rejected, (state, action) => {
        state.filterOptionsLoading = false;
        state.filterOptionsError = action.payload ?? "Something went wrong";
      });

    // DMS vehicles (cascade combinations)
    builder
      .addCase(fetchDmsVehiclesForVehicle.pending, (state) => {
        state.dmsVehiclesLoading = true;
        state.dmsVehiclesError = null;
      })
      .addCase(fetchDmsVehiclesForVehicle.fulfilled, (state, action) => {
        state.dmsVehiclesLoading = false;
        state.dmsVehicles = action.payload;
      })
      .addCase(fetchDmsVehiclesForVehicle.rejected, (state, action) => {
        state.dmsVehiclesLoading = false;
        state.dmsVehiclesError = action.payload ?? "Something went wrong";
      });
  },
});

export const { clearMasterData, resetDmsVehicles } = masterSlice.actions;
export default masterSlice.reducer;
