import { createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../../utils/extractError";
import { masterApi } from "../api/master.api";
import {
  MasterColor,
  MasterDealer,
  MasterLocation,
  MasterStockyard,
  MasterVariant,
  MasterVehicle,
} from "../types";

export const fetchMasterVehicles = createAsyncThunk<
  { results: MasterVehicle[]; next: string | null; page: number },
  { page?: number } | void,
  { rejectValue: string }
>("warehouseMaster/fetchVehicles", async (params, { rejectWithValue }) => {
  try {
    const page = params?.page ?? 1;
    const response = await masterApi.fetchVehicles({ page });
    if (response.success && response.data) {
      return { results: response.data.results, next: response.data.next, page };
    }
    return rejectWithValue(response.message || "Failed to fetch vehicles");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchMasterVariants = createAsyncThunk<
  { results: MasterVariant[]; next: string | null; page: number },
  { page?: number } | void,
  { rejectValue: string }
>("warehouseMaster/fetchVariants", async (params, { rejectWithValue }) => {
  try {
    const page = params?.page ?? 1;
    const response = await masterApi.fetchVariants({ page });
    if (response.success && response.data) {
      return { results: response.data.results, next: response.data.next, page };
    }
    return rejectWithValue(response.message || "Failed to fetch variants");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchMasterColors = createAsyncThunk<
  { results: MasterColor[]; next: string | null; page: number },
  { page?: number } | void,
  { rejectValue: string }
>("warehouseMaster/fetchColors", async (params, { rejectWithValue }) => {
  try {
    const page = params?.page ?? 1;
    const response = await masterApi.fetchColors({ page });
    if (response.success && response.data) {
      return { results: response.data.results, next: response.data.next, page };
    }
    return rejectWithValue(response.message || "Failed to fetch colors");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchMasterDealers = createAsyncThunk<
  { results: MasterDealer[]; next: string | null; page: number },
  { page?: number } | void,
  { rejectValue: string }
>("warehouseMaster/fetchDealers", async (params, { rejectWithValue }) => {
  try {
    const page = params?.page ?? 1;
    const response = await masterApi.fetchDealers({ page });
    if (response.success && response.data) {
      return { results: response.data.results, next: response.data.next, page };
    }
    return rejectWithValue(response.message || "Failed to fetch dealers");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchMasterStockyards = createAsyncThunk<
  { results: MasterStockyard[]; next: string | null; page: number },
  { page?: number } | void,
  { rejectValue: string }
>("warehouseMaster/fetchStockyards", async (params, { rejectWithValue }) => {
  try {
    const page = params?.page ?? 1;
    const response = await masterApi.fetchStockyards({ page });
    if (response.success && response.data) {
      return { results: response.data.results, next: response.data.next, page };
    }
    return rejectWithValue(response.message || "Failed to fetch stockyards");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchMasterLocations = createAsyncThunk<
  { results: MasterLocation[]; next: string | null; page: number },
  { stockyard?: number; page?: number } | void,
  { rejectValue: string }
>("warehouseMaster/fetchLocations", async (params, { rejectWithValue }) => {
  try {
    const page = params?.page ?? 1;
    const response = await masterApi.fetchLocations({
      stockyard: params?.stockyard,
      page,
    });
    if (response.success && response.data) {
      return { results: response.data.results, next: response.data.next, page };
    }
    return rejectWithValue(response.message || "Failed to fetch locations");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});
