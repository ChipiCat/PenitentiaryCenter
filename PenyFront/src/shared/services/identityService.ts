import api from './api';
import type { AxiosError, UploadResponse } from '../types/axiosTypes';  
import type { 
  Identity,
  CreateIdentityData,
  UpdateIdentityData,
  HandType
} from '../types/identityTypes'; 

export const identityService = {
  // POST /prisoners/{prisonerId}/identity
  async createIdentity(prisonerId: string, data: CreateIdentityData): Promise<Identity> {
    try {
      const response = await api.post<Identity>(`/prisoners/${prisonerId}/identity`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al crear identidad');
    }
  },

  // GET /prisoners/{prisonerId}/identity
  async getIdentity(prisonerId: string): Promise<Identity> {
    try {
      const response = await api.get<Identity>(`/prisoners/${prisonerId}/identity`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener identidad');
    }
  },

  // PUT /prisoners/{prisonerId}/identity
  async updateIdentity(prisonerId: string, data: UpdateIdentityData): Promise<Identity> {
    try {
      const response = await api.put<Identity>(`/prisoners/${prisonerId}/identity`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al actualizar identidad');
    }
  },

  // POST /prisoners/{prisonerId}/identity/upload-photo
  async uploadPhoto(prisonerId: string, file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await api.post<UploadResponse>(
        `/prisoners/${prisonerId}/identity/upload-photo`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al subir foto');
    }
  },

  // POST /prisoners/{prisonerId}/identity/upload-fingerprint
  async uploadFingerprint(prisonerId: string, file: File, hand: HandType): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('fingerprint', file);
      formData.append('hand', hand);

      const response = await api.post<UploadResponse>(
        `/prisoners/${prisonerId}/identity/upload-fingerprint`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al subir huella dactilar');
    }
  },
};