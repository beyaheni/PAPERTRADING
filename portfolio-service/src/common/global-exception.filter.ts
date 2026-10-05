import { status as GrpcStatus } from '@grpc/grpc-js';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { TimeoutError } from 'rxjs';

/** gRPC status -> HTTP status, for errors coming back from market-service. */
const GRPC_TO_HTTP: Record<number, HttpStatus> = {
  [GrpcStatus.INVALID_ARGUMENT]: HttpStatus.BAD_REQUEST,
  [GrpcStatus.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [GrpcStatus.UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [GrpcStatus.DEADLINE_EXCEEDED]: HttpStatus.GATEWAY_TIMEOUT,
};

interface GrpcError {
  code: number;
  details: string;
}

function isGrpcError(error: unknown): error is GrpcError {
  return typeof error === 'object' && error !== null
    && typeof (error as GrpcError).code === 'number'
    && typeof (error as GrpcError).details === 'string';
}

/**
 * Single place where every error becomes an HTTP response:
 *   { timestamp, status, error, message, path }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      message = typeof body === 'string' ? body : (body as { message: string | string[] }).message;
    } else if (isGrpcError(exception)) {
      status = GRPC_TO_HTTP[exception.code] ?? HttpStatus.BAD_GATEWAY;
      message = status === HttpStatus.SERVICE_UNAVAILABLE
        ? 'Market service is unavailable, please retry later'
        : exception.details;
    } else if (exception instanceof TimeoutError) {
      status = HttpStatus.GATEWAY_TIMEOUT;
      message = 'Market service did not answer in time';
    }

    const summary = `${request.method} ${request.url} -> ${status} ${JSON.stringify(message)}`;
    if (status >= 500) {
      this.logger.error(summary, exception instanceof Error ? exception.stack : undefined);
    } else {
      this.logger.warn(summary);
    }

    response.status(status).json({
      timestamp: new Date().toISOString(),
      status,
      error: HttpStatus[status],
      message,
      path: request.url,
    });
  }
}
