import { createAsyncThunk } from "@reduxjs/toolkit";
import { login, logout } from "../../services/authService";
import { getUserById } from "../../services/userService";
import type { User } from "../../types/userResponse";
import type { LoginRequest } from "../../types/authRequest";


/**
 * Manage  user login and fetch user data
 */
export const loginThunk = createAsyncThunk<User, LoginRequest, { rejectValue: string }>(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await login(email, password);
      if (!response) return rejectWithValue("Credenciales inválidas");
      const userId = response.user.id;
      if (!userId) return rejectWithValue("No se recibió información del usuario");
      const userData = await getUserById(userId);
      if (!userData) return rejectWithValue("Usuario no encontrado");
      return userData;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message ?? "Error al iniciar sesión");
      }
      return rejectWithValue("Error al iniciar sesión");
    }
  }
);

/**
 * Manage user logout
 */
export const logoutThunk = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const success = await logout();
      if (!success) return rejectWithValue("Error al cerrar sesión");
      return;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message ?? "Error al cerrar sesión");
      }
      return rejectWithValue("Error al cerrar sesión");
    }
  }
);