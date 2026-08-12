import { getApiErrorMessage } from "../../../utils/extractError";
import { CrmSummary } from "../types";
import { apiClient } from "../../../../../../app/services/axios";

export const dashboardApi = {
  async fetchCrmSummary(): Promise<{
    success: boolean;
    data?: CrmSummary;
    message?: string;
  }> {
    const response = await apiClient.get<{
      data: CrmSummary;
      message: string;
      success: boolean;
    }>("/dashboard/crm/summary/");

    if (response.success && response.data?.data) {
      return { success: true, data: response.data.data };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch CRM summary"),
    };
  },
};
