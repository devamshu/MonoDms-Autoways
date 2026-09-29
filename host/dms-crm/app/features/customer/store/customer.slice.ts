// app/features/customer/store/customer.slice.ts - CORRECTED VERSION

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Customer,
  CustomerFormData,
  CustomerListParams,
  EmailEntry,
  InquiryDetail,
  MultiStepFormState,
  PhoneEntry,
  StagedVehicle,
} from "../types";
import {
  fetchCustomerById,
  fetchCustomers,
  fetchInquiryDetail, // Add this import
  submitMultiStepForm,
} from "./customer.thunks";

// Existing customer state
interface CustomerState {
  customers: Customer[];
  currentCustomer: Customer | null;
  currentInquiryDetail: InquiryDetail | null;
  inquiryDetailLoading: boolean;
  count: number;
  loading: boolean;
  error: string | null;
  // Last params used to fetch the list, so mutations can refetch the same view.
  listParams: CustomerListParams | null;
}

// NEW: Multi-step form state
const initialFormState: MultiStepFormState = {
  currentStep: 1,
  formData: {
    name: "",
    inquiry_kind: "",
    address: "",
    source_type: "",
    remarks: "",
    phone: "",
    city: "",
    phone_category: "mobile",
    country_code: "+977",
    email: "",
    email_category: "personal",
    pref_vehicle: "",
    pref_variant: "",
    pref_color: "",
    assigned_to: "",
    existing_vehicle_name: "",
    our_vehicle_name: "",
    existing_vehicle_count: "",
    our_vehicle_count: "",
  },
  vehicleEntries: [],
  phoneEntries: [
    {
      id: Date.now().toString(),
      category: "mobile",
      phone: "",
      country_code: "+977",
      relation: 1,
    },
  ],
  emailEntries: [
    {
      id: (Date.now() + 1).toString(),
      category: "personal",
      email: "",
      relation: 1,
    },
  ],
  addVehicle: false,
  isSubmitting: false,
  error: null,
};

const initialState: CustomerState & { multiStepForm: MultiStepFormState } = {
  customers: [],
  currentCustomer: null,
  currentInquiryDetail: null, // Add this
  count: 0,
  loading: false,
  error: null,
  inquiryDetailLoading: false,
  listParams: null,
  multiStepForm: initialFormState,
};

// Type-safe payload interfaces
interface UpdateFormFieldPayload {
  key: keyof CustomerFormData;
  value: any;
}

interface UpdatePhoneEntryPayload {
  id: string;
  key: keyof Omit<PhoneEntry, "id">;
  value: string | number;
}

