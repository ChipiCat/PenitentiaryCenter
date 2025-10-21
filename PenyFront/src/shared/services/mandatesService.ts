import api from './api';
import type { AxiosError, UploadResponse } from '../types/axiosTypes';
import type { 
  Mandate,
  CreateMandateData,
  UpdateMandateData
} from '../types/mandateTypes'; 

export const mandatesService = {
  // POST /cases/{caseId}/mandates
  async createMandate(caseId: string, data: CreateMandateData): Promise<Mandate> {
    try {
      const response = await api.post<Mandate>(`/cases/${caseId}/mandates`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al crear mandato');
    }
  },

  // GET /cases/{caseId}/mandates
  async getMandates(caseId: string): Promise<Mandate[]> {
    try {
      const response = await api.get<Mandate[]>(`/cases/${caseId}/mandates`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener mandatos');
    }
  },

  // GET /cases/{caseId}/mandates/active
  async getActiveMandates(caseId: string): Promise<Mandate[]> {
    try {
      const response = await api.get<Mandate[]>(`/cases/${caseId}/mandates/active`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener mandatos activos');
    }
  },

  // GET /mandates/{mandateId}
  async getMandate(mandateId: string): Promise<Mandate> {
    try {
      const response = await api.get<Mandate>(`/mandates/${mandateId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener mandato');
    }
  },

  // PUT /mandates/{mandateId}
  async updateMandate(mandateId: string, data: UpdateMandateData): Promise<Mandate> {
    try {
      const response = await api.put<Mandate>(`/mandates/${mandateId}`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al actualizar mandato');
    }
  },

  // DELETE /mandates/{mandateId}
  async deleteMandate(mandateId: string): Promise<void> {
    try {
      await api.delete(`/mandates/${mandateId}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al eliminar mandato');
    }
  },

  // POST /mandates/{mandateId}/file
  async uploadMandateFile(mandateId: string, file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<UploadResponse>(
        `/mandates/${mandateId}/file`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al subir archivo del mandato');
    }
  },

  // DELETE /mandates/{mandateId}/file
  async deleteMandateFile(mandateId: string): Promise<void> {
    try {
      await api.delete(`/mandates/${mandateId}/file`);
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al eliminar archivo del mandato');
    }
  },
};