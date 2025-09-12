import { createSlice } from "@reduxjs/toolkit";
import type { User } from "../../types/userResponse";
import { loginThunk, logoutThunk } from "../thunks/authThunk";

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Cargar estado inicial desde localStorage si existe
const loadPersistedState = (): Partial<UserState> => {
  try {
    const serializedUser = localStorage.getItem("user");
    if (serializedUser) {
      const user = JSON.parse(serializedUser);
      return {
        user,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.warn("Error loading persisted user state:", error);
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
