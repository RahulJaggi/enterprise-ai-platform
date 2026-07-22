import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { SYSTEM_CONSTANTS } from '../constants/system.constants';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const existingCorrelationId = req.headers[SYSTEM_CONSTANTS.HEADER_CORRELATION_ID];
    const correlationId =
      typeof existingCorrelationId === 'string'
        ? existingCorrelationId
        : `corr_${randomUUID().replace(/-/g, '')}`;

    req.headers[SYSTEM_CONSTANTS.HEADER_CORRELATION_ID] = correlationId;
    res.setHeader(SYSTEM_CONSTANTS.HEADER_CORRELATION_ID, correlationId);
    next();
  }
}
