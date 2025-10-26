import axios from "axios";
import type { AuthResponse } from "../types/authResponse";
const API_URL = import.meta.env.VITE_API_URL as string;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (
      error.response?.status === 401 &&
 
      localStorage.getItem("refreshToken")
    ) {
      originalRequest._retry = true;
      try {
        console.log("Refreshing access token...");
        const refreshToken = localStorage.getItem("refreshToken");
        console.log("Using refresh token:", refreshToken);
        const res = await axios.post<AuthResponse>(`${API_URL}/auth/refresh`, {
          refreshToken,
        });
        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        console.log("Access token refreshed.");
        return api(originalRequest);
      } catch (refreshError) {
        console.log("Token refresh failed:", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        //swindow.location.href = "/login";
        return Promise.reject(refreshError);
      }

    } else {
      console.error("API error:", error);
    }
    return Promise.reject(error);
  }
);


export default api;
