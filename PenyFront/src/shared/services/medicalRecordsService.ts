import api from './api';
import type { AxiosError, UploadResponse } from '../types/axiosTypes';  // ✅ USAR EXISTENTE
import type { 
  MedicalRecord,
  CreateMedicalRecordData,
  UpdateMedicalRecordData
} from '../types/medicalRecordTypes';  

export const medicalRecordsService = {
  // POST /prisoners/{prisonerId}/medical-records
  async createMedicalRecord(prisonerId: string, data: CreateMedicalRecordData): Promise<MedicalRecord> {
    try {
      const response = await api.post<MedicalRecord>(`/prisoners/${prisonerId}/medical-records`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al crear registro médico');
    }
  },

  // GET /prisoners/{prisonerId}/medical-records
  async getMedicalRecords(prisonerId: string): Promise<MedicalRecord[]> {
    try {
      const response = await api.get<MedicalRecord[]>(`/prisoners/${prisonerId}/medical-records`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener registros médicos');
    }
  },

  // GET /prisoners/{prisonerId}/medical-records/{recordId}
  async getMedicalRecord(prisonerId: string, recordId: string): Promise<MedicalRecord> {
    try {
      const response = await api.get<MedicalRecord>(`/prisoners/${prisonerId}/medical-records/${recordId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener registro médico');
    }
  },

  // PUT /prisoners/{prisonerId}/medical-records/{recordId}
  async updateMedicalRecord(prisonerId: string, recordId: string, data: UpdateMedicalRecordData): Promise<MedicalRecord> {
    try {
      const response = await api.put<MedicalRecord>(`/prisoners/${prisonerId}/medical-records/${recordId}`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al actualizar registro médico');
    }
  },

  // DELETE /prisoners/{prisonerId}/medical-records/{recordId}
  async deleteMedicalRecord(prisonerId: string, recordId: string): Promise<void> {
    try {
      await api.delete(`/prisoners/${prisonerId}/medical-records/${recordId}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al eliminar registro médico');
    }
  },

  // POST /prisoners/{prisonerId}/medical-records/{recordId}/upload
  async uploadMedicalFile(prisonerId: string, recordId: string, file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<UploadResponse>(
        `/prisoners/${prisonerId}/medical-records/${recordId}/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al subir archivo médico');
    }
  },
};