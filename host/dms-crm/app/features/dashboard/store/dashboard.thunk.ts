import { createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../../utils/extractError";
import { dashboardApi } from "../api/dashboard.api";
import { CrmSummary } from "../types";

export const fetchCrmSummary = createAsyncThunk<
  CrmSummary,
  void,
  { rejectValue: string }
>("dashboard/fetchCrmSummary", async (_, { rejectWithValue }) => {
  try {
    const response = await dashboardApi.fetchCrmSummary();
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch CRM summary");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});
