export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface DeploymentStatusResponse {
  success: boolean;
  status: string;
  message: string;
  buildId?: string;
  deployUrl?: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  objectKey: string;
  publicUrl?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
  token: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  error: string;
  details?: ValidationError[];
  timestamp: string;
}
