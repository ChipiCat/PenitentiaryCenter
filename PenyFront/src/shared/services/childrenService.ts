import api from './api';
import type { AxiosError } from '../types/axiosTypes';  
import type { 
  Child,
  CreateChildData,
  UpdateChildData
} from '../types/childTypes';  

export const childrenService = {
  // POST /prisoners/{prisonerId}/children
  async createChild(prisonerId: string, data: CreateChildData): Promise<Child> {
    try {
      const response = await api.post<Child>(`/prisoners/${prisonerId}/children`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al agregar hijo');
    }
  },

  // GET /prisoners/{prisonerId}/children
  async getChildren(prisonerId: string): Promise<Child[]> {
    try {
      const response = await api.get<Child[]>(`/prisoners/${prisonerId}/children`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener hijos');
    }
  },

  // GET /prisoners/{prisonerId}/children/{childId}
  async getChild(prisonerId: string, childId: string): Promise<Child> {
    try {
      const response = await api.get<Child>(`/prisoners/${prisonerId}/children/${childId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener hijo');
    }
  },

  // PUT /prisoners/{prisonerId}/children/{childId}
  async updateChild(prisonerId: string, childId: string, data: UpdateChildData): Promise<Child> {
    try {
      const response = await api.put<Child>(`/prisoners/${prisonerId}/children/${childId}`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al actualizar hijo');
    }
  },

  // DELETE /prisoners/{prisonerId}/children/{childId}
  async deleteChild(prisonerId: string, childId: string): Promise<void> {
    try {
      await api.delete(`/prisoners/${prisonerId}/children/${childId}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al eliminar hijo');
    }
  },
};