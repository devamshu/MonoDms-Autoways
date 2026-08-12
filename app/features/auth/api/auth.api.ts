import {
    LoginRequest,
    LoginResponse,
    OtpResponse,
    ResetPasswordRequest,
    SendOtpRequest,
    SendPhoneOtpRequest,
    VerifyOtpRequest,
    VerifyOtpResponse,
} from "../types";
import { apiClient } from "@/app/services/axios";

export const authApi = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const request: LoginRequest = { username, password };
    const response = await apiClient.post<any>("/users/auth/login/", request);

    if (response.success && response.data) {
      const apiData = response.data;

      // Check if login was successful
      if (apiData.success && apiData.data) {
        const userData = apiData.data;
        // const tokens = userData.tokens;

        const loginResponse: LoginResponse = {
          success: true,
          accessToken: userData?.access,
          refreshToken: userData?.refresh,
          message: apiData.message,
        };
        return loginResponse;
      }
    }

    return {
      success: false,
      message:
        response.data?.message ||
        response.message ||
        "Login failed. Please try again.",
    };
  },

  // Send Email OTP
  async sendEmailOtp(email: string): Promise<OtpResponse> {
    const request: SendOtpRequest = { email };
    console.log("sendEmailOtp - Request:", request);

    const response = await apiClient.post<any>(
      "/users/auth/forgot-password/",
      request,
    );

    console.log("sendEmailOtp - API Response:", response);
    console.log("sendEmailOtp - Response Data:", response.data);

    if (response.success && response.data) {
      console.log("sendEmailOtp - Success:", response.data);
      return {
        success: response.data.success ?? false,
        message: response.data.message,
      };
    } else {
      console.log("sendEmailOtp - Failed:", response.message);
      return {
        success: false,
        message: response.message || "Failed to send OTP",
      };
    }
  },

  // Reset Password — submit OTP + new password
  async resetPassword(request: ResetPasswordRequest): Promise<OtpResponse> {
    console.log("authApi.resetPassword - Request:", request);

    const response = await apiClient.post<any>(
      "/users/auth/reset-password/",
      request,
    );

    console.log("authApi.resetPassword - Raw Response:", response);

    if (response.success && response.data) {
      return {
        success: response.data.success ?? false,
        message: response.data.message,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to reset password",
      };
    }
  },

  // Send Phone OTP
  async sendPhoneOtp(phone: string): Promise<OtpResponse> {
    const request: SendPhoneOtpRequest = { phone };
    const response = await apiClient.post<any>(
      "/users/auth/phone/send-otp/",
      request,
    );

    if (response.success && response.data) {
      return {
        success: response.data.message?.includes("successfully") ?? false,
        message: response.data.message,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to send OTP",
      };
    }
  },

  // Verify Email OTP
  async verifyEmailOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    const request: VerifyOtpRequest = { email, otp };
    const response = await apiClient.post<any>(
      "/users/auth/verify-otp/",
      request,
    );

    if (response.success && response.data) {
      return {
        success: response.data.message?.includes("successfully") ?? false,
        message: response.data.message,
        verification_token:
          response.data.verification_token || response.data.token,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to verify OTP",
      };
    }
  },

  // Verify Phone OTP
  // async verifyPhoneOtp(
  //   phone: string,
  //   code: string,
  // ): Promise<VerifyOtpResponse> {
  //   const request: VerifyPhoneOtpRequest = { phone, code };
  //   const response = await apiClient.post<any>(
  //     "/users/auth/verify-otp/",
  //     request,
  //   );

  //   if (response.success && response.data) {
  //     return {
  //       success: response.data.message?.includes("successfully") ?? false,
  //       message: response.data.message,
  //       verification_token:
  //         response.data.verification_token || response.data.token,
  //     };
  //   } else {
  //     return {
  //       success: false,
  //       message: response.message || "Failed to verify OTP",
  //     };
  //   }
  // },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<{ access: string } | null> {
    const response = await apiClient.post<any>("/users/auth/refresh/", {
      refresh: refreshToken,
    });

    if (response.success && response.data?.access) {
      return { access: response.data.access };
    }
    return null;
  },

  // Logout
  async logout(): Promise<void> {
    await apiClient.post("/users/auth/logout/");
  },
};
