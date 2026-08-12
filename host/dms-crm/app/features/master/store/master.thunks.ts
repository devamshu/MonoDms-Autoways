import { createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../../utils/extractError";
import { masterApi } from "../api/master.api";
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

export const fetchMasterVehicles = createAsyncThunk<
  MasterVehicle[],
  void,
  { rejectValue: string }
>("master/fetchVehicles", async (_, { rejectWithValue }) => {
  try {
    const response = await masterApi.fetchVehicles();
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch vehicles");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// Loads the DMS combination rows for one master vehicle. The cascade derives
// its variant / color / year options from these and resolves the picked trio
// to the DMS row id sent in the inquiry payload.
export const fetchDmsVehiclesForVehicle = createAsyncThunk<
  DmsVehicle[],
  string,
  { rejectValue: string }
>("master/fetchDmsVehiclesForVehicle", async (vehicleId, { rejectWithValue }) => {
  try {
    const response = await masterApi.fetchDmsVehiclesByVehicleId(vehicleId);
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch vehicle options");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchMasterVariants = createAsyncThunk<
  MasterVariant[],
  void,
  { rejectValue: string }
>("master/fetchVariants", async (_, { rejectWithValue }) => {
  try {
    const response = await masterApi.fetchVariants();
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch variants");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchMasterColors = createAsyncThunk<
  MasterColor[],
  void,
  { rejectValue: string }
>("master/fetchColors", async (_, { rejectWithValue }) => {
  try {
    const response = await masterApi.fetchColors();
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch colors");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchMasterCities = createAsyncThunk<
  MasterCity[],
  void,
  { rejectValue: string }
>("master/fetchCities", async (_, { rejectWithValue }) => {
  try {
    const response = await masterApi.fetchCities();
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch cities");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchMasterCountries = createAsyncThunk<
  MasterCountry[],
  void,
  { rejectValue: string }
>("master/fetchCountries", async (_, { rejectWithValue }) => {
  try {
    const response = await masterApi.fetchCountries();
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch countries");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchMasterInquiryKinds = createAsyncThunk<
  MasterInquiryKind[],
  void,
  { rejectValue: string }
>("master/fetchInquiryKinds", async (_, { rejectWithValue }) => {
  try {
    const response = await masterApi.fetchInquiryKinds();
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch inquiry kinds");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchMasterSourceTypes = createAsyncThunk<
  MasterSourceType[],
  void,
  { rejectValue: string }
>("master/fetchSourceTypes", async (_, { rejectWithValue }) => {
  try {
    const response = await masterApi.fetchSourceTypes();
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch source types");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchMasterDealers = createAsyncThunk<
  MasterDealer[],
  void,
  { rejectValue: string }
>("master/fetchDealers", async (_, { rejectWithValue }) => {
  try {
    const response = await masterApi.fetchDealers();
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch dealers");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchMasterRelations = createAsyncThunk<
  MasterRelation[],
  void,
  { rejectValue: string }
>("master/fetchRelations", async (_, { rejectWithValue }) => {
  try {
    const response = await masterApi.fetchRelation();
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch relations");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchMasterFilterOptions = createAsyncThunk<
  MasterFilterOptions,
  void,
  { rejectValue: string }
>("master/fetchFilterOptions", async (_, { rejectWithValue }) => {
  try {
    const response = await masterApi.fetchFilterOptions();
    if (response.success && response.data) return response.data;
    return rejectWithValue(
      response.message || "Failed to fetch filter options",
    );
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});