interface UpdateEmailEntryPayload {
  id: string;
  key: keyof Omit<EmailEntry, "id">;
  value: string | number;
}

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    // Form field updates
    updateFormField: (state, action: PayloadAction<UpdateFormFieldPayload>) => {
      state.multiStepForm.formData[action.payload.key] = action.payload.value;
    },

    // Multi-step navigation
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.multiStepForm.currentStep = action.payload;
    },

    nextStep: (state) => {
      if (state.multiStepForm.currentStep < 3) {
        state.multiStepForm.currentStep += 1;
      }
    },

    previousStep: (state) => {
      if (state.multiStepForm.currentStep > 1) {
        state.multiStepForm.currentStep -= 1;
      }
    },

    // Staged DMS vehicles (managed by the VehicleCascade component)
    setVehicleEntries: (state, action: PayloadAction<StagedVehicle[]>) => {
      state.multiStepForm.vehicleEntries = action.payload;
    },

    // Phone entries management
    setPhoneEntries: (state, action: PayloadAction<PhoneEntry[]>) => {
      state.multiStepForm.phoneEntries = action.payload;
    },

    addPhoneEntry: (state) => {
      state.multiStepForm.phoneEntries.push({
        id: Date.now().toString(),
        category: "mobile",
        phone: "",
        country_code: "+977",
        relation: 1,
      });
    },

    removePhoneEntry: (state, action: PayloadAction<string>) => {
      if (state.multiStepForm.phoneEntries.length > 1) {
        state.multiStepForm.phoneEntries =
          state.multiStepForm.phoneEntries.filter(
            (p) => p.id !== action.payload,
          );
      }
    },

    // FIXED: Type-safe phone entry update with proper union type
    updatePhoneEntry: (
      state,
      action: PayloadAction<UpdatePhoneEntryPayload>,
    ) => {
      const entry = state.multiStepForm.phoneEntries.find(
        (p) => p.id === action.payload.id,
      );
      if (entry) {
        const { key, value } = action.payload;

        // Type-safe assignment
        if (key === "category") {
          entry.category = value as PhoneEntry["category"];
        } else if (key === "relation") {
          entry.relation = value as number;
        } else if (key === "phone") {
          entry.phone = value as string;
        } else if (key === "country_code") {
          entry.country_code = value as string;
        }
      }
    },

    // Email entries management
    setEmailEntries: (state, action: PayloadAction<EmailEntry[]>) => {
      state.multiStepForm.emailEntries = action.payload;
    },

    addEmailEntry: (state) => {
      state.multiStepForm.emailEntries.push({
        id: (Date.now() + 1).toString(),
        category: "personal",
        email: "",
        relation: 1,
      });
    },

    removeEmailEntry: (state, action: PayloadAction<string>) => {
      if (state.multiStepForm.emailEntries.length > 1) {
        state.multiStepForm.emailEntries =
          state.multiStepForm.emailEntries.filter(
            (e) => e.id !== action.payload,
          );
      }
    },

    // FIXED: Type-safe email entry update with proper union type
    updateEmailEntry: (
      state,
      action: PayloadAction<UpdateEmailEntryPayload>,
    ) => {
      const entry = state.multiStepForm.emailEntries.find(
        (e) => e.id === action.payload.id,
      );
      if (entry) {
        const { key, value } = action.payload;

        // Type-safe assignment
        if (key === "category") {
          entry.category = value as EmailEntry["category"];
        } else if (key === "relation") {
          entry.relation = value as number;
        } else if (key === "email") {
          entry.email = value as string;
        }
      }
    },

    // Vehicle toggle
    setAddVehicle: (state, action: PayloadAction<boolean>) => {
      state.multiStepForm.addVehicle = action.payload;
    },

    // Reset form
    resetMultiStepForm: (state) => {
      state.multiStepForm = { ...initialFormState, currentStep: 1 };
    },

    clearFormError: (state) => {
      state.multiStepForm.error = null;
    },

    // Clear inquiry detail
    clearInquiryDetail: (state) => {
      state.currentInquiryDetail = null;
    },
  },
  extraReducers: (builder) => {
    // Existing customer reducers
    builder
      .addCase(fetchCustomers.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.listParams = action.meta.arg ?? null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.results;
        state.count = action.payload.count;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch customers";
      })
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch customer";
      })
      // Fetch Inquiry Detail - ADD THIS
      // What changed: pending/fulfilled/rejected now flip inquiryDetailLoading
      // instead of the shared loading flag, so the detail slide shows a spinner
      // independently of whether the customer list is loading
      .addCase(fetchInquiryDetail.pending, (state) => {
        state.inquiryDetailLoading = true;
        state.error = null;
      })
      .addCase(fetchInquiryDetail.fulfilled, (state, action) => {
        state.inquiryDetailLoading = false;
        state.currentInquiryDetail = action.payload;
      })
      .addCase(fetchInquiryDetail.rejected, (state, action) => {
        state.inquiryDetailLoading = false;
        state.error = action.payload || "Failed to fetch inquiry details";
      })
      // Form submission handling
      .addCase(submitMultiStepForm.pending, (state) => {
        state.multiStepForm.isSubmitting = true;
        state.multiStepForm.error = null;
      })
      .addCase(submitMultiStepForm.fulfilled, (state) => {
        state.multiStepForm.isSubmitting = false;
        // Reset form on success
        state.multiStepForm = { ...initialFormState, currentStep: 1 };
      })
      .addCase(submitMultiStepForm.rejected, (state, action) => {
        state.multiStepForm.isSubmitting = false;
        state.multiStepForm.error = action.payload || "Failed to submit form";
      });
  },
});

export const {
  updateFormField,
  setCurrentStep,
  nextStep,
  previousStep,
  setVehicleEntries,
  setPhoneEntries,
  addPhoneEntry,
  removePhoneEntry,
  updatePhoneEntry,
  setEmailEntries,
  addEmailEntry,
  removeEmailEntry,
  updateEmailEntry,
  setAddVehicle,
  resetMultiStepForm,
  clearFormError,
  clearInquiryDetail, // Export this
} = customerSlice.actions;

export default customerSlice.reducer;
