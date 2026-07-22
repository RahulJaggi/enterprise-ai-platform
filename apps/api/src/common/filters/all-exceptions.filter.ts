import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SYSTEM_CONSTANTS } from '../constants/system.constants';
import { ApiResponseEnvelope } from '../interfaces/api-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const correlationId =
      (request.headers[SYSTEM_CONSTANTS.HEADER_CORRELATION_ID] as string) || 'unknown';

    let errorCode = 'INTERNAL_SERVER_ERROR';
    let errorMessage = 'An unexpected internal server error occurred.';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        errorMessage = (resObj.message as string) || exception.message;
        errorCode = (resObj.error as string) || exception.name;
      } else {
        errorMessage = exception.message;
        errorCode = exception.name;
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled Exception [CorrelationId: ${correlationId}]: ${exception.message}`,
        exception.stack,
      );
    }

    const responseEnvelope: ApiResponseEnvelope<null> = {
      success: false,
      data: null,
      error: {
        code: errorCode,
        message: errorMessage,
        traceId: correlationId,
      },
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(responseEnvelope);
  }
}
