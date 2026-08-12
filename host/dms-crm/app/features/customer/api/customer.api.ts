import { getApiErrorMessage } from "../../../utils/extractError";
import {
    AddCustomerPayload,
    Customer,
    CustomerListParams,
    CustomerListResponse,
    InquiryDetail,
} from "../types";
import { apiClient } from "../../../../../../app/services/axios";

export const customerApi = {
  async fetchCustomers(params?: CustomerListParams): Promise<{
    success: boolean;
    data?: CustomerListResponse;
    message?: string;
  }> {
    const response = await apiClient.get<CustomerListResponse>(
      "/crm/inquiry/",
      { params },
    );
    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch customers"),
    };
  },

  async fetchCustomerById(id: string): Promise<{
    success: boolean;
    data?: Customer;
    message?: string;
  }> {
    const response = await apiClient.get<{ data: Customer }>(
      `/crm/inquiry/${id}/`,
    );
    if (response.success && response.data) {
      return { success: true, data: response.data.data };
    }
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch customer"),
    };
  },

  async fetchInquiryDetail(id: string): Promise<{
    success: boolean;
    data?: InquiryDetail;
    message?: string;
  }> {
    const response = await apiClient.get<{ data: InquiryDetail }>(
      `/inquiry/${id}/detail/`,
    );

    if (response.success && response.data) {
      return { success: true, data: response.data.data };
    }
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch inquiry details"),
    };
  },

  async createCustomer(payload: AddCustomerPayload): Promise<{
    success: boolean;
    data?: Customer;
    message?: string;
  }> {
    console.log(
      "[customerApi.createCustomer] REQUEST → POST /crm/inquiry/",
      JSON.stringify(payload, null, 2),
    );
    const response = await apiClient.post<Customer>("/crm/inquiry/", payload);
    console.log(
      "[customerApi.createCustomer] RESPONSE ←",
      JSON.stringify(response, null, 2),
    );
    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to create customer"),
    };
  },
};
