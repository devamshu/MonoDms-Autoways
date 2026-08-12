import { getErrorMessage } from "@/app/utils/extractError";
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { authApi } from "../api/auth.api";
import { apiClient } from "@/app/services/axios";

const REMEMBERED_IDENTIFIER_KEY = "rememberedIdentifier";
const REMEMBER_ME_KEY = "rememberMe";

// Check auth status thunk
export const checkAuthStatus = createAsyncThunk(
  "auth/checkStatus",
  async () => {
    const tokens = await apiClient.loadTokens();

    if (tokens.access && tokens.refresh) {
      return {
        accessToken: tokens.access,
        refreshToken: tokens.refresh,
      };
    }
    return null;
  },
);

export const loadRememberedCredentials = createAsyncThunk(
  "auth/loadRememberedCredentials",
  async () => {
    const savedIdentifier = await SecureStore.getItemAsync(
      REMEMBERED_IDENTIFIER_KEY,
    );
    const savedRememberMe = await SecureStore.getItemAsync(REMEMBER_ME_KEY);

    if (savedRememberMe === "true" && savedIdentifier) {
      return { identifier: savedIdentifier };
    }
    return null;
  },
);

export const saveRememberedCredentials = createAsyncThunk(
  "auth/saveRememberedCredentials",
  async ({
    username,
    rememberMe,
  }: {
    username: string;
    rememberMe: boolean;
  }) => {
    if (rememberMe) {
      await SecureStore.setItemAsync(REMEMBERED_IDENTIFIER_KEY, username);
      await SecureStore.setItemAsync(REMEMBER_ME_KEY, "true");
    } else {
      await SecureStore.deleteItemAsync(REMEMBERED_IDENTIFIER_KEY);
      await SecureStore.setItemAsync(REMEMBER_ME_KEY, "false");
    }
    return rememberMe ? username : null;
  },
);

// Login thunk
export const login = createAsyncThunk(
  "auth/login",
  async (
    { username, password }: { username: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await authApi.login(username, password);

      if (response.success && response.accessToken && response.refreshToken) {
        // Store tokens securely
        await apiClient.setTokens(response.accessToken, response.refreshToken);

        return {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        };
      }

      return rejectWithValue(response.message || "Login failed");
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// Reset password thunk
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    {
      otp,
      new_password,
      re_new_password,
      email,
    }: {
      otp: string;
      new_password: string;
      re_new_password: string;
      email: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const payload = {
        otp,
        new_password,
        re_new_password,
        email,
      };
      console.log("resetPassword - Sending payload:", payload);

      const response = await authApi.resetPassword(payload);
      console.log("resetPassword - API Response:", response);

      if (!response.success) {
        return rejectWithValue(response.message || "Failed to reset password");
      }

      return { email };
    } catch (error) {
      console.error("resetPassword - Error:", error);
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// Send email OTP thunk
export const sendEmailOtp = createAsyncThunk(
  "auth/sendEmailOtp",
  async (email: string, { rejectWithValue }) => {
    try {
      console.log("sendEmailOtp Thunk - Sending email:", email);
      const response = await authApi.sendEmailOtp(email);
      console.log("sendEmailOtp Thunk - API Response:", response);

      if (!response.success) {
        console.log("sendEmailOtp Thunk - Failed:", response.message);
        return rejectWithValue(response.message || "Failed to send OTP");
      }
      console.log("sendEmailOtp Thunk - Success");
      return { email, message: response.message };
    } catch (error) {
      console.error("sendEmailOtp Thunk - Error:", error);
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// Send phone OTP thunk
export const sendPhoneOtp = createAsyncThunk(
  "auth/sendPhoneOtp",
  async (phone: string, { rejectWithValue }) => {
    try {
      const response = await authApi.sendPhoneOtp(phone);

      if (!response.success) {
        return rejectWithValue(response.message || "Failed to send OTP");
      }

      return { phone };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// Verify email OTP thunk
export const verifyEmailOtp = createAsyncThunk(
  "auth/verifyEmailOtp",
  async (
    { email, code }: { email: string; code: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await authApi.verifyEmailOtp(email, code);

      if (!response.success || !response.verification_token) {
        return rejectWithValue(response.message || "Failed to verify OTP");
      }

      return {
        email,
        verificationToken: response.verification_token,
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// Verify phone OTP thunk
// export const verifyPhoneOtp = createAsyncThunk(
//   "auth/verifyPhoneOtp",
//   async (
//     { phone, code }: { phone: string; code: string },
//     { rejectWithValue },
//   ) => {
//     try {
//       const response = await authApi.verifyPhoneOtp(phone, code);

//       if (!response.success || !response.verification_token) {
//         return rejectWithValue(response.message || "Failed to verify OTP");
//       }

//       return {
//         phone,
//         verificationToken: response.verification_token,
//       };
//     } catch (error) {
//       return rejectWithValue(getErrorMessage(error));
//     }
//   },
// );

// Logout thunk
// export const logout = createAsyncThunk("auth/logout", async () => {
//   try {
//     await authApi.logout();
//   } catch (error) {
//     // Ignore logout API errors
//   }

//   await apiClient.clearTokens();
//   await AsyncStorage.removeItem(USER_DATA_KEY);
//   // Don't clear HAS_LOGGED_IN_BEFORE_KEY - user has still logged in before
// });

// Logout since no API is present for now (will be implemented once API is ready)
export const logout = createAsyncThunk("auth/logout", async () => {
  await apiClient.clearTokens();
  return true;
});
