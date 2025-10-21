import api from './api';
import type { AxiosError, PaginationResponse } from '../types/axiosTypes';  // ✅ USAR EXISTENTE
import type { 
  PrisonerBase,
  CreatePrisonerData,
  UpdatePrisonerData,
  GetPrisonersParams
} from '../types/prisonerTypes';  

export const prisonersService = {
  // POST /prisoners
  async createPrisoner(data: CreatePrisonerData): Promise<PrisonerBase> {
    try {
      const response = await api.post<PrisonerBase>('/prisoners', data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al crear prisionero');
    }
  },

  // GET /prisoners
  async getPrisoners(params?: GetPrisonersParams): Promise<PaginationResponse<PrisonerBase>> {
    try {
      const response = await api.get<PaginationResponse<PrisonerBase>>('/prisoners', { params });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener prisioneros');
    }
  },

  // GET /prisoners/{id}
  async getPrisoner(id: string): Promise<PrisonerBase> {
    try {
      const response = await api.get<PrisonerBase>(`/prisoners/${id}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener prisionero');
    }
  },

  // PUT /prisoners/{id}
  async updatePrisoner(id: string, data: UpdatePrisonerData): Promise<PrisonerBase> {
    try {
      const response = await api.put<PrisonerBase>(`/prisoners/${id}`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al actualizar prisionero');
    }
  },

  // DELETE /prisoners/{id}
  async deletePrisoner(id: string): Promise<void> {
    try {
      await api.delete(`/prisoners/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al eliminar prisionero');
    }
  },
};