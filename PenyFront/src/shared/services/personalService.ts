import api from './api';
import type { AxiosError } from '../types/axiosTypes'; 
import type { 
  Personal,
  CreatePersonalData,
  UpdatePersonalData
} from '../types/personalTypes'; 

export const personalService = {
  // POST /prisoners/{prisonerId}/personal
  async createPersonal(prisonerId: string, data: CreatePersonalData): Promise<Personal> {
    try {
      const response = await api.post<Personal>(`/prisoners/${prisonerId}/personal`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al crear información personal');
    }
  },

  // GET /prisoners/{prisonerId}/personal
  async getPersonal(prisonerId: string): Promise<Personal> {
    try {
      const response = await api.get<Personal>(`/prisoners/${prisonerId}/personal`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener información personal');
    }
  },

  // PUT /prisoners/{prisonerId}/personal
  async updatePersonal(prisonerId: string, data: UpdatePersonalData): Promise<Personal> {
    try {
      const response = await api.put<Personal>(`/prisoners/${prisonerId}/personal`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al actualizar información personal');
    }
  },
};