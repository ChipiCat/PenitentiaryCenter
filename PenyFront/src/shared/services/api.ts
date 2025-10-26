import axios from "axios";
import type { AuthResponse } from "../types/authResponse";
import { tokenManager } from "./tokenManager";

const API_URL = import.meta.env.VITE_API_URL as string;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor - Add access token to all requests
 */
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor - Handle 401 errors with token refresh
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite retry loops
    if (originalRequest._retry) {
      console.error("[API] Retry limit reached, rejecting request");
      tokenManager.clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized with refresh token available
    if (error.response?.status === 401) {
      const refreshToken = tokenManager.getRefreshToken();

      if (!refreshToken) {
        console.warn("[API] 401 received but no refresh token available");
        tokenManager.clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        console.log("[API] 401 received, attempting token refresh...");

        // Use token manager to queue refresh and avoid race conditions
        const newAccessToken = await tokenManager.queueRefresh(async () => {
          const res = await axios.post<AuthResponse>(
            `${API_URL}/auth/refresh`,
            { refreshToken },
            { 
              headers: { "Content-Type": "application/json" },
              // Don't use the interceptor for refresh requests
              timeout: 5000
            }
          );

          console.log("[API] Token refresh successful");

          // IMPORTANT: Update BOTH tokens if backend returns new refresh token
          if (res.data.accessToken) {
            tokenManager.setAccessToken(res.data.accessToken);
          } else {
            throw new Error("No access token received from refresh");
          }
          
          if (res.data.refreshToken) {
            tokenManager.setRefreshToken(res.data.refreshToken);
            console.log("[API] New refresh token stored");
          }

          return res.data.accessToken;
        });

        if (!newAccessToken) {
          throw new Error("Failed to obtain new access token");
        }

        // Update the failed request with new token and retry
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        console.error("[API] Token refresh failed:", refreshError);
        // Clear tokens on refresh failure
        tokenManager.clearTokens();
        // Redirect to login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    } else if (error.response?.status) {
      console.error(`[API] Error ${error.response.status}:`, error.response.data);
    } else {
      console.error("[API] Request error:", error.message);
    }

    return Promise.reject(error);
  }
);


export default api;
