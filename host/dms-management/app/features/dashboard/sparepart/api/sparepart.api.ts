import { apiClient } from "../../../../../../../app/services/axios";
import { getApiErrorMessage } from "../../../../utils/extractError";
import {
    InventoryTurnoverData,
    OrderSummaryData,
    OrderVsDispatchData,
    SparepartDashboardFilters,
    SparepartSummaryData,
} from "../types";

type ApiResult<T> = { success: boolean; data?: T; message?: string };

export const sparepartApi = {
  async fetchSummary(
    filters?: SparepartDashboardFilters,
  ): Promise<ApiResult<SparepartSummaryData>> {
    const response = await apiClient.get<{
      data: SparepartSummaryData;
      success: boolean;
      message: string;
    }>("/dashboard/sparepart/summary/", { params: filters });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };
    return {
      success: false,
      message: getApiErrorMessage(
        response,
        "Failed to fetch sparepart summary",
      ),
    };
  },

  async fetchOrderSummary(
    filters?: SparepartDashboardFilters,
  ): Promise<ApiResult<OrderSummaryData>> {
    const response = await apiClient.get<{
      data: OrderSummaryData;
      success: boolean;
      message: string;
    }>("/dashboard/sparepart/order-summary/", { params: filters });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch order summary"),
    };
  },

  async fetchInventoryTurnover(
    filters?: SparepartDashboardFilters,
  ): Promise<ApiResult<InventoryTurnoverData>> {
    const response = await apiClient.get<{
      data: InventoryTurnoverData;
      success: boolean;
      message: string;
    }>("/dashboard/sparepart/monthly-inventory-turnover/", { params: filters });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };
    return {
      success: false,
      message: getApiErrorMessage(
        response,
        "Failed to fetch inventory turnover",
      ),
    };
  },

  async fetchOrderVsDispatch(
    filters?: SparepartDashboardFilters,
  ): Promise<ApiResult<OrderVsDispatchData>> {
    const response = await apiClient.get<{
      data: OrderVsDispatchData;
      success: boolean;
      message: string;
    }>("/dashboard/sparepart/order-vs-dispatch-block-report/", {
      params: filters,
    });

    if (response.success && response.data?.data)
      return { success: true, data: response.data.data };
    return {
      success: false,
      message: getApiErrorMessage(
        response,
        "Failed to fetch order vs dispatch",
      ),
    };
  },
};
