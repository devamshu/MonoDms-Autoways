import { createSlice } from "@reduxjs/toolkit";
import {
  CrmSummary,
  Customer,
  InquiryKindData,
  InquiryStatusData,
  MonthlyConversionData,
  PaymentModeData,
} from "../types";
import {
  fetchCrmSummary,
  fetchCustomerById,
  fetchCustomers,
  fetchInquiryKind,
  fetchInquiryStatus,
  fetchMonthlyConversion,
  fetchPaymentMode,
} from "./dashboard.thunk";

interface DashboardState {
  crmSummary: CrmSummary | null;
  loading: boolean;
  error: string | null;

  inquiryStatus: InquiryStatusData | null;
  inquiryStatusLoading: boolean;

  inquiryKind: InquiryKindData | null;
  inquiryKindLoading: boolean;

  monthlyConversion: MonthlyConversionData | null;
  monthlyConversionLoading: boolean;

  paymentMode: PaymentModeData | null;
  paymentModeLoading: boolean;

  // Customer list
  customers: Customer[];
  customersCount: number;
  customersLoading: boolean;

  // Single customer (lead detail)
  selectedCustomer: Customer | null;
  selectedCustomerLoading: boolean;
}

const initialState: DashboardState = {
  crmSummary: null,
  loading: false,
  error: null,

  inquiryStatus: null,
  inquiryStatusLoading: false,

  inquiryKind: null,
  inquiryKindLoading: false,

  monthlyConversion: null,
  monthlyConversionLoading: false,

  paymentMode: null,
  paymentModeLoading: false,

  customers: [],
  customersCount: 0,
  customersLoading: false,

  selectedCustomer: null,
  selectedCustomerLoading: false,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Summary
      .addCase(fetchCrmSummary.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchCrmSummary.fulfilled, (s, a) => {
        s.loading = false;
        s.crmSummary = a.payload;
      })
      .addCase(fetchCrmSummary.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload ?? "Something went wrong";
      })

      // Inquiry Status
      .addCase(fetchInquiryStatus.pending, (s) => {
        s.inquiryStatusLoading = true;
      })
      .addCase(fetchInquiryStatus.fulfilled, (s, a) => {
        s.inquiryStatusLoading = false;
        s.inquiryStatus = a.payload;
      })
      .addCase(fetchInquiryStatus.rejected, (s) => {
        s.inquiryStatusLoading = false;
      })

      // Inquiry Kind
      .addCase(fetchInquiryKind.pending, (s) => {
        s.inquiryKindLoading = true;
      })
      .addCase(fetchInquiryKind.fulfilled, (s, a) => {
        s.inquiryKindLoading = false;
        s.inquiryKind = a.payload;
      })
      .addCase(fetchInquiryKind.rejected, (s) => {
        s.inquiryKindLoading = false;
      })

      // Monthly Conversion
      .addCase(fetchMonthlyConversion.pending, (s) => {
        s.monthlyConversionLoading = true;
      })
      .addCase(fetchMonthlyConversion.fulfilled, (s, a) => {
        s.monthlyConversionLoading = false;
        s.monthlyConversion = a.payload;
      })
      .addCase(fetchMonthlyConversion.rejected, (s) => {
        s.monthlyConversionLoading = false;
      })

      // Payment Mode
      .addCase(fetchPaymentMode.pending, (s) => {
        s.paymentModeLoading = true;
      })
      .addCase(fetchPaymentMode.fulfilled, (s, a) => {
        s.paymentModeLoading = false;
        s.paymentMode = a.payload;
      })
      .addCase(fetchPaymentMode.rejected, (s) => {
        s.paymentModeLoading = false;
      })

      // Customers list
      .addCase(fetchCustomers.pending, (s) => {
        s.customersLoading = true;
      })
      .addCase(fetchCustomers.fulfilled, (s, a) => {
        s.customersLoading = false;
        s.customers = a.payload.results;
        s.customersCount = a.payload.count;
      })
      .addCase(fetchCustomers.rejected, (s) => {
        s.customersLoading = false;
      })

      // Customer by id (lead detail)
      .addCase(fetchCustomerById.pending, (s) => {
        s.selectedCustomerLoading = true;
        s.selectedCustomer = null;
      })
      .addCase(fetchCustomerById.fulfilled, (s, a) => {
        s.selectedCustomerLoading = false;
        s.selectedCustomer = a.payload;
      })
      .addCase(fetchCustomerById.rejected, (s) => {
        s.selectedCustomerLoading = false;
      });
  },
});

export default dashboardSlice.reducer;
