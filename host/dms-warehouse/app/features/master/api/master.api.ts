import { getApiErrorMessage } from "../../../utils/extractError";
import { dedupRequest, generateRequestKey } from "../../../utils/requestDedup";
import {
    MasterColor,
    MasterLocation,
    MasterStockyard,
    MasterVariant,
    MasterVehicle,
} from "../types";
import { apiClient } from "../../../../../../app/services/axios";

export const masterApi = {
  // Vehicles
  async fetchVehicles(params?: { page?: number; page_size?: number }): Promise<{
    success: boolean;
    data?: { results: MasterVehicle[]; next: string | null };
    message?: string;
  }> {
    const requestKey = generateRequestKey("/master-vehicle/", params);

    return dedupRequest(requestKey, async () => {
      const response = await apiClient.get<{
        results: MasterVehicle[];
        next: string | null;
      }>("/master-vehicle/", { params });

      if (response.success && response.data) {
        return { success: true, data: response.data };
      }

      return {
        success: false,
        message: getApiErrorMessage(response, "Failed to fetch vehicles"),
      };
    });
  },

  // Variants
  async fetchVariants(params?: { page?: number; page_size?: number }): Promise<{
    success: boolean;
    data?: { results: MasterVariant[]; next: string | null };
    message?: string;
  }> {
    const requestKey = generateRequestKey("/master-variant/", params);

    return dedupRequest(requestKey, async () => {
      const response = await apiClient.get<{
        results: MasterVariant[];
        next: string | null;
      }>("/master-variant/", { params });

      if (response.success && response.data) {
        return { success: true, data: response.data };
      }

      return {
        success: false,
        message: getApiErrorMessage(response, "Failed to fetch variants"),
      };
    });
  },

  // Colors
  async fetchColors(params?: { page?: number; page_size?: number }): Promise<{
    success: boolean;
    data?: { results: MasterColor[]; next: string | null };
    message?: string;
  }> {
    const requestKey = generateRequestKey("/master-color/", params);

    return dedupRequest(requestKey, async () => {
      const response = await apiClient.get<{
        results: MasterColor[];
        next: string | null;
      }>("/master-color/", { params });

      if (response.success && response.data) {
        return { success: true, data: response.data };
      }

      return {
        success: false,
        message: getApiErrorMessage(response, "Failed to fetch colors"),
      };
    });
  },

  // Stockyards
  async fetchStockyards(params?: { page?: number; page_size?: number }): Promise<{
    success: boolean;
    data?: { results: MasterStockyard[]; next: string | null };
    message?: string;
  }> {
    const requestKey = generateRequestKey("/master-stockyard/", params);

    return dedupRequest(requestKey, async () => {
      const response = await apiClient.get<{
        results: MasterStockyard[];
        next: string | null;
      }>("/master-stockyard/", { params });

      if (response.success && response.data) {
        return { success: true, data: response.data };
      }

      return {
        success: false,
        message: getApiErrorMessage(response, "Failed to fetch stockyards"),
      };
    });
  },

  // Locations
  async fetchLocations(params?: {
    stockyard?: number;
    page?: number;
    page_size?: number;
  }): Promise<{
    success: boolean;
    data?: { results: MasterLocation[]; next: string | null };
    message?: string;
  }> {
    const requestKey = generateRequestKey("/master-stockyard-location/", params);

    return dedupRequest(requestKey, async () => {
      const response = await apiClient.get<{
        results: MasterLocation[];
        next: string | null;
      }>("/master-stockyard-location/", { params });

      if (response.success && response.data) {
        return { success: true, data: response.data };
      }

      return {
        success: false,
        message: getApiErrorMessage(response, "Failed to fetch locations"),
      };
    });
  },
};
