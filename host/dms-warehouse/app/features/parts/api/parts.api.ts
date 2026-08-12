import { apiClient } from "../../../../../../app/services/axios";
import { getApiErrorMessage } from "../../../utils/extractError";
import { dedupRequest, generateRequestKey } from "../../../utils/requestDedup";
import {
  AddPartInventoryLogPayload,
  PartsInventoryLogEnvelope,
  PartsInventoryLogItem,
  PartsInventoryParams,
  PartsInventoryResponse,
} from "../types";

export const partsApi = {
  async fetchInventory(params?: PartsInventoryParams): Promise<{
    success: boolean;
    data?: PartsInventoryResponse;
    message?: string;
  }> {
    const requestKey = generateRequestKey(
      "/stockyard-parts-inventory/",
      params,
    );

    return dedupRequest(requestKey, async () => {
      const response = await apiClient.get<PartsInventoryResponse>(
        "/stockyard-parts-inventory/",
        { params },
      );

      if (response.success && response.data) {
        return { success: true, data: response.data };
      }

      return {
        success: false,
        message: getApiErrorMessage(
          response,
          "Failed to fetch parts inventory",
        ),
      };
    });
  },

  async addInventoryLog(payload: AddPartInventoryLogPayload): Promise<{
    success: boolean;
    data?: PartsInventoryLogItem;
    message?: string;
  }> {
    const response = await apiClient.post<PartsInventoryLogEnvelope>(
      "/parts-inventory-log/",
      payload,
    );

    if (response.success && response.data?.data) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to add part to inventory"),
    };
  },
};
