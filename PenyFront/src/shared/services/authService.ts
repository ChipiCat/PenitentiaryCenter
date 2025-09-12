import api from "./api";
import { handleApiError } from "../utils/handleApiError";

import type { RegisterRequest } from "../types/authRequest";
import type { AuthResponse } from "../types/authResponse";

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
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        return response.data;
    } catch (error) {
        handleApiError(error, "login");
        return null;
    }
};

export const logout = async (): Promise<boolean> => {
    try {
        const refreshToken: string = localStorage.getItem("refreshToken") as string;
        console.log("Logging out with refresh token:", refreshToken); 
        const response = await api.post(`/auth/logout`, { refreshToken });

        if (response.status !== 200 && response.status !== 201) {
            handleApiError(new Error("Logout failed"), "logout");
            return false;
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return true;
    } catch (error) {
        handleApiError(error, "logout");
        return false;
    }
};
