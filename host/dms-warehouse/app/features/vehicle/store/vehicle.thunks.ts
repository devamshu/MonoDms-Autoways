import { createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../../utils/extractError";
import { vehicleStockApi } from "../api/vehicle.api";
import {
  AddVehiclePayload,
  AddVehicleResponse,
  VehicleStockInventoryParams,
  VehicleStockInventoryResponse,
} from "../types";

export const fetchVehicleStockInventory = createAsyncThunk<
  VehicleStockInventoryResponse,
  VehicleStockInventoryParams | undefined,
  { rejectValue: string }
>("vehicleStock/fetchInventory", async (params, { rejectWithValue }) => {
  try {
    const response = await vehicleStockApi.fetchInventory(params);
    if (response.success && response.data) return response.data;
    return rejectWithValue(
      response.message || "Failed to fetch vehicle stock inventory",
    );
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const addVehicle = createAsyncThunk<
  AddVehicleResponse,
  AddVehiclePayload,
  { rejectValue: string }
>("vehicleStock/addVehicle", async (payload, { rejectWithValue }) => {
  try {
    const response = await vehicleStockApi.addVehicle(payload);
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to add vehicle");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});
