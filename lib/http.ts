export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "HttpError"
  }
}

export function createHttpError(status: number, message: string, code?: string): HttpError {
  return new HttpError(status, message, code)
}

export const httpErrors = {
  badRequest: (message = "Bad Request") => createHttpError(400, message, "BAD_REQUEST"),
  unauthorized: (message = "Unauthorized") => createHttpError(401, message, "UNAUTHORIZED"),
  forbidden: (message = "Forbidden") => createHttpError(403, message, "FORBIDDEN"),
  notFound: (message = "Not Found") => createHttpError(404, message, "NOT_FOUND"),
  conflict: (message = "Conflict") => createHttpError(409, message, "CONFLICT"),
  tooManyRequests: (message = "Too Many Requests") => createHttpError(429, message, "RATE_LIMITED"),
  internalServerError: (message = "Internal Server Error") => createHttpError(500, message, "INTERNAL_ERROR"),
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: any
  }
  meta?: {
    timestamp: string
    requestId?: string
  }
}

export function createSuccessResponse<T>(data: T, meta?: ApiResponse["meta"]): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  }
}

export function createErrorResponse(error: HttpError | Error, meta?: ApiResponse["meta"]): ApiResponse {
  const isHttpError = error instanceof HttpError

  return {
    success: false,
    error: {
      message: error.message,
      code: isHttpError ? error.code : "UNKNOWN_ERROR",
      details: isHttpError ? undefined : error.stack,
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  }
}
