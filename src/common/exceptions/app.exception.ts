/**
 * Standard API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: any;
  };
  timestamp: string;
}

/**
 * Custom application exceptions
 */
export class AppException extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public details?: any,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationException extends AppException {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class ResourceNotFoundException extends AppException {
  constructor(resource: string, identifier: string) {
    super(
      'RESOURCE_NOT_FOUND',
      `${resource} with ID ${identifier} not found`,
      404,
      { resource, identifier },
    );
  }
}

export class ConflictException extends AppException {
  constructor(message: string, details?: any) {
    super('CONFLICT', message, 409, details);
  }
}

export class InternalServerException extends AppException {
  constructor(message: string, details?: any) {
    super('INTERNAL_SERVER_ERROR', message, 500, details);
  }
}

export class ServiceUnavailableException extends AppException {
  constructor(service: string, message?: string) {
    super(
      'SERVICE_UNAVAILABLE',
      message || `${service} service is currently unavailable`,
      503,
      { service },
    );
  }
}
