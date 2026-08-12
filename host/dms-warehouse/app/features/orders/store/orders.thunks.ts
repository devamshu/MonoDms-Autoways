import { createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../../utils/extractError";
import { ordersApi } from "../api/orders.api";
import {
  PartsOrder,
  PartsOrderParams,
  PartsOrderResponse,
  UpdateOrderPayload,
} from "../types";

export const fetchPartsOrders = createAsyncThunk<
  PartsOrderResponse,
  PartsOrderParams | undefined,
  { rejectValue: string }
>("orders/fetchOrders", async (params, { rejectWithValue }) => {
  try {
    const response = await ordersApi.fetchOrders(params);
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch orders");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateOrderParts = createAsyncThunk<
  PartsOrder, // Returns the updated PartsOrder
  { orderId: number; payload: UpdateOrderPayload },
  { rejectValue: string }
>(
  "orders/updateOrderParts",
  async ({ orderId, payload }, { rejectWithValue }) => {
    try {
      const response = await ordersApi.updateOrderParts(orderId, payload);
      if (response.success && response.data) return response.data;
      return rejectWithValue(response.message || "Failed to update order");
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);
