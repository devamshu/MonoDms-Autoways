import { createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../../utils/extractError";
import { dashboardApi } from "../api/dashboard.api";
import {
  DashboardParams,
  OrdersDashboardResponse,
  PartsDashboardResponse,
} from "../types";

export const fetchPartsSummary = createAsyncThunk<
  PartsDashboardResponse,
  DashboardParams | undefined,
  { rejectValue: string }
>("dashboard/fetchPartsSummary", async (params, { rejectWithValue }) => {
  try {
    const response = await dashboardApi.getPartsSummary(params);
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch parts summary");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchOrdersSummary = createAsyncThunk<
  OrdersDashboardResponse,
  DashboardParams | undefined,
  { rejectValue: string }
>("dashboard/fetchOrdersSummary", async (params, { rejectWithValue }) => {
  try {
    const response = await dashboardApi.getOrdersSummary(params);
    if (response.success && response.data) return response.data;
    return rejectWithValue(
      response.message || "Failed to fetch orders summary",
    );
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});
