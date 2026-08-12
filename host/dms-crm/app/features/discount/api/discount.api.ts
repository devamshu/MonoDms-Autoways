import { getApiErrorMessage } from "../../../utils/extractError";
import {
    Discount,
    DiscountActionResponse,
    DiscountListParams,
    DiscountListResponse,
    UpdateAmountPayload,
} from "../types";
import { apiClient } from "../../../../../../app/services/axios";

const withFallback = (discount: Discount): Discount => ({
  ...discount,
  policy_name: discount.policy_name ?? "—",
  vehicle_name: discount.vehicle_name ?? "—",
  remarks: discount.remarks ?? "—",
  intended_for: discount.intended_for ?? "—",
  requested_by_name: discount.requested_by_name ?? "—",
  approved_by_name: discount.approved_by_name ?? "—",
  rejected_by_name: discount.rejected_by_name ?? "—",
});

export const discountApi = {
  async fetchDiscounts(params?: DiscountListParams): Promise<{
    success: boolean;
    data?: DiscountListResponse;
    message?: string;
  }> {
    const response = await apiClient.get<DiscountListResponse>(
      "/crm/discount-request/",
      { params },
    );

    if (response.success && response.data) {
      return {
        success: true,
        data: {
          ...response.data,
          results: response.data.results.map(withFallback),
        },
      };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch discounts"),
    };
  },

  async fetchDiscountById(
    id: string,
  ): Promise<{ success: boolean; data?: Discount; message?: string }> {
    const response = await apiClient.get<Discount>(
      `/crm/discount-request/${id}/`,
    );

    if (response.success && response.data) {
      return { success: true, data: withFallback(response.data) };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch discount"),
    };
  },

  async approveDiscount(id: string): Promise<{
    success: boolean;
    data?: DiscountActionResponse;
    message?: string;
  }> {
    const response = await apiClient.post<DiscountActionResponse>(
      `/crm/discount-request/${id}/approve/`,
      {},
    );

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to approve discount"),
    };
  },

  async rejectDiscount(id: string): Promise<{
    success: boolean;
    data?: DiscountActionResponse;
    message?: string;
  }> {
    const response = await apiClient.post<DiscountActionResponse>(
      `/crm/discount-request/${id}/reject/`,
      {},
    );

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to reject discount"),
    };
  },

  async updateDiscountAmount(
    id: string,
    payload: UpdateAmountPayload,
  ): Promise<{
    success: boolean;
    data?: DiscountActionResponse;
    message?: string;
  }> {
    const response = await apiClient.post<DiscountActionResponse>(
      `/crm/discount-request/${id}/update_amount/`,
      payload,
    );

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to update discount amount"),
    };
  },
};
