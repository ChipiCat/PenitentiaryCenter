import api from './api';
import type { AxiosError, PaginationResponse } from '../types/axiosTypes';  // ✅ USAR EXISTENTE
import type { 
  CreateUserData,
  UpdateUserData,
  GetUsersParams
} from '../types/userTypes'; 
import { handleApiError } from "../utils/handleApiError";
import type { User } from "../types/userResponse";

export const getUserById = async (id: string): Promise<User | null> => {
    try {
        const response = await api.get<User>(`/users/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error, "getUserById");
        return null;
    }
}

export const usersService = {
  async createUser(data: CreateUserData): Promise<User> {
    try {
      const response = await api.post<User>('/users', data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al crear usuario');
    }
  },

  async getUsers(params?: GetUsersParams): Promise<PaginationResponse<User>> {
    try {
      const response = await api.get<PaginationResponse<User>>('/users', { params });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener usuarios');
    }
  },

  // GET /users/{id}
  async getUser(id: string): Promise<User> {
    try {
      const response = await api.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener usuario');
    }
  },

  // PATCH /users/{id}
  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    try {
      const response = await api.patch<User>(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al actualizar usuario');
    }
  },

  // DELETE /users/{id}
  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al eliminar usuario');
    }
  },
};