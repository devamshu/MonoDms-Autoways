import { getApiErrorMessage } from "../../../utils/extractError";
import { dedupRequest, generateRequestKey } from "../../../utils/requestDedup";
import {
    PartsOrder,
    PartsOrderParams,
    PartsOrderResponse,
    UpdateOrderPayload,
} from "../types";
import { apiClient } from "../../../../../../app/services/axios";

export const ordersApi = {
  async fetchOrders(params?: PartsOrderParams): Promise<{
    success: boolean;
    data?: PartsOrderResponse;
    message?: string;
  }> {
    const requestKey = generateRequestKey("/logistic-parts-order/", params);

    return dedupRequest(requestKey, async () => {
      const response = await apiClient.get<PartsOrderResponse>(
        "/logistic-parts-order/",
        { params },
      );

      if (response.success && response.data) {
        return { success: true, data: response.data };
      }

      return {
        success: false,
        message: getApiErrorMessage(response, "Failed to fetch orders"),
      };
    });
  },

  // PATCH endpoint - returns the updated PartsOrder object
  async updateOrderParts(
    orderId: number,
    payload: UpdateOrderPayload,
  ): Promise<{
    success: boolean;
    data?: PartsOrder;
    message?: string;
  }> {
    const response = await apiClient.patch<PartsOrder>(
      `/logistic-parts-order/${orderId}/`,
      payload,
    );

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to update order parts"),
    };
  },
};
