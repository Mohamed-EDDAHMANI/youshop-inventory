export class ServiceError extends Error {
  public readonly success: boolean;
  public readonly errorType: string;
  public readonly message: string;
  public readonly code: number;
  public readonly serviceName: string;
  public readonly details?: any;
  public readonly timestamp: string;

  constructor(
    errorType: string,
    message: string,
    code: number,
    serviceName: string = 'inventory-service',
    details?: any,
  ) {
    super(message);
    this.success = false;
    this.errorType = errorType;
    this.message = message;
    this.code = code;
    this.serviceName = serviceName;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      success: this.success,
      error: {
        type: this.errorType,
        message: this.message,
        code: this.code,
        serviceName: this.serviceName,
        ...(this.details && { details: this.details }),
      },
      timestamp: this.timestamp,
    };
  }
}

export class ValidationException extends ServiceError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, 'inventory-service', details);
  }
}

export class ResourceNotFoundException extends ServiceError {
  constructor(resource: string, id: string | number) {
    super(
      'RESOURCE_NOT_FOUND',
      `${resource} with identifier ${id} not found`,
      404,
      'inventory-service',
    );
  }
}

export class ConflictException extends ServiceError {
  constructor(message: string) {
    super('CONFLICT_ERROR', message, 409, 'inventory-service');
  }
}

export class InternalServerException extends ServiceError {
  constructor(message: string) {
    super('INTERNAL_SERVER_ERROR', message, 500, 'inventory-service');
  }
}
