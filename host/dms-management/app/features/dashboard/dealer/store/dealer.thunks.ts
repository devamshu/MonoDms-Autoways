import { createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../../../utils/extractError";
import { dealerApi } from "../api/dealer.api";
import {
  CustomerStatusData,
  DealerDashboardFilters,
  DealerSummaryData,
  LeadConversionMonthlyData,
  StockPipelineData,
} from "../types";

export const fetchDealerSummary = createAsyncThunk<
  DealerSummaryData,
  DealerDashboardFilters | undefined,
  { rejectValue: string }
>("dealer/fetchSummary", async (filters, { rejectWithValue }) => {
  try {
    const response = await dealerApi.fetchSummary(filters);
    if (response.success && response.data) return response.data;
    return rejectWithValue(
      response.message || "Failed to fetch dealer summary",
    );
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchCustomerStatus = createAsyncThunk<
  CustomerStatusData,
  DealerDashboardFilters | undefined,
  { rejectValue: string }
>("dealer/fetchCustomerStatus", async (filters, { rejectWithValue }) => {
  try {
    const response = await dealerApi.fetchCustomerStatus(filters);
    if (response.success && response.data) return response.data;
    return rejectWithValue(
      response.message || "Failed to fetch customer status",
    );
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchStockPipeline = createAsyncThunk<
  StockPipelineData,
  DealerDashboardFilters | undefined,
  { rejectValue: string }
>("dealer/fetchStockPipeline", async (filters, { rejectWithValue }) => {
  try {
    const response = await dealerApi.fetchStockPipeline(filters);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(
      response.message || "Failed to fetch stock pipeline",
    );
  } catch (error) {
    console.error("fetchStockPipeline Error:", error);
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchLeadConversionMonthly = createAsyncThunk<
  LeadConversionMonthlyData,
  DealerDashboardFilters | undefined,
  { rejectValue: string }
>("dealer/fetchLeadConversionMonthly", async (filters, { rejectWithValue }) => {
  try {
    const response = await dealerApi.fetchLeadConversionMonthly(filters);
    if (response.success && response.data) return response.data;
    return rejectWithValue(
      response.message || "Failed to fetch lead conversion",
    );
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});
