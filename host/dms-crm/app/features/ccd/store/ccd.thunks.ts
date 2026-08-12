// store/ccd/ccd.thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../../utils/extractError";
import { ccdApi } from "../api/ccd.api";
import {
  CCDCustomer,
  CCDListParams,
  CCDModule,
  CCDModuleFieldsResponse,
  CCDModuleResponse,
  CCDResponseDetail,
  CCDResponseListParams,
  CCDResponsePayload,
  JobCardDetail,
  SalesDetail,
} from "../types";

// ============ Existing thunks (fetchModules, fetchModuleFields, etc.) ============

// Fetch CCD modules
export const fetchModules = createAsyncThunk<
  CCDModule[],
  void,
  { rejectValue: string }
>("ccd/fetchModules", async (_, { rejectWithValue }) => {
  try {
    const response = await ccdApi.fetchModules();
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || "Failed to fetch modules");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// Fetch CCD module fields
export const fetchModuleFields = createAsyncThunk<
  CCDModuleFieldsResponse,
  { moduleId: string; params?: CCDListParams },
  { rejectValue: string }
>(
  "ccd/fetchModuleFields",
  async ({ moduleId, params }, { rejectWithValue }) => {
    try {
      const response = await ccdApi.fetchModuleFields(moduleId, params);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(
        response.message || "Failed to fetch module fields",
      );
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// Fetch module customers
export const fetchModuleCustomers = createAsyncThunk<
  {
    customers: CCDCustomer[];
    settings: CCDModuleResponse["results"]["settings"];
    count: number;
    next: string | null;
    previous: string | null;
  },
  { moduleId: number; params?: CCDListParams },
  { rejectValue: string }
>(
  "ccd/fetchModuleCustomers",
  async ({ moduleId, params }, { rejectWithValue }) => {
    try {
      const response = await ccdApi.fetchModuleCustomers(moduleId, params);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || "Failed to fetch customers");
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ============ Retail / Sales ============
export const fetchSalesDetail = createAsyncThunk<
  SalesDetail,
  string,
  { rejectValue: string }
>("ccd/fetchSalesDetail", async (id, { rejectWithValue }) => {
  try {
    const response = await ccdApi.fetchSalesDetail(id);
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch sales details");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// ============ PSF / Job Card ============
export const fetchPsfDetail = createAsyncThunk<
  JobCardDetail,
  string,
  { rejectValue: string }
>("ccd/fetchPsfDetail", async (id, { rejectWithValue }) => {
  try {
    const response = await ccdApi.fetchPsfDetail(id);
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch PSF details");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// ============ CCD Responses ============
// Submit CCD response
export const submitCCDResponse = createAsyncThunk<
  CCDResponseDetail,
  CCDResponsePayload,
  { rejectValue: string }
>(
  "ccd/submitCCDResponse",
  async (payload, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await ccdApi.submitCCDResponse(payload);
      if (response.success && response.data) {
        // Centralized refetch: refresh the visible module list using the same
        // args it was last fetched with, so the new record shows up.
        const { moduleCustomersArgs } = (
          getState() as {
            crmCcd: {
              moduleCustomersArgs: {
                moduleId: number;
                params?: CCDListParams;
              } | null;
            };
          }
        ).crmCcd;
        if (moduleCustomersArgs) {
          dispatch(fetchModuleCustomers(moduleCustomersArgs));
        }
        return response.data;
      }
      return rejectWithValue(
        response.message || "Failed to submit CCD response",
      );
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// Fetch CCD responses
export const fetchCCDResponses = createAsyncThunk<
  { count: number; results: CCDResponseDetail[] },
  CCDResponseListParams | undefined,
  { rejectValue: string }
>("ccd/fetchCCDResponses", async (params, { rejectWithValue }) => {
  try {
    const response = await ccdApi.fetchCCDResponses(params);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || "Failed to fetch CCD responses");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// Fetch CCD response by ID
export const fetchCCDResponseById = createAsyncThunk<
  CCDResponseDetail,
  string,
  { rejectValue: string }
>("ccd/fetchCCDResponseById", async (id, { rejectWithValue }) => {
  try {
    const response = await ccdApi.fetchCCDResponseById(id);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || "Failed to fetch CCD response");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// Update CCD response
export const updateCCDResponse = createAsyncThunk<
  CCDResponseDetail,
  { id: string; payload: Partial<CCDResponsePayload> },
  { rejectValue: string }
>("ccd/updateCCDResponse", async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await ccdApi.updateCCDResponse(id, payload);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || "Failed to update CCD response");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});
