import { apiClient } from "../../../../../../app/services/axios";
import { getApiErrorMessage } from "../../../utils/extractError";
import {
  MasterBrand,
  MasterDealer,
  MasterFiscalYear,
  MasterVehicle,
} from "../types";

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
  // Brands
  async fetchBrands(): Promise<{
    success: boolean;
    data?: MasterBrand[];
    message?: string;
  }> {
    const response = await apiClient.get<{ results: MasterBrand[] }>(
      "/master-brand/",
    );

    if (response.success && response.data) {
      return { success: true, data: response.data.results };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch brands"),
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

  async fetchFiscalYears(): Promise<{
    success: boolean;
    data?: MasterFiscalYear[];
    message?: string;
  }> {
    const response = await apiClient.get<{ results: MasterFiscalYear[] }>(
      "/master-fiscal-year/",
    );

    if (response.success && response.data) {
      return { success: true, data: response.data.results };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch fiscal years"),
    };
  },
};
