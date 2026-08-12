import { createSlice } from "@reduxjs/toolkit";
import { CrmSummary } from "../types";
import { fetchCrmSummary } from "./dashboard.thunk";

interface DashboardState {
  crmSummary: CrmSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  crmSummary: null,
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCrmSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCrmSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.crmSummary = action.payload;
      })
      .addCase(fetchCrmSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      });
  },
});

export default dashboardSlice.reducer;
