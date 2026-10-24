import { apiClient } from "../../../../../../app/services/axios";
import { getApiErrorMessage } from "../../../utils/extractError";
import {
  CCDCustomer,
  CCDListParams,
  CCDModule,
  CCDModuleFieldsResponse,
  CCDModuleResponse,
  CCDResponseDetail,
  CCDResponseListParams,
  CCDResponsePayload,
  Followup,
  FollowupListParams,
  FollowupPayload,
  JobCardDetail,
  SalesDetail,
} from "../types";

// No display placeholders are injected here: callers render through
// formatValue/safeFormat, and a literal "—" would defeat their own
// `?? row.customer?.full_name`-style fallbacks.
export const ccdApi = {
  async fetchModules(): Promise<{
    success: boolean;
    data?: CCDModule[];
    message?: string;
    count?: number;
  }> {
    const response = await apiClient.get<{
      count: number;
      results: CCDModule[];
    }>("/ccd-modules/");

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.results,
        count: response.data.count,
      };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch modules"),
    };
  },

  async fetchModuleFields(
    moduleId: string,
    params?: CCDListParams,
  ): Promise<{
    success: boolean;
    data?: CCDModuleFieldsResponse;
    message?: string;
  }> {
    const response = await apiClient.get<CCDModuleFieldsResponse>(
      `/ccd-modules/${moduleId}/fields/`,
      { params },
    );

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch module fields"),
    };
  },

  async submitCCDResponse(payload: CCDResponsePayload): Promise<{
    success: boolean;
    data?: CCDResponseDetail;
    message?: string;
  }> {
    const response = await apiClient.post<CCDResponseDetail>(
      "/ccd-responses/",
      payload,
    );

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to submit CCD response"),
    };
  },

  async fetchCCDResponses(params?: CCDResponseListParams): Promise<{
    success: boolean;
    data?: { count: number; results: CCDResponseDetail[] };
    message?: string;
  }> {
    const response = await apiClient.get<{
      count: number;
      results: CCDResponseDetail[];
    }>("/ccd-responses/", { params });

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch CCD responses"),
    };
  },

  // Fetch single CCD response by ID
  async fetchCCDResponseById(id: string): Promise<{
    success: boolean;
    data?: CCDResponseDetail;
    message?: string;
  }> {
    const response = await apiClient.get<CCDResponseDetail>(
      `/ccd-responses/${id}/`,
    );

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch CCD response"),
    };
  },

  // Update CCD response
  async updateCCDResponse(
    id: string,
    payload: Partial<CCDResponsePayload>,
  ): Promise<{
    success: boolean;
    data?: CCDResponseDetail;
    message?: string;
  }> {
    const response = await apiClient.patch<CCDResponseDetail>(
      `/ccd-responses/${id}/`,
      payload,
    );

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to update CCD response"),
    };
  },

  async fetchSalesDetail(id: string): Promise<{
    success: boolean;
    data?: SalesDetail;
    message?: string;
  }> {
    const response = await apiClient.get<{ data: SalesDetail }>(
      `/retail/${id}/detail/`,
    );

    if (response.success && response.data) {
      const detail = response.data.data ?? response.data;
      return {
        success: true,
        data: detail as SalesDetail,
      };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch sales details"),
    };
  },

  async fetchPsfDetail(id: string): Promise<{
    success: boolean;
    data?: JobCardDetail;
    message?: string;
  }> {
    const response = await apiClient.get<{ data: JobCardDetail }>(
      `/psf/${id}/detail/`,
    );

    if (response.success && response.data) {
      const detail = response.data.data ?? response.data;
      return {
        success: true,
        data: detail as JobCardDetail,
      };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch job card details"),
    };
  },

  async fetchModuleCustomers(
    moduleId: number,
    params?: CCDListParams,
  ): Promise<{
    success: boolean;
    data?: {
      customers: CCDCustomer[];
      settings: CCDModuleResponse["results"]["settings"];
      count: number;
      next: string | null;
      previous: string | null;
    };
    message?: string;
  }> {
    const response = await apiClient.get<CCDModuleResponse>(
      `/ccd-modules/${moduleId}/customers-list/`,
      { params },
    );

    if (response.success && response.data) {
      // Extract the nested data correctly
      const nestedResults = response.data.results;
      const customers = nestedResults?.results || [];
      const settings = nestedResults?.settings;

      return {
        success: true,
        data: {
          customers,
          settings: settings,
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        },
      };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch customers"),
    };
  },

  async fetchFollowups(params?: FollowupListParams): Promise<{
    success: boolean;
    data?: {
      count: number;
      next: string | null;
      previous: string | null;
      results: Followup[];
    };
    message?: string;
  }> {
    const response = await apiClient.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results: Followup[];
    }>("/crm/followup/", { params });

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch followups"),
    };
  },

  async createFollowup(payload: FollowupPayload): Promise<{
    success: boolean;
    data?: Followup;
    message?: string;
  }> {
    const response = await apiClient.post<Followup>(
      "/crm/followup/",
      payload,
    );

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to create followup"),
    };
  },
};
