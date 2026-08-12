import { createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../../utils/extractError";
import { masterApi } from "../api/master.api";
import { MasterBrand, MasterDealer, MasterFiscalYear, MasterVehicle } from "../types";

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

export const fetchMasterBrands = createAsyncThunk<
  MasterBrand[],
  void,
  { rejectValue: string }
>("master/fetchBrands", async (_, { rejectWithValue }) => {
  try {
    const response = await masterApi.fetchBrands();
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch brands");
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

export const fetchMasterFiscalYears = createAsyncThunk<
  MasterFiscalYear[],
  void,
  { rejectValue: string }
>("master/fetchFiscalYears", async (_, { rejectWithValue }) => {
  try {
    const response = await masterApi.fetchFiscalYears();
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch fiscal years");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

