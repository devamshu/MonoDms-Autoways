import { createSlice } from "@reduxjs/toolkit";
import {
    fetchInventoryTurnover,
    fetchOrderSummary,
    fetchOrderVsDispatch,
    fetchSparepartSummary,
} from "../../sparepart/store/sparepart.thunks";
import {
    InventoryTurnoverData,
    OrderSummaryData,
    OrderVsDispatchData,
    SparepartSummaryData,
} from "../types";

interface SparepartDashboardState {
  summary: SparepartSummaryData | null;
  summaryLoading: boolean;
  error: string | null;
  orderSummary: OrderSummaryData | null;
  orderSummaryLoading: boolean;
  inventoryTurnover: InventoryTurnoverData | null;
  inventoryTurnoverLoading: boolean;
  orderVsDispatch: OrderVsDispatchData | null;
  orderVsDispatchLoading: boolean;
}

const initialState: SparepartDashboardState = {
  summary: null,
  summaryLoading: false,
  error: null,

  orderSummary: null,
  orderSummaryLoading: false,

  inventoryTurnover: null,
  inventoryTurnoverLoading: false,

  orderVsDispatch: null,
  orderVsDispatchLoading: false,
};

const sparepartDashboardSlice = createSlice({
  name: "sparepartDashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Summary
      .addCase(fetchSparepartSummary.pending, (s) => {
        s.summaryLoading = true;
        s.error = null;
      })
      .addCase(fetchSparepartSummary.fulfilled, (s, a) => {
        s.summaryLoading = false;
        s.summary = a.payload;
      })
      .addCase(fetchSparepartSummary.rejected, (s, a) => {
        s.summaryLoading = false;
        s.error = a.payload ?? "Something went wrong";
      })

      // Order Summary
      .addCase(fetchOrderSummary.pending, (s) => {
        s.orderSummaryLoading = true;
      })
      .addCase(fetchOrderSummary.fulfilled, (s, a) => {
        s.orderSummaryLoading = false;
        s.orderSummary = a.payload;
      })
      .addCase(fetchOrderSummary.rejected, (s) => {
        s.orderSummaryLoading = false;
      })

      // Inventory Turnover
      .addCase(fetchInventoryTurnover.pending, (s) => {
        s.inventoryTurnoverLoading = true;
      })
      .addCase(fetchInventoryTurnover.fulfilled, (s, a) => {
        s.inventoryTurnoverLoading = false;
        s.inventoryTurnover = a.payload;
      })
      .addCase(fetchInventoryTurnover.rejected, (s) => {
        s.inventoryTurnoverLoading = false;
      })

      // Order vs Dispatch
      .addCase(fetchOrderVsDispatch.pending, (s) => {
        s.orderVsDispatchLoading = true;
      })
      .addCase(fetchOrderVsDispatch.fulfilled, (s, a) => {
        s.orderVsDispatchLoading = false;
        s.orderVsDispatch = a.payload;
      })
      .addCase(fetchOrderVsDispatch.rejected, (s) => {
        s.orderVsDispatchLoading = false;
      });
  },
});

export default sparepartDashboardSlice.reducer;
