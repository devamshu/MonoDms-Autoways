import { createSlice } from "@reduxjs/toolkit";
import { ProfileState } from "../types";
import {
  fetchProfile,
  updatePassword,
  updateProfile,
  updateProfileImage,
} from "./profile.thunks";

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  error: null,
  hasLoaded: false,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: () => initialState,
    clearProfileError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.hasLoaded = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to fetch profile";
        state.hasLoaded = true;
      })

      // Update Profile Data (name, phone, email)
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Profile Image
      .addCase(updateProfileImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfileImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfileImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Password
      .addCase(updatePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfile, clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;
