import { createSlice } from "@reduxjs/toolkit";
import { PartsInventoryItem } from "../types";
import { fetchPartsInventory } from "./parts.thunks";

interface PartsState {
  inventory: PartsInventoryItem[];
  count: number;
  next: string | null;
  previous: string | null;
  loading: boolean;
  error: string | null;
  initialLoadDone: boolean; // Add this flag
}

const initialState: PartsState = {
  inventory: [],
  count: 0,
  next: null,
  previous: null,
  loading: false,
  error: null,
  initialLoadDone: false, // Initialize as false
};

const partsStockSlice = createSlice({
  name: "parts",
  initialState,
  reducers: {
    clearInventory: (state) => {
      state.inventory = [];
      state.count = 0;
      state.next = null;
      state.previous = null;
      state.error = null;
      state.initialLoadDone = false; // Reset this too
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPartsInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPartsInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload.results;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
        state.initialLoadDone = true;
      })
      .addCase(fetchPartsInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
        state.initialLoadDone = true;
      });
  },
});

export const { clearInventory } = partsStockSlice.actions;
export default partsStockSlice.reducer;
