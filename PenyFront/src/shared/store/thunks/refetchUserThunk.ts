import { createAsyncThunk } from "@reduxjs/toolkit";
import { getUserById } from "../../services/userService";
import type { User } from "../../types";

export const refetchUserThunk = createAsyncThunk<User, string, { rejectValue: string }>(
  "user/refetch",
  async (userId, { rejectWithValue }) => {
    try {
      const user = await getUserById(userId);
      if (!user) return rejectWithValue("Usuario no encontrado");
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return rejectWithValue("Error al obtener usuario");
    }
  }
);
