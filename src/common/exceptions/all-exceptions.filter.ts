import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { AppException, ApiErrorResponse } from './app.exception';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    let errorResponse: ApiErrorResponse;

    // Handle custom AppException
    if (exception instanceof AppException) {
      this.logger.warn(`[${exception.code}] ${exception.message}`);
      errorResponse = this.formatErrorResponse(
        exception.code,
        exception.message,
        exception.statusCode,
        exception.details,
      );
      
      // For RPC context, throw RpcException with formatted response
      throw new RpcException(errorResponse);
    }
    // Handle NestJS HttpException
    else if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      let message = exception.message;
      let details: any = null;

      if (typeof exceptionResponse === 'object') {
        message = exceptionResponse['message'] || message;
        if (exceptionResponse['error']) {
          details = exceptionResponse['error'];
        }
      }

      const code = this.getErrorCode(status);
      this.logger.warn(`[${code}] ${message}`);

      errorResponse = this.formatErrorResponse(code, message, status, details);
      throw new RpcException(errorResponse);
    }
    // Handle RPC exceptions (from microservices)
    else if (exception instanceof RpcException) {
      const error = exception.getError();
      this.logger.error(`RPC Error: ${JSON.stringify(error)}`);

      errorResponse = this.formatErrorResponse(
        'RPC_ERROR',
        'Failed to communicate with microservice',
        503,
        error,
      );
      throw new RpcException(errorResponse);
    }
    // Handle standard Error
    else if (exception instanceof Error) {
      this.logger.error(`Unexpected error: ${exception.message}`, exception.stack);

      errorResponse = this.formatErrorResponse(
        'INTERNAL_SERVER_ERROR',
        exception.message || 'An unexpected error occurred',
        500,
        { originalError: exception.message },
      );
      throw new RpcException(errorResponse);
    }
    // Handle unknown errors
    else {
      this.logger.error(`Unknown error: ${JSON.stringify(exception)}`);

      errorResponse = this.formatErrorResponse(
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred',
        500,
        { error: exception },
      );
      throw new RpcException(errorResponse);
    }
  }

  /**
   * Format error response in standard format
   */
  private formatErrorResponse(
    code: string,
    message: string,
    statusCode: number,
    details?: any,
  ): ApiErrorResponse {
    return {
      success: false,
      error: {
        code,
        message,
        statusCode,
        ...(details && { details }),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Map HTTP status codes to error codes
   */
  private getErrorCode(status: number): string {
    switch (status) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 422:
        return 'VALIDATION_ERROR';
      case 429:
        return 'TOO_MANY_REQUESTS';
      case 500:
        return 'INTERNAL_SERVER_ERROR';
      case 503:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'UNKNOWN_ERROR';
    }
  }
}
