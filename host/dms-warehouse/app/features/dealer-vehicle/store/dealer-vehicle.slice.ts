import { createSlice } from "@reduxjs/toolkit";
import { DealerVehicleItem } from "../types";
import { fetchDealerVehicleInventory } from "./dealer-vehicle.thunks";

interface DealerVehicleState {
  inventory: DealerVehicleItem[];
  count: number;
  next: string | null;
  previous: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: DealerVehicleState = {
  inventory: [],
  count: 0,
  next: null,
  previous: null,
  loading: false,
  error: null,
};

const dealerVehicleSlice = createSlice({
  name: "dealerVehicle",
  initialState,
  reducers: {
    clearDealerInventory: (state) => {
      state.inventory = [];
      state.count = 0;
      state.next = null;
      state.previous = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDealerVehicleInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDealerVehicleInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload.results;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
      })
      .addCase(fetchDealerVehicleInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      });
  },
});

export const { clearDealerInventory } = dealerVehicleSlice.actions;
export default dealerVehicleSlice.reducer;
