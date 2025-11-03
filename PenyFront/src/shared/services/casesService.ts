import api from './api';
import type { AxiosError } from '../types/axiosTypes';  
import type { 
  Case,
  CreateCaseData,
  UpdateCaseData,
  CasesCompleteResponse,
  GetCasesParams
} from '../types/caseTypes';  


export const casesService = {
  async createCase(prisonerId: string, data: CreateCaseData): Promise<Case> {
    try {
      const response = await api.post<Case>(`/prisoners/${prisonerId}/cases`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al crear caso');
    }
  },

  async getCases(prisonerId: string, params?: GetCasesParams): Promise<Case[]> {
    try {
      const response = await api.get<Case[]>(`/prisoners/${prisonerId}/cases`, { params });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener casos');
    }
  },

  async getCasesComplete(prisonerId: string): Promise<CasesCompleteResponse> {
    try {
      const response = await api.get<CasesCompleteResponse>(`/prisoners/${prisonerId}/cases/complete`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener perfil completo de casos');
    }
  },

  async getCase(caseId: string): Promise<Case> {
    try {
      const response = await api.get<Case>(`/cases/${caseId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener caso');
    }
  },

  async updateCase(caseId: string, data: UpdateCaseData): Promise<Case> {
    try {
      const response = await api.put<Case>(`/cases/${caseId}`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al actualizar caso');
    }
  },

  // DELETE /cases/{caseId}
  async deleteCase(caseId: string): Promise<void> {
    try {
      await api.delete(`/cases/${caseId}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al eliminar caso');
    }
  },

  async getCompleteCase(prisonerId: string): Promise<Case[]> {
    try {
      const response = await api.get<Case[]>(`/prisoners/${prisonerId}/cases/complete`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener caso completo');
    }
  },
};
