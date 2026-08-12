import {
    ChangePassword,
    PasswordChangeResponse,
    ProfileResponse,
    UserProfile,
} from "../types";
import { apiClient } from "../../../../../../app/services/axios";

export const profileApi = {
  async getProfile(): Promise<ProfileResponse> {
    const response = await apiClient.get<ProfileResponse>("/users/auth/me/");

    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || "Failed to fetch profile");
    }
  },
};

export const updateProfileApi = {
  async updateProfile(
    updateData: Partial<UserProfile>,
  ): Promise<ProfileResponse> {
    const response = await apiClient.patch<ProfileResponse>(
      "/users/auth/me/",
      updateData,
    );

    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || "Failed to update profile");
    }
  },
};

export const updateProfileImageApi = {
  async updateProfileImage(updateData: FormData): Promise<ProfileResponse> {
    const isFormData = updateData instanceof FormData;

    const response = await apiClient.patch<ProfileResponse>(
      "/users/auth/me/",
      updateData,
      {
        headers: isFormData
          ? {
              "Content-Type": "multipart/form-data",
            }
          : undefined,
      },
    );

    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || "Failed to update profile");
    }
  },
};

export const passwordUpdateApi = {
  async updatePassword(
    passwordData: ChangePassword,
  ): Promise<PasswordChangeResponse> {
    const response = await apiClient.post<PasswordChangeResponse>(
      "/users/change-password/",
      passwordData,
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to update password");
    }
    return response as PasswordChangeResponse;
  },
};
