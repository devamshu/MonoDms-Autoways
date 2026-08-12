import { getApiErrorMessage } from "../../../utils/extractError";
import { User, UsersListParams, UsersListResponse } from "../types";
import { apiClient } from "../../../../../../app/services/axios";

export const usersApi = {
  // Fetch paginated users list
  async fetchUsers(
    params?: UsersListParams,
  ): Promise<{ success: boolean; data?: UsersListResponse; message?: string }> {
    const response = await apiClient.get<UsersListResponse>("/users/users/", {
      params,
    });

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch users"),
    };
  },

  async fetchUserById(
    id: string,
  ): Promise<{ success: boolean; data?: User; message?: string }> {
    const response = await apiClient.get<User>(`/users/users/${id}/`);

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      message: getApiErrorMessage(response, "Failed to fetch user"),
    };
  },
};
