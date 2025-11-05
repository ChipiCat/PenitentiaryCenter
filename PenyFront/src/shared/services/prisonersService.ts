import api from './api';
import type { AxiosError, PaginationResponse } from '../types/axiosTypes';
import type {
  PrisonerBase,
  CreatePrisonerData,
  UpdatePrisonerData,
  GetPrisonersParams,
  PrisionerListItem
} from '../types/prisonerTypes';
import type { 
  PrisonerSearchQuery, 
  PrisonerSearchFilters,
  PrisonerSearchResponse,
  OrderByField
} from '../types/prisonerSearchTypes';

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

  /**
   * GET /prisoners/search
   * Advanced prisoner search with filters
   * Matches backend SearchPrisonerQueryDto
   */
  async searchPrisoners(
    searchQuery: PrisonerSearchQuery
  ): Promise<PrisonerSearchResponse> {
    try {
      // Build query parameters - NestJS requires flat structure for nested DTOs
      const params: Record<string, string | number | boolean> = {
        page: searchQuery.page || 1,
        limit: searchQuery.limit || 10,
        includeDeleted: searchQuery.includeDeleted || false,
        orderBy: searchQuery.orderBy || 'createdAt',
        orderDirection: searchQuery.orderDirection || 'desc',
      };

      // Add search query if provided
      if (searchQuery.query && searchQuery.query.trim() !== '') {
        params.query = searchQuery.query.trim();
      }

      // Add filters as flat parameters
      // NestJS with @Type() decorator will reconstruct the nested object
      if (searchQuery.filters && Object.keys(searchQuery.filters).length > 0) {
        Object.entries(searchQuery.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            // Send as flat parameters: status, gender, etc.
            params[key] = value;
          }
        });
      }

      const response = await api.get<PrisonerSearchResponse>('/prisoners/search', {
        params,
      });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        axiosError.response?.data?.message || 'Error al buscar prisioneros'
      );
    }
  },

  /**
   * @deprecated Use searchPrisoners instead
   * Legacy method for backward compatibility
   */
  async getAllPrisoners(
    page: number,
    limit: number,
    query: string,
    filters?: PrisonerSearchFilters,
    includeDeleted: boolean = false,
    orderBy?: string,
    orderDirection: 'asc' | 'desc' = 'desc'
  ): Promise<PaginationResponse<PrisionerListItem>> {
    try {
      const searchQuery: PrisonerSearchQuery = {
        page,
        limit,
        query: query.trim() || undefined,
        filters,
        includeDeleted,
        orderBy: orderBy as OrderByField,
        orderDirection,
      };

      const response = await this.searchPrisoners(searchQuery);

      // Map response - structure already matches
      return {
        data: response.data as unknown as PrisionerListItem[],
        pagination: response.pagination,
      } as PaginationResponse<PrisionerListItem>;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        axiosError.response?.data?.message || 'Error al obtener todos los prisioneros'
      );
    }
  },
};