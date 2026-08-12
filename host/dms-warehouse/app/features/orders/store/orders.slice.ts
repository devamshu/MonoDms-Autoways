import { createSlice } from "@reduxjs/toolkit";
import { PartsOrder } from "../types";
import { fetchPartsOrders, updateOrderParts } from "./orders.thunks";

interface OrdersState {
  orders: PartsOrder[];
  count: number;
  next: string | null;
  previous: string | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
}

const initialState: OrdersState = {
  orders: [],
  count: 0,
  next: null,
  previous: null,
  loading: false,
  error: null,
  updating: false,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrders: (state) => {
      state.orders = [];
      state.count = 0;
      state.next = null;
      state.previous = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPartsOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPartsOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.results;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
      })
      .addCase(fetchPartsOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      })
      // Update order parts - response is a PartsOrder object
      .addCase(updateOrderParts.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateOrderParts.fulfilled, (state, action) => {
        state.updating = false;
        if (!action.payload || typeof action.payload.id !== "number") {
          return;
        }
        // Update the order in the orders array
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrderParts.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload ?? "Failed to update order";
      });
  },
});

export const { clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
