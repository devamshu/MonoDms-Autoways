// store/ccd/ccd.slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  CCDCustomer,
  CCDListParams,
  CCDModule,
  CCDModuleField,
  CCDModuleSettings,
  CCDResponseDetail,
  Followup,
  JobCardDetail,
  SalesDetail,
} from "../types";
import {
  createFollowup,
  fetchCCDResponseById,
  fetchCCDResponses,
  fetchFollowups,
  fetchModuleCustomers,
  fetchModuleFields,
  fetchModules,
  fetchPsfDetail,
  fetchSalesDetail,
  submitCCDResponse,
  updateCCDResponse,
} from "./ccd.thunks";

interface CCDState {
  // Modules
  modules: CCDModule[];
  activeModuleId: number | null;
  activeModuleType: string | null;

  // Module Fields
  moduleFields: CCDModuleField[];
  moduleFieldsLoading: boolean;

  // Customers
  customers: CCDCustomer[];
  moduleSettings: CCDModuleSettings | null;
  count: number;
  next: string | null;
  previous: string | null;
  // Last args used to fetch module customers, so mutations can refetch the
  // same view (module + page/search/sort).
  moduleCustomersArgs: { moduleId: number; params?: CCDListParams } | null;

  // Responses
  responses: CCDResponseDetail[];
  selectedResponse: CCDResponseDetail | null;
  responsesCount: number;

  // Retail / Sales
  currentSalesDetail: SalesDetail | null;
  salesDetailLoading: boolean;

  // PSF / Job Card
  currentPsfDetail: JobCardDetail | null;
  psfDetailLoading: boolean;

  // Followups
  followups: Followup[];
  followupsCount: number;
  followupsLoading: boolean;
  followupSubmitting: boolean;

