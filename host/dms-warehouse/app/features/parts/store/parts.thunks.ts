import { createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../../utils/extractError";
import { partsApi } from "../api/parts.api";
import {
  AddPartInventoryLogPayload,
  PartsInventoryLogItem,
  PartsInventoryParams,
  PartsInventoryResponse,
} from "../types";

export const fetchPartsInventory = createAsyncThunk<
  PartsInventoryResponse,
  PartsInventoryParams | undefined,
  { rejectValue: string }
>("parts/fetchInventory", async (params, { rejectWithValue }) => {
  try {
    const response = await partsApi.fetchInventory(params);
    if (response.success && response.data) return response.data;
    return rejectWithValue(
      response.message || "Failed to fetch parts inventory",
    );
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const addPartInventoryLog = createAsyncThunk<
  { data: PartsInventoryLogItem; message: string },
  AddPartInventoryLogPayload,
  { rejectValue: string }
>("parts/addInventoryLog", async (payload, { rejectWithValue }) => {
  try {
    const response = await partsApi.addInventoryLog(payload);
    if (response.success && response.data) {
      return {
        data: response.data,
        message: response.message || "Part added to inventory successfully",
      };
    }
    return rejectWithValue(
      response.message || "Failed to add part to inventory",
    );
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});
