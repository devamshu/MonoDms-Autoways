import { apiClient } from "../../../../../../app/services/axios";
import { getApiErrorMessage } from "../../../utils/extractError";
import { dedupRequest, generateRequestKey } from "../../../utils/requestDedup";
import { DealerVehicleParams, DealerVehicleResponse } from "../types";

export const dealerVehicleApi = {
  async fetchInventory(params?: DealerVehicleParams): Promise<{
    success: boolean;
    data?: DealerVehicleResponse;
    message?: string;
  }> {
    const requestKey = generateRequestKey("/dealer-stock/", params);

    return dedupRequest(requestKey, async () => {
      const response = await apiClient.get<DealerVehicleResponse>(
        "/dealer-stock/",
        { params },
      );

      if (response.success && response.data) {
        return { success: true, data: response.data };
      }

      return {
        success: false,
        message: getApiErrorMessage(
          response,
          "Failed to fetch dealer vehicle inventory",
        ),
      };
    });
  },
};
