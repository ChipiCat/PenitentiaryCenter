import api from "./api";
import axios from "axios";
import { tokenManager } from "./tokenManager";
import { handleApiError } from "../utils/handleApiError";

import type { RegisterRequest } from "../types/authRequest";
import type { AuthResponse } from "../types/authResponse";

const API_URL = import.meta.env.VITE_API_URL as string;

export const register = async (registerData: RegisterRequest): Promise<AuthResponse | null> => {
    try {
        const response = await api.post<AuthResponse>(`/auth/register`, registerData);
        return response.data;
    } catch (error) {
        handleApiError(error, "register");
        return null;
    }
}

export const login = async (email: string, password: string): Promise<AuthResponse | null> => {
    try {
        const response = await api.post<AuthResponse>(`/auth/login`, { email, password });

        // Validate response has tokens
        if (!response.data || !response.data.accessToken || !response.data.refreshToken) {
            console.error("[AuthService] Invalid login response: missing tokens");
            throw new Error("Respuesta de login inválida");
        }

        // Store tokens using token manager
        tokenManager.setAccessToken(response.data.accessToken);
        tokenManager.setRefreshToken(response.data.refreshToken);

        // Verify tokens were stored successfully
        const storedAccess = tokenManager.getAccessToken();
        const storedRefresh = tokenManager.getRefreshToken();

        if (!storedAccess || !storedRefresh) {
            console.error("[AuthService] Tokens were not stored correctly");
            throw new Error("Error al guardar las credenciales");
        }

        return response.data;
    } catch (error) {
        handleApiError(error, "login");
        return null;
    }
};

export const logout = async (): Promise<boolean> => {
    try {
        const refreshToken = tokenManager.getRefreshToken();

        if (!refreshToken) {
            console.warn("[AuthService] No refresh token available for logout");
            tokenManager.clearTokens();
            return true;
        }

        const response = await api.post(`/auth/logout`, { refreshToken });

        if (response.status !== 200 && response.status !== 201) {
            handleApiError(new Error("Logout failed"), "logout");
            return false;
        }

        tokenManager.clearTokens();
        return true;
    } catch (error) {
        console.error("[AuthService] Logout error:", error);
        handleApiError(error, "logout");
        // Clear tokens anyway on logout
        tokenManager.clearTokens();
        return false;
    }
};

export const refreshAuthToken = async (refreshToken: string): Promise<AuthResponse | null> => {
    try {
        // Use axios directly to avoid interceptor loop
        const response = await axios.post<AuthResponse>(
            `${API_URL}/auth/refresh`,
            { refreshToken },
            { 
                headers: { "Content-Type": "application/json" },
                timeout: 10000
            }
        );

        // Validate response has tokens
        if (!response.data || !response.data.accessToken) {
            console.error("[AuthService] Invalid refresh response: missing access token");
            throw new Error("Respuesta de refresh inválida");
        }

        return response.data;
    } catch (error) {
        console.error("[AuthService] Refresh token error:", error);
        handleApiError(error, "refreshAuthToken");
        return null;
    }
};

export const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
        const response = await api.post(`/auth/change-password`, {
            currentPassword,
            newPassword
        });

        return response.status === 200 || response.status === 204;
    } catch (error) {
        console.error("error: ", error)
        handleApiError(error, "updatePassword");
        return false;
    }
};
