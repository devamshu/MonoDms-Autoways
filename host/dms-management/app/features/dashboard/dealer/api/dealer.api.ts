import { apiClient } from "../../../../../../../app/services/axios";
import { getApiErrorMessage } from "../../../../utils/extractError";
import {
  CustomerStatusData,
  DealerDashboardFilters,
  DealerSummaryData,
  LeadConversionMonthlyData,
  StockPipelineData,
} from "../types";

type ApiResult<T> = { success: boolean; data?: T; message?: string };

export const dealerApi = {
  async fetchSummary(
    filters?: DealerDashboardFilters,
  ): Promise<ApiResult<DealerSummaryData>> {
    const response = await apiClient.get<{
      data: DealerSummaryData;
      success: boolean;
      message: string;
    }>("/dashboard/dealer/summary/", { params: filters });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch dealer summary"),
    };
  },

  async fetchCustomerStatus(
    filters?: DealerDashboardFilters,
  ): Promise<ApiResult<CustomerStatusData>> {
    const response = await apiClient.get<{
      data: CustomerStatusData;
      success: boolean;
      message: string;
    }>("/dashboard/dealer/customer-status/", { params: filters });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch customer status"),
    };
  },

  async fetchStockPipeline(
    filters?: DealerDashboardFilters,
  ): Promise<ApiResult<StockPipelineData>> {
    const response = await apiClient.get<{
      data: StockPipelineData;
      success: boolean;
      message: string;
    }>("/dashboard/dealer/stock-pipeline-status/", { params: filters });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch stock pipeline"),
    };
  },

  async fetchLeadConversionMonthly(
    filters?: DealerDashboardFilters,
  ): Promise<ApiResult<LeadConversionMonthlyData>> {
    const response = await apiClient.get<{
      data: LeadConversionMonthlyData;
      success: boolean;
      message: string;
    }>("/dashboard/dealer/lead-conversion-monthly/", { params: filters });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };
    return {
      success: false,
      message: getApiErrorMessage(
        response,
        "Failed to fetch lead conversion",
      ),
    };
  },
};