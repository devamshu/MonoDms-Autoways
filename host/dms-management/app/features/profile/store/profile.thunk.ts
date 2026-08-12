import { getErrorMessage } from "@/app/utils/extractError";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  passwordUpdateApi,
  profileApi,
  updateProfileApi,
  updateProfileImageApi,
} from "../api/profile.api";
import { ChangePassword, UserProfile } from "../types";

export const fetchProfile = createAsyncThunk(
  "profile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileApi.getProfile();

      if (!response.data) {
        return rejectWithValue("Profile not found");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// For updating profile data (name, phone, email) - JSON only
export const updateProfile = createAsyncThunk(
  "profile/update",
  async (updateData: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const response = await updateProfileApi.updateProfile(updateData);

      if (!response.data) {
        return rejectWithValue("Profile not found");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// For updating profile image - FormData only
export const updateProfileImage = createAsyncThunk(
  "profile/updateImage",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await updateProfileImageApi.updateProfileImage(formData);

      if (!response.data) {
        return rejectWithValue("Profile not found");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updatePassword = createAsyncThunk(
  "profile/updatePassword",
  async (passwordData: ChangePassword, { rejectWithValue }) => {
    try {
      const response = await passwordUpdateApi.updatePassword(passwordData);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);
