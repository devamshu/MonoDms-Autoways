import { apiClient } from "../../../../../../../app/services/axios";
import { getApiErrorMessage } from "@/app/utils/extractError";
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

type ApiResult<T> = { success: boolean; data?: T; message?: string };

// Strip undefined/empty params so axios doesn't send dealer= or fiscal_year=
const buildParams = (filters?: CrmDashboardFilters) => {
  const params: Record<string, string | number> = {};
  if (filters?.fiscal_year != null && filters.fiscal_year !== "")
    params.fiscal_year = filters.fiscal_year;
  if (filters?.dealer != null && filters.dealer !== "")
    params.dealer = filters.dealer;
  return params;
};

export const dashboardApi = {
  async fetchCrmSummary(
    filters?: CrmDashboardFilters,
  ): Promise<ApiResult<CrmSummary>> {
    const response = await apiClient.get<{
      data: CrmSummary;
      message: string;
      success: boolean;
    }>("/dashboard/crm/summary/", { params: buildParams(filters) });
    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch CRM summary"),
    };
  },

  async fetchInquiryStatus(
    filters?: CrmDashboardFilters,
  ): Promise<ApiResult<InquiryStatusData>> {
    const response = await apiClient.get<{
      data: InquiryStatusData;
      message: string;
      success: boolean;
    }>("/dashboard/crm/inquiry-status/", { params: buildParams(filters) });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch inquiry status"),
    };
  },

  async fetchInquiryKind(
    filters?: CrmDashboardFilters,
  ): Promise<ApiResult<InquiryKindData>> {
    const response = await apiClient.get<{
      data: InquiryKindData;
      message: string;
      success: boolean;
    }>("/dashboard/crm/inquiry-kind/", { params: buildParams(filters) });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch inquiry kind"),
    };
  },

  async fetchMonthlyConversion(
    filters?: CrmDashboardFilters,
  ): Promise<ApiResult<MonthlyConversionData>> {
    const response = await apiClient.get<{
      data: MonthlyConversionData;
      message: string;
      success: boolean;
    }>("/dashboard/crm/monthly-lead-deal-conversion/", {
      params: buildParams(filters),
    });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };

    return {
      success: false,
      message: getApiErrorMessage(
        response,
        "Failed to fetch monthly conversion",
      ),
    };
  },

  async fetchPaymentMode(filters?: CrmDashboardFilters) {
    const response = await apiClient.get<{
      data: PaymentModeData;
      success: boolean;
      message: string;
    }>("/dashboard/crm/payment-mode/", { params: filters });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch payment mode"),
    };
  },

  async fetchCustomers(params?: CustomerListParams): Promise<{
    success: boolean;
    data?: CustomerListResponse;
    message?: string;
  }> {
    const response = await apiClient.get<CustomerListResponse>(
      "/crm/inquiry/",
      { params },
    );
    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch customers"),
    };
  },

  async fetchCustomerById(id: string): Promise<{
    success: boolean;
    data?: Customer;
    message?: string;
  }> {
    const response = await apiClient.get<Customer>(`/crm/inquiry/${id}/`);
    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch customer"),
    };
  },
};
