import axios from "axios";
import { tokenManager } from "./tokenManager";

const API_URL = import.meta.env.VITE_API_URL as string;

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000, // aumentado a 20 segundos
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

// Track if we're already redirecting to avoid multiple redirects
let isRedirecting = false;

/**
 * Response interceptor - Handle 401 errors with token refresh
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Ignore errors from refresh endpoint to avoid loops
    if (originalRequest.url?.includes('/auth/refresh')) {
      console.error("[API] Refresh endpoint failed, clearing tokens");
      if (!isRedirecting) {
        isRedirecting = true;
        tokenManager.clearTokens();
        window.location.href = "/";
      }
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      console.error("[API] Retry limit reached, rejecting request");
      if (!isRedirecting) {
        isRedirecting = true;
        tokenManager.clearTokens();
        window.location.href = "/";
      }
      return Promise.reject(error);
    }
    
    // Handle 401 Unauthorized with refresh token available
    if (error.response?.status === 401) {
      const refreshToken = tokenManager.getRefreshToken();

      if (!refreshToken) {
        console.warn("[API] 401 received but no refresh token available");
        if (!isRedirecting) {
          isRedirecting = true;
          tokenManager.clearTokens();
          window.location.href = "/";
        }
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      try {

        // Use token manager to queue refresh and avoid race conditions
        const newAccessToken = await tokenManager.queueRefresh(async () => {
          // Import authService dynamically to avoid circular dependency
          const { refreshAuthToken } = await import('./authService');
          
          const currentRefreshToken = tokenManager.getRefreshToken();
          if (!currentRefreshToken) {
            throw new Error("No refresh token available");
          }

          const authResponse = await refreshAuthToken(currentRefreshToken);
          
          if (!authResponse || !authResponse.accessToken) {
            throw new Error("No access token received from refresh");
          }

          // IMPORTANT: Update BOTH tokens if backend returns new refresh token
          tokenManager.setAccessToken(authResponse.accessToken);
          
          if (authResponse.refreshToken) {
            tokenManager.setRefreshToken(authResponse.refreshToken);
            console.log("[API] New refresh token stored");
          }
          
          return authResponse.accessToken;
        });
        
        if (!newAccessToken) {
          throw new Error("Failed to obtain new access token");
        }
        
        // Update the failed request with new token and retry
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("[API] Token refresh failed:", refreshError);
        // Clear tokens on refresh failure and redirect
        if (!isRedirecting) {
          isRedirecting = true;
          tokenManager.clearTokens();
          // Small delay to ensure tokens are cleared before redirect
          setTimeout(() => {
            window.location.href = "/";
          }, 100);
        }
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
