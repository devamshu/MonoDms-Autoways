// Request Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface SendOtpRequest {
  email: string;
}

export interface SendPhoneOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyPhoneOtpRequest {
  phone: string;
  code: string;
}

// Response Types
export interface Tokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

export interface OtpResponse {
  success: boolean;
  message?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
  verification_token?: string;
}

export interface ResetPasswordRequest {
  otp: string;
  new_password: string;
  re_new_password: string;
  email: string;
}

// State Types
export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  error: string | null;
  rememberedIdentifier: string | null;
}
