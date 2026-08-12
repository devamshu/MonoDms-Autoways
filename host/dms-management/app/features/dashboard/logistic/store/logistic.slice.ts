import { createSlice } from "@reduxjs/toolkit";
import {
    DispatchPerformanceData,
    DispatchSummaryData,
    RetailBillingData,
    TopDealerVehicleData,
} from "../types";
import {
    fetchDispatchPerformance,
    fetchDispatchSummary,
    fetchRetailBilling,
    fetchTopDealerVehicle,
} from "./logistic.thunks";

interface LogisticDashboardState {
  dispatchSummary: DispatchSummaryData | null;
  dispatchSummaryLoading: boolean;
  error: string | null;

  dispatchPerformance: DispatchPerformanceData | null;
  dispatchPerformanceLoading: boolean;

  retailBilling: RetailBillingData | null;
  retailBillingLoading: boolean;

  topDealerVehicle: TopDealerVehicleData | null;
  topDealerVehicleLoading: boolean;
}

const initialState: LogisticDashboardState = {
  dispatchSummary: null,
  dispatchSummaryLoading: false,
  error: null,
  dispatchPerformance: null,
  dispatchPerformanceLoading: false,
  retailBilling: null,
  retailBillingLoading: false,
  topDealerVehicle: null,
  topDealerVehicleLoading: false,
};

const logisticDashboardSlice = createSlice({
  name: "logisticDashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Dispatch Summary
      .addCase(fetchDispatchSummary.pending, (s) => {
        s.dispatchSummaryLoading = true;
        s.error = null;
      })
      .addCase(fetchDispatchSummary.fulfilled, (s, a) => {
        s.dispatchSummaryLoading = false;
        s.dispatchSummary = a.payload;
      })
      .addCase(fetchDispatchSummary.rejected, (s, a) => {
        s.dispatchSummaryLoading = false;
        s.error = a.payload ?? "Something went wrong";
      })

      // Dispatch Performance
      .addCase(fetchDispatchPerformance.pending, (s) => {
        s.dispatchPerformanceLoading = true;
      })
      .addCase(fetchDispatchPerformance.fulfilled, (s, a) => {
        s.dispatchPerformanceLoading = false;
        s.dispatchPerformance = a.payload;
      })
      .addCase(fetchDispatchPerformance.rejected, (s) => {
        s.dispatchPerformanceLoading = false;
      })

      // Retail Billing
      .addCase(fetchRetailBilling.pending, (s) => {
        s.retailBillingLoading = true;
      })
      .addCase(fetchRetailBilling.fulfilled, (s, a) => {
        s.retailBillingLoading = false;
        s.retailBilling = a.payload;
      })
      .addCase(fetchRetailBilling.rejected, (s) => {
        s.retailBillingLoading = false;
      })

      // Top Dealer & Vehicle
      .addCase(fetchTopDealerVehicle.pending, (s) => {
        s.topDealerVehicleLoading = true;
      })
      .addCase(fetchTopDealerVehicle.fulfilled, (s, a) => {
        s.topDealerVehicleLoading = false;
        s.topDealerVehicle = a.payload;
      })
      .addCase(fetchTopDealerVehicle.rejected, (s) => {
        s.topDealerVehicleLoading = false;
      });
  },
});

export default logisticDashboardSlice.reducer;
