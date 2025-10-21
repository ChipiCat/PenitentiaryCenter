import api from './api';
import type { AxiosError } from '../types/axiosTypes';
import type { 
  Penitentiary,
  CreatePenitentiaryData,
  UpdatePenitentiaryData
} from '../types/penitentiaryTypes';  

export const penitentiaryService = {
  // POST /prisoners/{prisonerId}/penitentiary
  async createPenitentiary(prisonerId: string, data: CreatePenitentiaryData): Promise<Penitentiary> {
    try {
      const response = await api.post<Penitentiary>(`/prisoners/${prisonerId}/penitentiary`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al crear información penitenciaria');
    }
  },

  // GET /prisoners/{prisonerId}/penitentiary
  async getPenitentiary(prisonerId: string): Promise<Penitentiary> {
    try {
      const response = await api.get<Penitentiary>(`/prisoners/${prisonerId}/penitentiary`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener información penitenciaria');
    }
  },

  // PUT /prisoners/{prisonerId}/penitentiary
  async updatePenitentiary(prisonerId: string, data: UpdatePenitentiaryData): Promise<Penitentiary> {
    try {
      const response = await api.put<Penitentiary>(`/prisoners/${prisonerId}/penitentiary`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al actualizar información penitenciaria');
    }
  },
};