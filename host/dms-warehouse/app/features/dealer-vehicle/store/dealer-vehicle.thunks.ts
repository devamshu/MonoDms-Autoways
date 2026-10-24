import { createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../../utils/extractError";
import { dealerVehicleApi } from "../api/dealer-vehicle.api";
import {
  DealerVehicleParams,
  DealerVehicleResponse,
} from "../types";

export const fetchDealerVehicleInventory = createAsyncThunk<
  DealerVehicleResponse,
  DealerVehicleParams | undefined,
  { rejectValue: string }
>("dealerVehicle/fetchInventory", async (params, { rejectWithValue }) => {
  try {
    const response = await dealerVehicleApi.fetchInventory(params);
    if (response.success && response.data) return response.data;
    return rejectWithValue(
      response.message || "Failed to fetch dealer vehicle inventory",
    );
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});
