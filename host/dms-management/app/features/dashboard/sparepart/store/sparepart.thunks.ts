import { createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../../../utils/extractError";
import { sparepartApi } from "../api/sparepart.api";
import {
    InventoryTurnoverData,
    OrderSummaryData,
    OrderVsDispatchData,
    SparepartDashboardFilters,
    SparepartSummaryData,
} from "../types";

export const fetchSparepartSummary = createAsyncThunk<
  SparepartSummaryData,
  SparepartDashboardFilters | undefined,
  { rejectValue: string }
>("sparepart/fetchSummary", async (filters, { rejectWithValue }) => {
  try {
    const response = await sparepartApi.fetchSummary(filters);
    if (response.success && response.data) return response.data;
    return rejectWithValue(
      response.message || "Failed to fetch sparepart summary",
    );
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchOrderSummary = createAsyncThunk<
  OrderSummaryData,
  SparepartDashboardFilters | undefined,
  { rejectValue: string }
>("sparepart/fetchOrderSummary", async (filters, { rejectWithValue }) => {
  try {
    const response = await sparepartApi.fetchOrderSummary(filters);
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch order summary");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchInventoryTurnover = createAsyncThunk<
  InventoryTurnoverData,
  SparepartDashboardFilters | undefined,
  { rejectValue: string }
>("sparepart/fetchInventoryTurnover", async (filters, { rejectWithValue }) => {
  try {
    const response = await sparepartApi.fetchInventoryTurnover(filters);
    if (response.success && response.data) return response.data;
    return rejectWithValue(
      response.message || "Failed to fetch inventory turnover",
    );
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchOrderVsDispatch = createAsyncThunk<
  OrderVsDispatchData,
  SparepartDashboardFilters | undefined,
  { rejectValue: string }
>("sparepart/fetchOrderVsDispatch", async (filters, { rejectWithValue }) => {
  try {
    const response = await sparepartApi.fetchOrderVsDispatch(filters);
    if (response.success && response.data) return response.data;
    return rejectWithValue(
      response.message || "Failed to fetch order vs dispatch",
    );
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});
