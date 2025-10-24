export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface AxiosError {
  response?: {
    data?: ApiErrorResponse;
    status: number;
  };
  message: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}