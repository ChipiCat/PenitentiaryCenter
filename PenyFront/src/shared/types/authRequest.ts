export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  photoFileId?: string;
  cellphone?: string;
  ci?: string;
  department?: string;
  departmentalDirectorateUnit?: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface LogoutRequest {
    refreshToken: string;
}