import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { decode as atob } from "base-64";
import * as SecureStore from "expo-secure-store";
import { getErrorMessage } from "../utils/extractError";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

interface TokenPayload {
  exp?: number;
  iat?: number;
}

type AuthFailureCallback = () => void;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
// Refresh token 5 minutes before expiry
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

class ApiClient {
  private axiosInstance: AxiosInstance;
  private access: string | null = null;
  private refresh: string | null = null;
  private accessTokenExpiry: number | null = null;
  private refreshTokenExpiry: number | null = null;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];
  private refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private authFailureCallback: AuthFailureCallback | null = null;
  private authFailureHandled = false;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  /**
   * Register callback for authentication failures
   */
  setAuthFailureCallback(callback: AuthFailureCallback) {
    this.authFailureCallback = callback;
  }

  /**
   * Decode JWT token and extract payload
   */
  private decodeToken(token: string): TokenPayload | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");

      const decoded = JSON.parse(atob(parts[1]));

      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get token expiration time in milliseconds
   */
  private getTokenExpiryTime(token: string): number | null {
    const payload = this.decodeToken(token);
    if (payload?.exp) {
      return payload.exp * 1000; // Convert seconds to milliseconds
    }
    return null;
  }

  /**
   * Check if token is expired or about to expire
   */
  private isTokenExpired(expiryTime: number | null, bufferMs = 0): boolean {
    if (!expiryTime) return true;
    return Date.now() >= expiryTime - bufferMs;
  }

  /**
   * Subscribe to token refresh
   */
  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
  }

  /**
   * Add subscriber for token refresh
   */
  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh() {
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
    }

    if (!this.accessTokenExpiry) return;

    const timeUntilRefresh =
      this.accessTokenExpiry - Date.now() - TOKEN_REFRESH_BUFFER_MS;

    if (timeUntilRefresh > 0) {
      this.refreshTimeoutId = setTimeout(() => {
        this.refreshTokensSilently();
      }, timeUntilRefresh);
    }
  }

  /**
   * Silently refresh tokens in the background
   */
  private async refreshTokensSilently() {
    if (this.isRefreshing || !this.refresh) return;

    try {
      const success = await this.refreshTokens();
      if (success) {
        this.scheduleTokenRefresh();
      }
    } catch (error) {
      console.log("Silent token refresh failed:", error);
    }
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Check if access token is about to expire
        if (
          this.access &&
          this.isTokenExpired(this.accessTokenExpiry, TOKEN_REFRESH_BUFFER_MS)
        ) {
          console.log("[ApiClient] Access token expiring soon, refreshing...");
          try {
            await this.refreshTokens();
          } catch (error) {
            console.log(
              "[ApiClient] Failed to refresh token before request:",
              error instanceof Error ? error.message : error,
            );
          }
        }

        if (this.access) {
          config.headers.Authorization = `Bearer ${this.access}`;
        }

        // Debug aid for list screens: print the fully-resolved URL whenever a
        // request carries `ordering` or `search`, so the exact query a sort or
        // search produced can be replayed in Swagger. getUri resolves baseURL
        // and serializes params, so the output is copy-pasteable as-is.
        if (__DEV__) {
          const params = config.params as Record<string, any> | undefined;
          if (params && (params.ordering || params.search)) {
            console.log(
              "[ApiClient] list request:",
              this.axiosInstance.getUri(config),
            );
          }
        }

        return config;
      },
      (error) => {
        console.log(
          "[ApiClient] Request interceptor error:",
          error instanceof Error ? error.message : error,
        );
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        console.log("[ApiClient] API Error:", {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          // `error.message` is only ever axios's generic "Request failed with
          // status code 400". The body is where the server says which field it
          // rejected, so log it verbatim.
          data: error.response?.data,
        });

        if (error.response?.status === 401 && !originalRequest._retry) {
          console.warn(
            "[ApiClient] Received 401 Unauthorized, attempting token refresh...",
          );
          originalRequest._retry = true;

          if (!this.isRefreshing) {
            this.isRefreshing = true;

            try {
              const success = await this.refreshTokens();
              this.isRefreshing = false;

              if (success && this.access) {
                console.log(
                  "[ApiClient] Token refreshed, retrying original request",
                );
                this.onRefreshed(this.access);
                this.refreshSubscribers = [];
                originalRequest.headers = {
                  ...originalRequest.headers,
                  Authorization: `Bearer ${this.access}`,
                };
                return this.axiosInstance(originalRequest);
              } else {
                console.log(
                  "[ApiClient] Token refresh failed, clearing tokens",
                );
                await this.clearTokens();
                return Promise.reject(error);
              }
            } catch (refreshError) {
              this.isRefreshing = false;
              console.log(
                "[ApiClient] Error during token refresh:",
                refreshError instanceof Error
                  ? refreshError.message
                  : refreshError,
              );
              await this.clearTokens();
              return Promise.reject(refreshError);
            }
          } else {
            // Token is being refreshed, queue this request
            console.log(
              "[ApiClient] Token refresh in progress, queuing request",
            );
            return new Promise((resolve) => {
              this.addRefreshSubscriber((token) => {
                originalRequest.headers = {
                  ...originalRequest.headers,
                  Authorization: `Bearer ${token}`,
                };
                resolve(this.axiosInstance(originalRequest));
              });
            });
          }
        }

        return Promise.reject(error);
      },
    );
  }
  async setTokens(access: string, refresh: string) {
    // 1. INSTANT memory update (critical)
    this.access = access;
    this.refresh = refresh;

    this.accessTokenExpiry = this.getTokenExpiryTime(access);
    this.refreshTokenExpiry = this.getTokenExpiryTime(refresh);

    console.log("[ApiClient] Tokens set successfully", {
      accessTokenExpiry: this.accessTokenExpiry
        ? new Date(this.accessTokenExpiry)
        : null,
      refreshTokenExpiry: this.refreshTokenExpiry
        ? new Date(this.refreshTokenExpiry)
        : null,
    });

    // 2. async persistence (non-blocking important path)
    try {
      await Promise.all([
        SecureStore.setItemAsync("access_token", access),
        SecureStore.setItemAsync("refresh_token", refresh),
        this.accessTokenExpiry
          ? SecureStore.setItemAsync(
              "access_token_expiry",
              this.accessTokenExpiry.toString(),
            )
          : Promise.resolve(),
        this.refreshTokenExpiry
          ? SecureStore.setItemAsync(
              "refresh_token_expiry",
              this.refreshTokenExpiry.toString(),
            )
          : Promise.resolve(),
      ]);
    } catch (error) {
      console.log(
        "[ApiClient] Failed to persist tokens to secure storage:",
        error,
      );
    }

    this.scheduleTokenRefresh();
    // Reset auth-failure guard when tokens are set
    this.authFailureHandled = false;
  }

  async loadTokens() {
    try {
      const access = await SecureStore.getItemAsync("access_token");
      const refresh = await SecureStore.getItemAsync("refresh_token");
      const accessExpiry = await SecureStore.getItemAsync(
        "access_token_expiry",
      );
      const refreshExpiry = await SecureStore.getItemAsync(
        "refresh_token_expiry",
      );

      if (access && refresh) {
        this.access = access;
        this.refresh = refresh;
        this.accessTokenExpiry = accessExpiry
          ? parseInt(accessExpiry, 10)
          : null;
        this.refreshTokenExpiry = refreshExpiry
          ? parseInt(refreshExpiry, 10)
          : null;

        if (!this.accessTokenExpiry)
          this.accessTokenExpiry = this.getTokenExpiryTime(access);
        if (!this.refreshTokenExpiry)
          this.refreshTokenExpiry = this.getTokenExpiryTime(refresh);

        console.log("[ApiClient] Tokens loaded from secure storage", {
          accessTokenExpiry: this.accessTokenExpiry
            ? new Date(this.accessTokenExpiry)
            : null,
          refreshTokenExpiry: this.refreshTokenExpiry
            ? new Date(this.refreshTokenExpiry)
            : null,
        });

        // 1. Check if the Refresh Token itself is completely dead
        if (this.isTokenExpired(this.refreshTokenExpiry)) {
          console.warn(
            "[ApiClient] Loaded Refresh token is completely expired. Logging out.",
          );
          await this.clearTokens();
          return { access: null, refresh: null };
        }

        // 2. Check if Access token is expired but Refresh token is still alive
        if (
          this.isTokenExpired(this.accessTokenExpiry, TOKEN_REFRESH_BUFFER_MS)
        ) {
          console.log(
            "[ApiClient] Loaded Access token is expired, attempting immediate proactive refresh...",
          );
          const refreshSuccess = await this.refreshTokens();

          if (!refreshSuccess) {
            // refreshTokens() calls clearTokens() internally on failure
            return { access: null, refresh: null };
          }
        } else {
          // Access token is perfectly fine, schedule background refresh
          this.scheduleTokenRefresh();
        }
      } else {
        console.log("[ApiClient] No tokens found in secure storage");
      }

      return { access: this.access, refresh: this.refresh };
    } catch (error) {
      console.log(
        "[ApiClient] Failed to load tokens from secure storage:",
        error,
      );
      return { access: null, refresh: null };
    }
  }

  async clearTokens() {
    console.warn("[ApiClient] Clearing tokens - User is being logged out");

    this.access = null;
    this.refresh = null;
    this.accessTokenExpiry = null;
    this.refreshTokenExpiry = null;

    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }

    this.refreshSubscribers = [];

    // Remove any default Authorization header on the axios instance
    try {
      if (
        this.axiosInstance &&
        this.axiosInstance.defaults &&
        this.axiosInstance.defaults.headers
      ) {
        // works for axios v0.21+
        // @ts-ignore
        delete this.axiosInstance.defaults.headers.common?.Authorization;
      }
    } catch (e) {
      console.log(
        "[ApiClient] Failed to clear axios default Authorization header:",
        e,
      );
    }

    try {
      await Promise.all([
        SecureStore.deleteItemAsync("access_token"),
        SecureStore.deleteItemAsync("refresh_token"),
        SecureStore.deleteItemAsync("access_token_expiry"),
        SecureStore.deleteItemAsync("refresh_token_expiry"),
      ]);
    } catch (error) {
      console.log(
        "[ApiClient] Failed to clear tokens from secure storage:",
        error,
      );
    }

    // Trigger auth failure callback to navigate to login
    if (this.authFailureCallback && !this.authFailureHandled) {
      console.log("[ApiClient] Triggering auth failure callback");
      try {
        this.authFailureHandled = true;
        this.authFailureCallback();
      } catch (e) {
        console.log("[ApiClient] Error in auth failure callback:", e);
      }
    }
  }

  private async refreshTokens(): Promise<boolean> {
    if (!this.refresh) {
      console.warn("[ApiClient] No refresh token available");
      return false;
    }

    // Check if refresh token is expired
    if (this.isTokenExpired(this.refreshTokenExpiry)) {
      console.warn("[ApiClient] Refresh token has expired");
      await this.clearTokens();
      return false;
    }

    try {
      console.log("[ApiClient] Attempting to refresh access token...");

      const response = await axios.post(
        `${API_BASE_URL}app-customer/auth/refresh/`,
        {
          refresh: this.refresh,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        },
      );

      if (response.data?.access) {
        console.log("[ApiClient] Token refresh successful");
        await this.setTokens(response.data.access, this.refresh!);
        return true;
      } else {
        console.log("[ApiClient] Token refresh response missing access token");
        await this.clearTokens();
      }

      return false;
    } catch (error) {
      console.log(
        "[ApiClient] Token refresh failed:",
        error instanceof Error ? error.message : error,
      );
      await this.clearTokens();
      return false;
    }
  }

  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.get(
        url,
        config,
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.post(
        url,
        data,
        config,
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.put(
        url,
        data,
        config,
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.patch(
        url,
        data,
        config,
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.delete(
        url,
        config,
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse {
    const message = this.getErrorMessage(error);
    console.log("[ApiClient] API Error:", {
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
      message,
      url: axios.isAxiosError(error) ? error.config?.url : undefined,
    });

    return {
      success: false,
      message,
    };
  }

  // Error parsing moved to shared helper utility
  private getErrorMessage(error: any): string {
    return getErrorMessage(error);
  }

  /**
   * Get token status information (for debugging)
   */
  getTokenStatus() {
    const now = Date.now();
    return {
      hasAccessToken: !!this.access,
      hasRefreshToken: !!this.refresh,
      accessTokenExpiry: this.accessTokenExpiry
        ? new Date(this.accessTokenExpiry)
        : null,
      refreshTokenExpiry: this.refreshTokenExpiry
        ? new Date(this.refreshTokenExpiry)
        : null,
      accessTokenExpired: this.isTokenExpired(this.accessTokenExpiry),
      refreshTokenExpired: this.isTokenExpired(this.refreshTokenExpiry),
      timeUntilAccessTokenExpiry: this.accessTokenExpiry
        ? this.accessTokenExpiry - now
        : null,
      timeUntilRefreshTokenExpiry: this.refreshTokenExpiry
        ? this.refreshTokenExpiry - now
        : null,
    };
  }
}

export const apiClient = new ApiClient();

/**
 * Initialize auth failure handler (should be called from app root)
 * This is called when tokens are cleared or refresh fails
 */
export const setApiAuthFailureHandler = (callback: () => void) => {
  apiClient.setAuthFailureCallback(callback);
};
