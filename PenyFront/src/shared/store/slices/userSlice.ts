import { createSlice } from "@reduxjs/toolkit";
import { loginThunk, logoutThunk } from "../thunks/authThunk";
import { tokenManager } from "../../services/tokenManager";
import type { User } from "../../types";

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Cargar estado inicial desde localStorage si existe Y hay tokens válidos
const loadPersistedState = (): Partial<UserState> => {
  try {
    // Primero verificar que existan tokens válidos
    const hasTokens = tokenManager.hasTokens();
    
    if (!hasTokens) {
      console.warn("[UserSlice] No valid tokens found, clearing persisted user");
      localStorage.removeItem("user");
      return {};
    }

    const serializedUser = localStorage.getItem("user");
    if (serializedUser) {
      const user = JSON.parse(serializedUser);
      return {
        user,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.warn("[UserSlice] Error loading persisted user state:", error);
    // Clear everything on error
    localStorage.removeItem("user");
    tokenManager.clearTokens();
  }
  return {};
};

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  status: "idle",
  error: null,
  ...loadPersistedState(),
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || action.error.message || null;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "idle";
        state.error = null;
        localStorage.removeItem("user");
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || action.error.message || null;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
