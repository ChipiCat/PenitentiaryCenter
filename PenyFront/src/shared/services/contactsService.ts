import api from './api';
import type { AxiosError } from '../types/axiosTypes';  
import type { 
  Contact,
  CreateContactData,
  UpdateContactData
} from '../types/contactTypes';  

export const contactsService = {
  // POST /prisoners/{prisonerId}/contacts
  async createContact(prisonerId: string, data: CreateContactData): Promise<Contact> {
    try {
      const response = await api.post<Contact>(`/prisoners/${prisonerId}/contacts`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al agregar contacto');
    }
  },

  // GET /prisoners/{prisonerId}/contacts
  async getContacts(prisonerId: string): Promise<Contact[]> {
    try {
      const response = await api.get<Contact[]>(`/prisoners/${prisonerId}/contacts`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener contactos');
    }
  },

  // GET /prisoners/{prisonerId}/contacts/{contactId}
  async getContact(prisonerId: string, contactId: string): Promise<Contact> {
    try {
      const response = await api.get<Contact>(`/prisoners/${prisonerId}/contacts/${contactId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al obtener contacto');
    }
  },

  // PUT /prisoners/{prisonerId}/contacts/{contactId}
  async updateContact(prisonerId: string, contactId: string, data: UpdateContactData): Promise<Contact> {
    try {
      const response = await api.put<Contact>(`/prisoners/${prisonerId}/contacts/${contactId}`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al actualizar contacto');
    }
  },

  // DELETE /prisoners/{prisonerId}/contacts/{contactId}
  async deleteContact(prisonerId: string, contactId: string): Promise<void> {
    try {
      await api.delete(`/prisoners/${prisonerId}/contacts/${contactId}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(axiosError.response?.data?.message || 'Error al eliminar contacto');
    }
  },
};