  import type { PaginationParams } from "./axiosTypes";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
}

export interface GetUsersParams extends PaginationParams {
  role?: string;
  search?: string;
  isActive?: boolean;
}

export interface UserFilters {
  status?: string;
  gender?: string;
  maritalStatus?: string;
  category?: string;
  citizenshipType?: string;
  admissionDateFrom?: string;
  admissionDateTo?: string;
  buildingNumber?: string;
  cellNumber?: string;
  countryOfOrigin?: string;
  nationality?: string;
}