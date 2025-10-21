import api from './api';
import type { AxiosError, UploadResponse } from '../types/axiosTypes';
import type { 
  Belonging, 
  CreateBelongingData, 
  UpdateBelongingData 
} from '../types/belongingTypes';

export const belongingsService = {
  async createBelonging(prisonerId: string, data: CreateBelongingData): Promise<Belonging> {
    try {
      const response = await api.post<Belonging>(`/prisoners/${prisonerId}/belongings`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al registrar pertenencia');
    }
  },

  async getBelongings(prisonerId: string): Promise<Belonging[]> {
    try {
      const response = await api.get<Belonging[]>(`/prisoners/${prisonerId}/belongings`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener pertenencias');
    }
  },

  async getBelonging(prisonerId: string, belongingId: string): Promise<Belonging> {
    try {
      const response = await api.get<Belonging>(`/prisoners/${prisonerId}/belongings/${belongingId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener pertenencia');
    }
  },

  async updateBelonging(prisonerId: string, belongingId: string, data: UpdateBelongingData): Promise<Belonging> {
    try {
      const response = await api.put<Belonging>(`/prisoners/${prisonerId}/belongings/${belongingId}`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al actualizar pertenencia');
    }
  },

  async deleteBelonging(prisonerId: string, belongingId: string): Promise<void> {
    try {
      await api.delete(`/prisoners/${prisonerId}/belongings/${belongingId}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al eliminar pertenencia');
    }
  },

  async uploadInventory(prisonerId: string, belongingId: string, file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<UploadResponse>(
        `/prisoners/${prisonerId}/belongings/${belongingId}/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al subir inventario');
    }
  },

  async markAsReturned(prisonerId: string, belongingId: string): Promise<Belonging> {
    try {
      const response = await api.patch<Belonging>(`/prisoners/${prisonerId}/belongings/${belongingId}/return`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al marcar como devuelto');
    }
  },
};