  // Loading states
  loading: boolean;
  actionLoading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: CCDState = {
  modules: [],
  activeModuleId: null,
  activeModuleType: null,
  moduleFields: [],
  moduleFieldsLoading: false,
  customers: [],
  moduleSettings: null,
  count: 0,
  next: null,
  previous: null,
  moduleCustomersArgs: null,
  responses: [],
  selectedResponse: null,
  responsesCount: 0,
  followups: [],
  followupsCount: 0,
  followupsLoading: false,
  followupSubmitting: false,
  loading: false,
  actionLoading: false,
  submitting: false,
  error: null,
  currentSalesDetail: null,
  salesDetailLoading: false,
  currentPsfDetail: null,
  psfDetailLoading: false,
};

const ccdSlice = createSlice({
  name: "ccd",
  initialState,
  reducers: {
    setActiveModule: (state, action: PayloadAction<number>) => {
      state.activeModuleId = action.payload;
      const module = state.modules.find((m) => m.id === action.payload);
      state.activeModuleType = module?.module_type || null;
      // Clear customers when switching modules
      state.customers = [];
      state.moduleSettings = null;
      state.count = 0;
      state.moduleFields = [];
    },
    clearCustomers: (state) => {
      state.customers = [];
      state.moduleSettings = null;
      state.count = 0;
      state.next = null;
      state.previous = null;
    },
    clearModuleFields: (state) => {
      state.moduleFields = [];
      state.moduleFieldsLoading = false;
    },
    clearResponses: (state) => {
      state.responses = [];
      state.selectedResponse = null;
      state.responsesCount = 0;
    },
    clearSalesDetail: (state) => {
      state.currentSalesDetail = null;
      state.salesDetailLoading = false;
    },
    clearPsfDetail: (state) => {
      state.currentPsfDetail = null;
      state.psfDetailLoading = false;
    },
    setFollowupMode: (state) => {
      state.activeModuleType = "followup";
      state.activeModuleId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ============ Fetch Modules ============
    builder
      .addCase(fetchModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = Array.isArray(action.payload) ? action.payload : [];

        if (state.modules.length > 0 && !state.activeModuleId) {
          state.activeModuleId = state.modules[0].id;
          state.activeModuleType = state.modules[0].module_type;
        }
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
        state.modules = [];
      });

    // ============ Fetch Module Fields ============
    builder
      .addCase(fetchModuleFields.pending, (state) => {
        state.moduleFieldsLoading = true;
        state.error = null;
      })
      .addCase(fetchModuleFields.fulfilled, (state, action) => {
        state.moduleFieldsLoading = false;
        state.moduleFields = action.payload?.results || [];
      })
      .addCase(fetchModuleFields.rejected, (state, action) => {
        state.moduleFieldsLoading = false;
        state.error = action.payload ?? "Failed to fetch module fields";
        state.moduleFields = [];
      });

    // ============ Fetch Module Customers ============
    builder
      .addCase(fetchModuleCustomers.pending, (state, action) => {
        state.actionLoading = true;
        state.error = null;
        state.moduleCustomersArgs = action.meta.arg;
      })
      .addCase(fetchModuleCustomers.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.customers = action.payload?.customers || [];
        state.moduleSettings = action.payload?.settings || null;
        state.count = action.payload?.count || 0;
        state.next = action.payload?.next || null;
        state.previous = action.payload?.previous || null;
      })
      .addCase(fetchModuleCustomers.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? "Failed to fetch customers";
        state.customers = [];
        state.count = 0;
        console.error("Failed to fetch customers:", state.error);
      });

    // ============ Submit CCD Response ============
    builder
      .addCase(submitCCDResponse.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitCCDResponse.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) {
          state.responses.unshift(action.payload);
          state.responsesCount += 1;
        }
      })
      .addCase(submitCCDResponse.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? "Failed to submit CCD response";
        console.error("Failed to submit CCD response:", state.error);
      });

    // ============ Fetch CCD Responses ============
    builder
      .addCase(fetchCCDResponses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCCDResponses.fulfilled, (state, action) => {
        state.loading = false;
        state.responses = action.payload?.results || [];
        state.responsesCount = action.payload?.count || 0;
      })
      .addCase(fetchCCDResponses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch CCD responses";
      });

    // ============ Fetch CCD Response By ID ============
    builder
      .addCase(fetchCCDResponseById.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(fetchCCDResponseById.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedResponse = action.payload;
      })
      .addCase(fetchCCDResponseById.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? "Failed to fetch CCD response";
      });

    // ============ Update CCD Response ============
    builder
      .addCase(updateCCDResponse.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateCCDResponse.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.responses.findIndex(
          (r) => r.id === action.payload.id,
        );
        if (index !== -1) {
          state.responses[index] = action.payload;
        }
        if (state.selectedResponse?.id === action.payload.id) {
          state.selectedResponse = action.payload;
        }
      })
      .addCase(updateCCDResponse.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? "Failed to update CCD response";
      });

    // ============ Fetch Sales / Retail Detail ============
    builder
      .addCase(fetchSalesDetail.pending, (state) => {
        state.salesDetailLoading = true;
        state.error = null;
      })
      .addCase(fetchSalesDetail.fulfilled, (state, action) => {
        state.salesDetailLoading = false;
        state.currentSalesDetail = action.payload;
      })
      .addCase(fetchSalesDetail.rejected, (state, action) => {
        state.salesDetailLoading = false;
        state.error = action.payload ?? "Failed to fetch sales details";
      });

    // ============ Fetch PSF / Job Card Detail ============
    builder
      .addCase(fetchPsfDetail.pending, (state) => {
        state.psfDetailLoading = true;
        state.error = null;
      })
      .addCase(fetchPsfDetail.fulfilled, (state, action) => {
        state.psfDetailLoading = false;
        state.currentPsfDetail = action.payload;
      })
      .addCase(fetchPsfDetail.rejected, (state, action) => {
        state.psfDetailLoading = false;
        state.error = action.payload ?? "Failed to fetch PSF details";
      });

    // ============ Fetch Followups ============
    builder
      .addCase(fetchFollowups.pending, (state) => {
        state.followupsLoading = true;
        state.error = null;
      })
      .addCase(fetchFollowups.fulfilled, (state, action) => {
        state.followupsLoading = false;
        state.followups = action.payload.results;
        state.followupsCount = action.payload.count;
      })
      .addCase(fetchFollowups.rejected, (state, action) => {
        state.followupsLoading = false;
        state.error = action.payload ?? "Failed to fetch followups";
      });

    // ============ Create Followup ============
    builder
      .addCase(createFollowup.pending, (state) => {
        state.followupSubmitting = true;
        state.error = null;
      })
      .addCase(createFollowup.fulfilled, (state) => {
        state.followupSubmitting = false;
      })
      .addCase(createFollowup.rejected, (state, action) => {
        state.followupSubmitting = false;
        state.error = action.payload ?? "Failed to create followup";
      });
  },
});

export const {
  setActiveModule,
  setFollowupMode,
  clearCustomers,
  clearModuleFields,
  clearResponses,
  clearSalesDetail,
  clearPsfDetail,
  clearError,
} = ccdSlice.actions;

export default ccdSlice.reducer;
