import { createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../../../utils/extractError";
import { logisticApi } from "../api/logistic.api";
import {
  DispatchPerformanceData,
  DispatchSummaryData,
  LogisticDashboardFilters,
  RetailBillingData,
  TopDealerVehicleData,
} from "../types";

export const fetchDispatchSummary = createAsyncThunk<
  DispatchSummaryData,
  LogisticDashboardFilters | undefined,
  { rejectValue: string }
>("logistic/fetchDispatchSummary", async (filters, { rejectWithValue }) => {
  try {
    const r = await logisticApi.fetchDispatchSummary(filters);
    if (r.success && r.data) return r.data;
    return rejectWithValue(r.message || "Failed to fetch dispatch summary");
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const fetchDispatchPerformance = createAsyncThunk<
  DispatchPerformanceData,
  LogisticDashboardFilters | undefined,
  { rejectValue: string }
>("logistic/fetchDispatchPerformance", async (filters, { rejectWithValue }) => {
  try {
    const r = await logisticApi.fetchDispatchPerformance(filters);
    if (r.success && r.data) return r.data;
    return rejectWithValue(r.message || "Failed to fetch dispatch performance");
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const fetchRetailBilling = createAsyncThunk<
  RetailBillingData,
  LogisticDashboardFilters | undefined,
  { rejectValue: string }
>("logistic/fetchRetailBilling", async (filters, { rejectWithValue }) => {
  try {
    const r = await logisticApi.fetchRetailBilling(filters);
    if (r.success && r.data) return r.data;
    return rejectWithValue(r.message || "Failed to fetch retail billing");
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const fetchTopDealerVehicle = createAsyncThunk<
  TopDealerVehicleData,
  LogisticDashboardFilters | undefined,
  { rejectValue: string }
>("logistic/fetchTopDealerVehicle", async (filters, { rejectWithValue }) => {
  try {
    const r = await logisticApi.fetchTopDealerVehicle(filters);
    if (r.success && r.data) return r.data;
    return rejectWithValue(r.message || "Failed to fetch top dealer/vehicle");
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});
