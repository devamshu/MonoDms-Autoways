import { createSlice } from "@reduxjs/toolkit";
import {
    CustomerSatisfactionData,
    PostServiceFollowupData,
    ServiceSummaryData,
    TopCsatAchieversData,
    TopFlowAchieversData,
    TopRevenueAchieversData,
} from "../types";
import {
    fetchCsatAchievers,
    fetchCustomerSatisfaction,
    fetchFlowAchievers,
    fetchPostServiceFollowup,
    fetchRevenueAchievers,
    fetchServiceSummary,
} from "./service.thunks";

interface ServiceDashboardState {
  summary: ServiceSummaryData | null;
  summaryLoading: boolean;
  error: string | null;

  flowAchievers: TopFlowAchieversData | null;
  flowAchieversLoading: boolean;

  csatAchievers: TopCsatAchieversData | null;
  csatAchieversLoading: boolean;

  revenueAchievers: TopRevenueAchieversData | null;
  revenueAchieversLoading: boolean;

  postServiceFollowup: PostServiceFollowupData | null;
  postServiceFollowupLoading: boolean;

  customerSatisfaction: CustomerSatisfactionData | null;
  customerSatisfactionLoading: boolean;
}

const initialState: ServiceDashboardState = {
  summary: null,
  summaryLoading: false,
  error: null,
  flowAchievers: null,
  flowAchieversLoading: false,
  csatAchievers: null,
  csatAchieversLoading: false,
  revenueAchievers: null,
  revenueAchieversLoading: false,
  postServiceFollowup: null,
  postServiceFollowupLoading: false,
  customerSatisfaction: null,
  customerSatisfactionLoading: false,
};

const serviceDashboardSlice = createSlice({
  name: "serviceDashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Summary
      .addCase(fetchServiceSummary.pending, (s) => {
        s.summaryLoading = true;
        s.error = null;
      })
      .addCase(fetchServiceSummary.fulfilled, (s, a) => {
        s.summaryLoading = false;
        s.summary = a.payload;
      })
      .addCase(fetchServiceSummary.rejected, (s, a) => {
        s.summaryLoading = false;
        s.error = a.payload ?? "Something went wrong";
      })

      // Flow Achievers
      .addCase(fetchFlowAchievers.pending, (s) => {
        s.flowAchieversLoading = true;
      })
      .addCase(fetchFlowAchievers.fulfilled, (s, a) => {
        s.flowAchieversLoading = false;
        s.flowAchievers = a.payload;
      })
      .addCase(fetchFlowAchievers.rejected, (s) => {
        s.flowAchieversLoading = false;
      })

      // CSAT Achievers
      .addCase(fetchCsatAchievers.pending, (s) => {
        s.csatAchieversLoading = true;
      })
      .addCase(fetchCsatAchievers.fulfilled, (s, a) => {
        s.csatAchieversLoading = false;
        s.csatAchievers = a.payload;
      })
      .addCase(fetchCsatAchievers.rejected, (s) => {
        s.csatAchieversLoading = false;
      })

      // Revenue Achievers
      .addCase(fetchRevenueAchievers.pending, (s) => {
        s.revenueAchieversLoading = true;
      })
      .addCase(fetchRevenueAchievers.fulfilled, (s, a) => {
        s.revenueAchieversLoading = false;
        s.revenueAchievers = a.payload;
      })
      .addCase(fetchRevenueAchievers.rejected, (s) => {
        s.revenueAchieversLoading = false;
      })

      // Post-Service Followup
      .addCase(fetchPostServiceFollowup.pending, (s) => {
        s.postServiceFollowupLoading = true;
      })
      .addCase(fetchPostServiceFollowup.fulfilled, (s, a) => {
        s.postServiceFollowupLoading = false;
        s.postServiceFollowup = a.payload;
      })
      .addCase(fetchPostServiceFollowup.rejected, (s) => {
        s.postServiceFollowupLoading = false;
      })

      // Customer Satisfaction
      .addCase(fetchCustomerSatisfaction.pending, (s) => {
        s.customerSatisfactionLoading = true;
      })
      .addCase(fetchCustomerSatisfaction.fulfilled, (s, a) => {
        s.customerSatisfactionLoading = false;
        s.customerSatisfaction = a.payload;
      })
      .addCase(fetchCustomerSatisfaction.rejected, (s) => {
        s.customerSatisfactionLoading = false;
      });
  },
});

export default serviceDashboardSlice.reducer;
