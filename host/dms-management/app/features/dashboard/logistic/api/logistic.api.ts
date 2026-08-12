import { apiClient } from "../../../../../../../app/services/axios";
import { getApiErrorMessage } from "../../../../utils/extractError";
import {
  DispatchPerformanceData,
  DispatchSummaryData,
  LogisticDashboardFilters,
  RetailBillingData,
  TopDealerVehicleData,
} from "../types";

type ApiResult<T> = { success: boolean; data?: T; message?: string };

export const logisticApi = {
  async fetchDispatchSummary(
    filters?: LogisticDashboardFilters,
  ): Promise<ApiResult<DispatchSummaryData>> {
    const response = await apiClient.get<{
      data: DispatchSummaryData;
      success: boolean;
      message: string;
    }>("/dashboard/logistic/dispatch-summery/", { params: filters });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch dispatch summary"),
    };
  },

  async fetchDispatchPerformance(
    filters?: LogisticDashboardFilters,
  ): Promise<ApiResult<DispatchPerformanceData>> {
    const response = await apiClient.get<{
      data: DispatchPerformanceData;
      success: boolean;
      message: string;
    }>("/dashboard/logistic/dispatch-performance-report/", { params: filters });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };
    return {
      success: false,
      message: getApiErrorMessage(
        response,
        "Failed to fetch dispatch performance",
      ),
    };
  },

  async fetchRetailBilling(
    filters?: LogisticDashboardFilters,
  ): Promise<ApiResult<RetailBillingData>> {
    const response = await apiClient.get<{
      data: RetailBillingData;
      success: boolean;
      message: string;
    }>("/dashboard/logistic/retail-billing/", { params: filters });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch retail billing"),
    };
  },

  async fetchTopDealerVehicle(
    filters?: LogisticDashboardFilters,
  ): Promise<ApiResult<TopDealerVehicleData>> {
    const response = await apiClient.get<{
      data: TopDealerVehicleData;
      success: boolean;
      message: string;
    }>("/dashboard/logistic/top-dealer-and-vehicle-report/", {
      params: filters,
    });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };
    return {
      success: false,
      message: getApiErrorMessage(
        response,
        "Failed to fetch top dealer/vehicle report",
      ),
    };
  },
};
