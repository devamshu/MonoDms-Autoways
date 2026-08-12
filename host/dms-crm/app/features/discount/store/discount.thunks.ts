import { createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../../utils/extractError";
import { discountApi } from "../api/discount.api";
import { 
  Discount, 
  DiscountListParams, 
  DiscountListResponse,
  UpdateAmountPayload,
  DiscountActionResponse 
} from "../types";

export const fetchDiscounts = createAsyncThunk<
  DiscountListResponse,
  DiscountListParams | undefined,
  { rejectValue: string }
>("discount/fetchDiscounts", async (params, { rejectWithValue }) => {
  try {
    const response = await discountApi.fetchDiscounts(params);
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch discounts");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchDiscountById = createAsyncThunk<
  Discount,
  string,
  { rejectValue: string }
>("discount/fetchDiscountById", async (id, { rejectWithValue }) => {
  try {
    const response = await discountApi.fetchDiscountById(id);
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch discount");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// New thunks
export const approveDiscount = createAsyncThunk<
  DiscountActionResponse,
  string,
  { rejectValue: string }
>("discount/approveDiscount", async (id, { rejectWithValue, dispatch }) => {
  try {
    const response = await discountApi.approveDiscount(id);
    if (response.success && response.data) {
      // Refresh the discount details after approval
      await dispatch(fetchDiscountById(id));
      return response.data;
    }
    return rejectWithValue(response.message || "Failed to approve discount");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const rejectDiscount = createAsyncThunk<
  DiscountActionResponse,
  string,
  { rejectValue: string }
>("discount/rejectDiscount", async (id, { rejectWithValue, dispatch }) => {
  try {
    const response = await discountApi.rejectDiscount(id);
    if (response.success && response.data) {
      // Refresh the discount details after rejection
      await dispatch(fetchDiscountById(id));
      return response.data;
    }
    return rejectWithValue(response.message || "Failed to reject discount");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateDiscountAmount = createAsyncThunk<
  DiscountActionResponse,
  { id: string; payload: UpdateAmountPayload },
  { rejectValue: string }
>("discount/updateDiscountAmount", async ({ id, payload }, { rejectWithValue, dispatch }) => {
  try {
    const response = await discountApi.updateDiscountAmount(id, payload);
    if (response.success && response.data) {
      // Refresh the discount details after amount update
      await dispatch(fetchDiscountById(id));
      return response.data;
    }
    return rejectWithValue(response.message || "Failed to update discount amount");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});