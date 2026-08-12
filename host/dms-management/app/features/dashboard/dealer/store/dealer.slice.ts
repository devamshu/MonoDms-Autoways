import { createSlice } from "@reduxjs/toolkit";
import {
    fetchCustomerStatus,
    fetchDealerSummary,
    fetchLeadConversionMonthly,
    fetchStockPipeline,
} from "../store/dealer.thunks";
import {
    CustomerStatusData,
    DealerSummaryData,
    LeadConversionMonthlyData,
    StockPipelineData,
} from "../types";

interface DealerDashboardState {
  summary: DealerSummaryData | null;
  summaryLoading: boolean;
  error: string | null;

  customerStatus: CustomerStatusData | null;
  customerStatusLoading: boolean;

  stockPipeline: StockPipelineData | null;
  stockPipelineLoading: boolean;

  leadConversion: LeadConversionMonthlyData | null;
  leadConversionLoading: boolean;
}

const initialState: DealerDashboardState = {
  summary: null,
  summaryLoading: false,
  error: null,

  customerStatus: null,
  customerStatusLoading: false,

  stockPipeline: null,
  stockPipelineLoading: false,

  leadConversion: null,
  leadConversionLoading: false,
};

const dealerDashboardSlice = createSlice({
  name: "dealerDashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Summary
      .addCase(fetchDealerSummary.pending, (s) => {
        s.summaryLoading = true;
        s.error = null;
      })
      .addCase(fetchDealerSummary.fulfilled, (s, a) => {
        s.summaryLoading = false;
        s.summary = a.payload;
      })
      .addCase(fetchDealerSummary.rejected, (s, a) => {
        s.summaryLoading = false;
        s.error = a.payload ?? "Something went wrong";
      })

      // Customer Status
      .addCase(fetchCustomerStatus.pending, (s) => {
        s.customerStatusLoading = true;
      })
      .addCase(fetchCustomerStatus.fulfilled, (s, a) => {
        s.customerStatusLoading = false;
        s.customerStatus = a.payload;
      })
      .addCase(fetchCustomerStatus.rejected, (s) => {
        s.customerStatusLoading = false;
      })

      // Stock Pipeline
      .addCase(fetchStockPipeline.pending, (s) => {
        s.stockPipelineLoading = true;
      })
      .addCase(fetchStockPipeline.fulfilled, (s, a) => {
        s.stockPipelineLoading = false;
        s.stockPipeline = a.payload;
      })
      .addCase(fetchStockPipeline.rejected, (s) => {
        s.stockPipelineLoading = false;
      })

      // Lead Conversion Monthly
      .addCase(fetchLeadConversionMonthly.pending, (s) => {
        s.leadConversionLoading = true;
      })
      .addCase(fetchLeadConversionMonthly.fulfilled, (s, a) => {
        s.leadConversionLoading = false;
        s.leadConversion = a.payload;
      })
      .addCase(fetchLeadConversionMonthly.rejected, (s) => {
        s.leadConversionLoading = false;
      });
  },
});

export default dealerDashboardSlice.reducer;
