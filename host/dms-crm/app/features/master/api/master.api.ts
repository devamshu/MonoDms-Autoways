import { getApiErrorMessage } from "../../../utils/extractError";
import {
    DmsVehicle,
    MasterCity,
    MasterColor,
    MasterCountry,
    MasterDealer,
    MasterFilterOptions,
    MasterInquiryKind,
    MasterRelation,
    MasterSourceType,
    MasterVariant,
    MasterVehicle,
} from "../types";
import { apiClient } from "../../../../../../app/services/axios";

export const masterApi = {
  // Vehicles
  async fetchVehicles(): Promise<{
    success: boolean;
    data?: MasterVehicle[];
    message?: string;
  }> {
    const response = await apiClient.get<{ results: MasterVehicle[] }>(
      "/master-vehicle/",
    );

    if (response.success && response.data) {
      return { success: true, data: response.data.results };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch vehicles"),
    };
  },

  // DMS vehicle combinations for a given master vehicle. Each row pairs a
  // vehicle with a variant + color (+ year); its `id` is what the inquiry
  // payload's `vehicle` array needs. page_size is large so every combination
  // for the vehicle arrives on one page (variant/color/year are derived from
  // these rows client-side).
  async fetchDmsVehiclesByVehicleId(vehicleId: string | number): Promise<{
    success: boolean;
    data?: DmsVehicle[];
    message?: string;
  }> {
    const response = await apiClient.get<{ results: DmsVehicle[] }>(
      "/dms-vehicle/",
      { params: { vehicle__id: vehicleId, page_size: 1000 } },
    );

    if (response.success && response.data) {
      return { success: true, data: response.data.results };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch vehicle options"),
    };
  },

  // Variants
  async fetchVariants(): Promise<{
    success: boolean;
    data?: MasterVariant[];
    message?: string;
  }> {
    const response = await apiClient.get<{ results: MasterVariant[] }>(
      "/master-variant/",
    );

    if (response.success && response.data) {
      return { success: true, data: response.data.results };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch variants"),
    };
  },

  // Colors
  async fetchColors(): Promise<{
    success: boolean;
    data?: MasterColor[];
    message?: string;
  }> {
    const response = await apiClient.get<{ results: MasterColor[] }>(
      "/master-color/",
    );

    if (response.success && response.data) {
      return { success: true, data: response.data.results };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch colors"),
    };
  },

  // Cities
  async fetchCities(): Promise<{
    success: boolean;
    data?: MasterCity[];
    message?: string;
  }> {
    const response = await apiClient.get<{ results: MasterCity[] }>(
      "/master-city/",
    );

    if (response.success && response.data) {
      return { success: true, data: response.data.results };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch cities"),
    };
  },

  // Countries
  async fetchCountries(): Promise<{
    success: boolean;
    data?: MasterCountry[];
    message?: string;
  }> {
    const response = await apiClient.get<{ results: MasterCountry[] }>(
      "/master-country/",
    );

    if (response.success && response.data) {
      return { success: true, data: response.data.results };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch countries"),
    };
  },

  // Inquiry Kinds
  async fetchInquiryKinds(): Promise<{
    success: boolean;
    data?: MasterInquiryKind[];
    message?: string;
  }> {
    const response = await apiClient.get<{ results: MasterInquiryKind[] }>(
      "/master-inquiry-kind/",
    );

    if (response.success && response.data) {
      return { success: true, data: response.data.results };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch inquiry kinds"),
    };
  },

  async fetchRelation(): Promise<{
    success: boolean;
    data?: MasterRelation[];
    message?: string;
  }> {
    const response = await apiClient.get<{ results: MasterRelation[] }>(
      "/master-relation/",
    );

    if (response.success && response.data) {
      return { success: true, data: response.data.results };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch relations"),
    };
  },

  // Source Types
  async fetchSourceTypes(): Promise<{
    success: boolean;
    data?: MasterSourceType[];
    message?: string;
  }> {
    const response = await apiClient.get<{ results: MasterSourceType[] }>(
      "/master-source-type/",
    );

    if (response.success && response.data) {
      return { success: true, data: response.data.results };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch source types"),
    };
  },

  // Dealers
  async fetchDealers(): Promise<{
    success: boolean;
    data?: MasterDealer[];
    message?: string;
  }> {
    const response = await apiClient.get<{ results: MasterDealer[] }>(
      "/master-dealer/",
    );

    if (response.success && response.data) {
      return { success: true, data: response.data.results };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch dealers"),
    };
  },

  // Filter Options (combined endpoint if available)
  async fetchFilterOptions(): Promise<{
    success: boolean;
    data?: MasterFilterOptions;
    message?: string;
  }> {
    const response = await apiClient.get<MasterFilterOptions>(
      "/master-filter-options/",
    );

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch filter options"),
    };
  },
};
