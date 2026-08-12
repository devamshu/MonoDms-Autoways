import { createSlice } from "@reduxjs/toolkit";
import { AuthState } from "../types";
import {
  checkAuthStatus,
  loadRememberedCredentials,
  login,
  logout,
  resetPassword,
  sendEmailOtp,
  sendPhoneOtp,
} from "./auth.thunks";

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
  isCheckingAuth: true,
  error: null,
  rememberedIdentifier: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Check Auth Status
      .addCase(checkAuthStatus.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        if (action.payload) {
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
        } else {
          state.isAuthenticated = false;
        }
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isCheckingAuth = false;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
      })

      .addCase(loadRememberedCredentials.fulfilled, (state, action) => {
        state.rememberedIdentifier = action.payload?.identifier ?? null;
      })

      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.error.message || "Login failed";
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to reset password";
      })
      // Send Email OTP
      .addCase(sendEmailOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendEmailOtp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(sendEmailOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to send OTP";
      })
      // Send Phone OTP
      .addCase(sendPhoneOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendPhoneOtp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(sendPhoneOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to send OTP";
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
        // Keep hasLoggedInBefore as true
      });
  },
});

export const { clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;
