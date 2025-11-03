import api from './api';
import type { AxiosError } from '../types/axiosTypes';
import type { CompletePrisonerProfile } from '../types/completeProfileTypes';

// ==================== SERVICIO ====================
export const completeProfileService = {
  // GET /prisoners/complete-profile/{id}
  async getCompleteProfile(prisonerId: string): Promise<CompletePrisonerProfile> {
    try {
      const response = await api.get<CompletePrisonerProfile>(
        `/prisoners/complete-profile/${prisonerId}`
      );
      console.log("✅ Perfil completo obtenido:", response.data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener perfil completo');
    }
  },
};