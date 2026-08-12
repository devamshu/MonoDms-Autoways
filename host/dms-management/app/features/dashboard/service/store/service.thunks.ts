import { createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../../../utils/extractError";
import { serviceApi } from "../api/service.api";
import {
    CustomerSatisfactionData,
    PostServiceFollowupData,
    ServiceDashboardFilters,
    ServiceSummaryData,
    TopCsatAchieversData,
    TopFlowAchieversData,
    TopRevenueAchieversData,
} from "../types";

export const fetchServiceSummary = createAsyncThunk<
  ServiceSummaryData,
  ServiceDashboardFilters | undefined,
  { rejectValue: string }
>("service/fetchSummary", async (filters, { rejectWithValue }) => {
  try {
    const r = await serviceApi.fetchSummary(filters);
    if (r.success && r.data) return r.data;
    return rejectWithValue(r.message || "Failed to fetch service summary");
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const fetchFlowAchievers = createAsyncThunk<
  TopFlowAchieversData,
  ServiceDashboardFilters | undefined,
  { rejectValue: string }
>("service/fetchFlowAchievers", async (filters, { rejectWithValue }) => {
  try {
    const r = await serviceApi.fetchFlowAchievers(filters);
    if (r.success && r.data) return r.data;
    return rejectWithValue(r.message || "Failed to fetch flow achievers");
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const fetchCsatAchievers = createAsyncThunk<
  TopCsatAchieversData,
  ServiceDashboardFilters | undefined,
  { rejectValue: string }
>("service/fetchCsatAchievers", async (filters, { rejectWithValue }) => {
  try {
    const r = await serviceApi.fetchCsatAchievers(filters);
    if (r.success && r.data) return r.data;
    return rejectWithValue(r.message || "Failed to fetch CSAT achievers");
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const fetchRevenueAchievers = createAsyncThunk<
  TopRevenueAchieversData,
  ServiceDashboardFilters | undefined,
  { rejectValue: string }
>("service/fetchRevenueAchievers", async (filters, { rejectWithValue }) => {
  try {
    const r = await serviceApi.fetchRevenueAchievers(filters);
    if (r.success && r.data) return r.data;
    return rejectWithValue(r.message || "Failed to fetch revenue achievers");
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const fetchPostServiceFollowup = createAsyncThunk<
  PostServiceFollowupData,
  ServiceDashboardFilters | undefined,
  { rejectValue: string }
>("service/fetchPostServiceFollowup", async (filters, { rejectWithValue }) => {
  try {
    const r = await serviceApi.fetchPostServiceFollowup(filters);
    if (r.success && r.data) return r.data;
    return rejectWithValue(r.message || "Failed to fetch followup");
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const fetchCustomerSatisfaction = createAsyncThunk<
  CustomerSatisfactionData,
  ServiceDashboardFilters | undefined,
  { rejectValue: string }
>("service/fetchCustomerSatisfaction", async (filters, { rejectWithValue }) => {
  try {
    const r = await serviceApi.fetchCustomerSatisfaction(filters);
    if (r.success && r.data) return r.data;
    return rejectWithValue(r.message || "Failed to fetch satisfaction");
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});
