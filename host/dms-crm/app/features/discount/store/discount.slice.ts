import { createSlice } from "@reduxjs/toolkit";
import { Discount } from "../types";
import {
  approveDiscount,
  fetchDiscountById,
  fetchDiscounts,
  rejectDiscount,
  updateDiscountAmount,
} from "./discount.thunks";

interface DiscountState {
  discounts: Discount[];
  count: number;
  next: string | null;
  previous: string | null;
  selectedDiscount: Discount | null;
  loading: boolean;
  error: string | null;
  actionLoading: boolean;
  actionSuccess: string | null;
}

const initialState: DiscountState = {
  discounts: [],
  count: 0,
  next: null,
  previous: null,
  selectedDiscount: null,
  loading: false,
  error: null,
  actionLoading: false,
  actionSuccess: null,
};

const discountSlice = createSlice({
  name: "discount",
  initialState,
  reducers: {
    clearDiscounts: (state) => {
      state.discounts = [];
      state.count = 0;
      state.next = null;
      state.previous = null;
      state.error = null;
    },
    clearSelectedDiscount: (state) => {
      state.selectedDiscount = null;
    },
    clearActionSuccess: (state) => {
      state.actionSuccess = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscounts.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts = action.payload.results;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
      })
      .addCase(fetchDiscounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      });

    builder
      .addCase(fetchDiscountById.pending, (state) => {
        state.loading = true;
        state.selectedDiscount = null;
        state.error = null;
      })
      .addCase(fetchDiscountById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDiscount = action.payload;
      })
      .addCase(fetchDiscountById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      });

    // Approve discount
    builder
      .addCase(approveDiscount.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.actionSuccess = null;
      })
      .addCase(approveDiscount.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = "Discount approved successfully";
        // Update status in selectedDiscount
        if (state.selectedDiscount) {
          state.selectedDiscount.status = "approved";
          state.selectedDiscount.status_display = "Approved";
          if (action.payload.given_discount_amount !== undefined) {
            state.selectedDiscount.given_discount_amount =
              action.payload.given_discount_amount;
          }
        }
        // Update in discounts list
        const index = state.discounts.findIndex(
          (d) => d.id === Number(action.meta.arg),
        );
        if (index !== -1) {
          state.discounts[index].status = "approved";
          state.discounts[index].status_display = "Approved";
          if (action.payload.given_discount_amount !== undefined) {
            state.discounts[index].given_discount_amount =
              action.payload.given_discount_amount;
          }
        }
      })
      .addCase(approveDiscount.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? "Failed to approve discount";
      });

    // Reject discount
    builder
      .addCase(rejectDiscount.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.actionSuccess = null;
      })
      .addCase(rejectDiscount.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = "Discount rejected successfully";
        // Update status in selectedDiscount
        if (state.selectedDiscount) {
          state.selectedDiscount.status = "rejected";
          state.selectedDiscount.status_display = "Rejected";
        }
        // Update in discounts list
        const index = state.discounts.findIndex(
          (d) => d.id === Number(action.meta.arg),
        );
        if (index !== -1) {
          state.discounts[index].status = "rejected";
          state.discounts[index].status_display = "Rejected";
        }
      })
      .addCase(rejectDiscount.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? "Failed to reject discount";
      });

    // Update discount amount
    builder
      .addCase(updateDiscountAmount.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.actionSuccess = null;
      })
      .addCase(updateDiscountAmount.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = "Discount amount updated successfully";
        // Update the discount in the list if it exists
        if (
          state.selectedDiscount &&
          action.payload.given_discount_amount !== undefined
        ) {
          state.selectedDiscount.given_discount_amount =
            action.payload.given_discount_amount;
        }
        // Update in discounts list
        const index = state.discounts.findIndex(
          (d) => d.id === Number(action.meta.arg.id),
        );
        if (
          index !== -1 &&
          action.payload.given_discount_amount !== undefined
        ) {
          state.discounts[index].given_discount_amount =
            action.payload.given_discount_amount;
        }
      })
      .addCase(updateDiscountAmount.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? "Failed to update discount amount";
      });
  },
});

export const {
  clearDiscounts,
  clearSelectedDiscount,
  clearActionSuccess,
  clearError,
} = discountSlice.actions;
export default discountSlice.reducer;
