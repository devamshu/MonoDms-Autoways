import { apiClient } from "../../../../../../../app/services/axios";
import { getApiErrorMessage } from "../../../../utils/extractError";
import {
  CustomerSatisfactionData,
  PostServiceFollowupData,
  ServiceDashboardFilters,
  ServiceSummaryData,
  TopCsatAchieversData,
  TopFlowAchieversData,
  TopRevenueAchieversData,
} from "../types";

type ApiResult<T> = { success: boolean; data?: T; message?: string };

export const serviceApi = {
  async fetchSummary(
    filters?: ServiceDashboardFilters,
  ): Promise<ApiResult<ServiceSummaryData>> {
    const response = await apiClient.get<{
      data: ServiceSummaryData;
      success: boolean;
      message: string;
    }>("/dashboard/service/summary/", { params: filters });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch service summary"),
    };
  },

  async fetchFlowAchievers(
    filters?: ServiceDashboardFilters,
  ): Promise<ApiResult<TopFlowAchieversData>> {
    const response = await apiClient.get<{
      data: TopFlowAchieversData;
      success: boolean;
      message: string;
    }>("/dashboard/service/top-flow-achievers/", { params: filters });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch flow achievers"),
    };
  },

  async fetchCsatAchievers(
    filters?: ServiceDashboardFilters,
  ): Promise<ApiResult<TopCsatAchieversData>> {
    const response = await apiClient.get<{
      data: TopCsatAchieversData;
      success: boolean;
      message: string;
    }>("/dashboard/service/top-csat-achievers/", { params: filters });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch CSAT achievers"),
    };
  },

  async fetchRevenueAchievers(
    filters?: ServiceDashboardFilters,
  ): Promise<ApiResult<TopRevenueAchieversData>> {
    const response = await apiClient.get<{
      data: TopRevenueAchieversData;
      success: boolean;
      message: string;
    }>("/dashboard/service/top-revenue-achievers/", { params: filters });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };
    return {
      success: false,
      message: getApiErrorMessage(
        response,
        "Failed to fetch revenue achievers",
      ),
    };
  },

  async fetchPostServiceFollowup(
    filters?: ServiceDashboardFilters,
  ): Promise<ApiResult<PostServiceFollowupData>> {
    const response = await apiClient.get<{
      data: PostServiceFollowupData;
      success: boolean;
      message: string;
    }>("/dashboard/service/post-service-followup/", { params: filters });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };
    return {
      success: false,
      message: getApiErrorMessage(
        response,
        "Failed to fetch post-service followup",
      ),
    };
  },

  async fetchCustomerSatisfaction(
    filters?: ServiceDashboardFilters,
  ): Promise<ApiResult<CustomerSatisfactionData>> {
    const response = await apiClient.get<{
      data: CustomerSatisfactionData;
      success: boolean;
      message: string;
    }>("/dashboard/service/customer-satisfaction-status/", { params: filters });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };
    return {
      success: false,
      message: getApiErrorMessage(
        response,
        "Failed to fetch customer satisfaction",
      ),
    };
  },
};