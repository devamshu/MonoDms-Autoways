import { getApiErrorMessage } from "../../../utils/extractError";
import { dedupRequest, generateRequestKey } from "../../../utils/requestDedup";
import {
    AddVehiclePayload,
    AddVehicleResponse,
    VehicleStockInventoryParams,
    VehicleStockInventoryResponse,
} from "../types";
import { apiClient } from "../../../../../../app/services/axios";

export const vehicleStockApi = {
  async fetchInventory(params?: VehicleStockInventoryParams): Promise<{
    success: boolean;
    data?: VehicleStockInventoryResponse;
    message?: string;
  }> {
    const requestKey = generateRequestKey("/logistic-dispatch-vehicle/", params);

    return dedupRequest(requestKey, async () => {
      const response = await apiClient.get<VehicleStockInventoryResponse>(
        "/logistic-dispatch-vehicle/",
        { params },
      );

      if (response.success && response.data) {
        return { success: true, data: response.data };
      }

      return {
        success: false,
        message: getApiErrorMessage(
          response,
          "Failed to fetch vehicle stock inventory",
        ),
      };
    });
  },

  async addVehicle(payload: AddVehiclePayload): Promise<{
    success: boolean;
    data?: AddVehicleResponse;
    message?: string;
  }> {
    const response = await apiClient.post<AddVehicleResponse>(
      "/logistic-dispatch-vehicle/",
      payload,
    );

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to add vehicle"),
    };
  },
};
