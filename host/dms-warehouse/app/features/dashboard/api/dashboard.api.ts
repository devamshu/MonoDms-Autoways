import { apiClient } from "../../../../../../app/services/axios";
import { getApiErrorMessage } from "../../../utils/extractError";
import { dedupRequest, generateRequestKey } from "../../../utils/requestDedup";
import {
  DashboardParams,
  OrdersDashboardResponse,
  PartsDashboardResponse,
} from "../types";

export const dashboardApi = {
  // Parts summary
  async getPartsSummary(params?: DashboardParams): Promise<{
    success: boolean;
    data?: PartsDashboardResponse;
    message?: string;
  }> {
    const requestKey = generateRequestKey("/dashboard/sparepart/summary/", params);

    return dedupRequest(requestKey, async () => {
      const response = await apiClient.get<PartsDashboardResponse>(
        "/dashboard/sparepart/summary/",
        { params },
      );

      if (response.success && response.data) {
        return { success: true, data: response.data };
      }

      return {
        success: false,
        message: getApiErrorMessage(response, "Failed to fetch parts summary"),
      };
    });
  },

  // Orders summary
  async getOrdersSummary(params?: DashboardParams): Promise<{
    success: boolean;
    data?: OrdersDashboardResponse;
    message?: string;
  }> {
    const requestKey = generateRequestKey("/dashboard/sparepart/order-summary/", params);

    return dedupRequest(requestKey, async () => {
      const response = await apiClient.get<OrdersDashboardResponse>(
        "/dashboard/sparepart/order-summary/",
        { params },
      );

      if (response.success && response.data) {
        return { success: true, data: response.data };
      }

      return {
        success: false,
        message: getApiErrorMessage(response, "Failed to fetch orders summary"),
      };
    });
  },
};
