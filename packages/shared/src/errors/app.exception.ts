export class AppException extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly details?: Record<string, unknown>[];
  readonly traceId?: string;

  constructor(
    message: string,
    code = 'INTERNAL_ERROR',
    statusCode = 500,
    details?: Record<string, unknown>[],
    traceId?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.traceId = traceId;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationException extends AppException {
  constructor(message: string, details?: Record<string, unknown>[]) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class ProviderException extends AppException {
  constructor(message: string, details?: Record<string, unknown>[]) {
    super(message, 'PROVIDER_ERROR', 502, details);
  }
}

export class NotFoundException extends AppException {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
  }
}

export class UnauthorizedException extends AppException {
  constructor(message = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', 401);
  }
}
