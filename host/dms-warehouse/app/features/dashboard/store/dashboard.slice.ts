import { createSlice } from "@reduxjs/toolkit";
import { OrdersDashboardResponse, PartsDashboardResponse } from "../types";
import { fetchOrdersSummary, fetchPartsSummary } from "./dashboard.thunks";

interface DashboardState {
  partsData: PartsDashboardResponse | null;
  ordersData: OrdersDashboardResponse | null;
  loading: {
    parts: boolean;
    orders: boolean;
  };
  error: {
    parts: string | null;
    orders: string | null;
  };
}

const initialState: DashboardState = {
  partsData: null,
  ordersData: null,
  loading: {
    parts: false,
    orders: false,
  },
  error: {
    parts: null,
    orders: null,
  },
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.partsData = null;
      state.ordersData = null;
      state.loading = { parts: false, orders: false };
      state.error = { parts: null, orders: null };
    },
  },
  extraReducers: (builder) => {
    // Parts Summary
    builder
      .addCase(fetchPartsSummary.pending, (state) => {
        state.loading.parts = true;
        state.error.parts = null;
      })
      .addCase(fetchPartsSummary.fulfilled, (state, action) => {
        state.loading.parts = false;
        state.partsData = action.payload;
      })
      .addCase(fetchPartsSummary.rejected, (state, action) => {
        state.loading.parts = false;
        state.error.parts = action.payload ?? "Something went wrong";
      });

    // Orders Summary
    builder
      .addCase(fetchOrdersSummary.pending, (state) => {
        state.loading.orders = true;
        state.error.orders = null;
      })
      .addCase(fetchOrdersSummary.fulfilled, (state, action) => {
        state.loading.orders = false;
        state.ordersData = action.payload;
      })
      .addCase(fetchOrdersSummary.rejected, (state, action) => {
        state.loading.orders = false;
        state.error.orders = action.payload ?? "Something went wrong";
      });
  },
});

export const { clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
