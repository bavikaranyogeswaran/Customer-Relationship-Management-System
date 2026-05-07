import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message =
      exception instanceof HttpException
        ? (exception.getResponse() as any).message || exception.getResponse()
        : 'Internal server error';

    // 1. [DB] Map raw Postgres errors to clean HTTP responses
    const pgError = exception as any;
    if (pgError.code) {
      switch (pgError.code) {
        case '23505': // Unique violation
          status = HttpStatus.CONFLICT;
          message = `Resource already exists: ${pgError.detail || 'Duplicate entry'}`;
          break;
        case '23503': // Foreign key violation
          status = HttpStatus.BAD_REQUEST;
          message = `Referenced resource not found: ${pgError.detail || 'Constraint violation'}`;
          break;
        case '22P02': // Invalid input syntax
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid data format provided';
          break;
      }
    }

    // 2. [LOGGING] Capture detailed error info for internal debugging
    this.logger.error(
      `[${request.method}] ${request.url} | Status: ${status} | Error: ${typeof message === 'string' ? message : JSON.stringify(message)}`,
      (exception as any).stack,
    );

    // 3. [SECURITY] Sanitize response: Only return the status and message
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
