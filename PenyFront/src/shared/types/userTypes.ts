import type { PaginationParams } from "./axiosTypes";
import type { Entity } from "./commonTypes";
import type { FileInfo } from "./filesTypes";

export interface User extends Entity {
  email: string;
  name: string;
  role: "SECRETARY" | "DIRECTOR" | "ADMIN";
  photoFileId?: string;
  photoFile?: FileInfo;
  isFirstLogin: boolean;
  cellphone?: string;
  ci?: string;
  department?: string;
  departmentalDirectorateUnit?: string;
}

export interface UserStat {
  title: string;
  value: number;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
}

export interface UserActions {
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: string;
  photoUrl?: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
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

export interface UserStats {
  total: number;
  activos: number;
  inactivos: number;
}
