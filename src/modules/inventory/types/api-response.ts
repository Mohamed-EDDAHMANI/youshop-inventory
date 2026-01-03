/**
 * Error details structure
 */
export interface ApiErrorDetails {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

/**
 * Generic API Response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ApiErrorDetails;
  timestamp?: string;
}
