import { createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../../../utils/extractError";
import { dashboardApi } from "../api/dashboard.api";
import {
  CrmDashboardFilters,
  CrmSummary,
  Customer,
  CustomerListParams,
  CustomerListResponse,
  InquiryKindData,
  InquiryStatusData,
  MonthlyConversionData,
  PaymentModeData,
} from "../types";

export const fetchCrmSummary = createAsyncThunk<
  CrmSummary,
  CrmDashboardFilters | undefined,
  { rejectValue: string }
>("dashboard/fetchCrmSummary", async (filters, { rejectWithValue }) => {
  try {
    const response = await dashboardApi.fetchCrmSummary(filters);
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch CRM summary");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchInquiryStatus = createAsyncThunk<
  InquiryStatusData,
  CrmDashboardFilters | undefined,
  { rejectValue: string }
>("dashboard/fetchInquiryStatus", async (filters, { rejectWithValue }) => {
  try {
    const response = await dashboardApi.fetchInquiryStatus(filters);
    if (response.success && response.data) return response.data;
    return rejectWithValue(
      response.message || "Failed to fetch inquiry status",
    );
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchCustomers = createAsyncThunk<
  CustomerListResponse,
  CustomerListParams | undefined,
  { rejectValue: string }
>("customer/fetchCustomers", async (params, { rejectWithValue }) => {
  try {
    const response = await dashboardApi.fetchCustomers(params);
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch customers");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchCustomerById = createAsyncThunk<
  Customer,
  string,
  { rejectValue: string }
>("customer/fetchCustomerById", async (id, { rejectWithValue }) => {
  try {
    const response = await dashboardApi.fetchCustomerById(id);
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch customer");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchInquiryKind = createAsyncThunk<
  InquiryKindData,
  CrmDashboardFilters | undefined,
  { rejectValue: string }
>("dashboard/fetchInquiryKind", async (filters, { rejectWithValue }) => {
  try {
    const response = await dashboardApi.fetchInquiryKind(filters);
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch inquiry kind");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchMonthlyConversion = createAsyncThunk<
  MonthlyConversionData,
  CrmDashboardFilters | undefined,
  { rejectValue: string }
>("dashboard/fetchMonthlyConversion", async (filters, { rejectWithValue }) => {
  try {
    const response = await dashboardApi.fetchMonthlyConversion(filters);
    if (response.success && response.data) return response.data;
    return rejectWithValue(
      response.message || "Failed to fetch monthly conversion",
    );
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchPaymentMode = createAsyncThunk<
  PaymentModeData,
  CrmDashboardFilters | undefined,
  { rejectValue: string }
>("dashboard/fetchPaymentMode", async (filters, { rejectWithValue }) => {
  try {
    const response = await dashboardApi.fetchPaymentMode(filters);
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch payment mode");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});
