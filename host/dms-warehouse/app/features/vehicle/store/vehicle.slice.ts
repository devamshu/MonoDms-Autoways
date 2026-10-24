// src/features/vehicle/store/vehicle.slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { VehicleMode, VehicleStockItem, VehicleType } from "../types";
import { addVehicle, fetchVehicleStockInventory } from "./vehicle.thunks";

// ============ Vehicle Stock State (for list/table) ============
interface VehicleStockState {
  inventory: VehicleStockItem[];
  count: number;
  next: string | null;
  previous: string | null;
  loading: boolean;
  error: string | null;
}

const initialStockState: VehicleStockState = {
  inventory: [],
  count: 0,
  next: null,
  previous: null,
  loading: false,
  error: null,
};

// ============ Vehicle Form State (for add/edit form) ============
export interface VehicleFormData {
  dispatch?: number | null;
  vehicle_id: number | null;
  variant_id: number | null;
  color_id: number | null;
  manufacturing_year: string;
  vehicle_type: VehicleType | null;
  vehicle_mode: VehicleMode | null;
  engine_no: string;
  chassis_no: string;
  battery_no: string;
  motor_no: string;
  frame_no: string;
}

interface VehicleFormState {
  formData: VehicleFormData;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}

const initialFormState: VehicleFormState = {
  formData: {
    dispatch: null,
    vehicle_id: null,
    variant_id: null,
    color_id: null,
    manufacturing_year: "",
    vehicle_type: null,
    vehicle_mode: null,
    engine_no: "",
    chassis_no: "",
    battery_no: "",
    motor_no: "",
    frame_no: "",
  },
  isSubmitting: false,
  error: null,
  success: false,
};

// ============ Combined State ============
interface VehicleState extends VehicleStockState {
  form: VehicleFormState;
}

const initialState: VehicleState = {
  ...initialStockState,
  form: initialFormState,
};

// Type-safe payload interfaces
interface UpdateFormFieldPayload {
  key: keyof VehicleFormData;
  value: string | number | null;
}

const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    // Stock actions
    clearInventory: (state) => {
      state.inventory = [];
      state.count = 0;
      state.next = null;
      state.previous = null;
      state.error = null;
    },

    // Form actions
    updateFormField: (state, action: PayloadAction<UpdateFormFieldPayload>) => {
      const { key, value } = action.payload;
      state.form.formData = {
        ...state.form.formData,
        [key]: value,
      };
      state.form.error = null;
      state.form.success = false;
    },

    resetForm: (state) => {
      state.form.formData = { ...initialFormState.formData };
      state.form.error = null;
      state.form.isSubmitting = false;
      state.form.success = false;
    },

    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.form.isSubmitting = action.payload;
    },

    setFormError: (state, action: PayloadAction<string>) => {
      state.form.error = action.payload;
    },

    clearFormError: (state) => {
      state.form.error = null;
    },

    clearSuccess: (state) => {
      state.form.success = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch inventory (stock)
    builder
      .addCase(fetchVehicleStockInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleStockInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload.results;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
      })
      .addCase(fetchVehicleStockInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      });

    // Add vehicle (form submission)
    builder
      .addCase(addVehicle.pending, (state) => {
        state.form.isSubmitting = true;
        state.form.error = null;
        state.form.success = false;
      })
      .addCase(addVehicle.fulfilled, (state) => {
        state.form.isSubmitting = false;
        state.form.success = true;
        state.form.formData = { ...initialFormState.formData };
      })
      .addCase(addVehicle.rejected, (state, action) => {
        state.form.isSubmitting = false;
        state.form.error = action.payload || "Failed to add vehicle";
        state.form.success = false;
      });
  },
});

// Export all actions
export const {
  clearInventory,
  updateFormField,
  resetForm,
  setSubmitting,
  setFormError,
  clearFormError,
  clearSuccess,
} = vehicleSlice.actions;

export default vehicleSlice.reducer;
