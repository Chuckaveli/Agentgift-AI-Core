export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode = 500,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export const errors = {
  validation: (message: string) => new AppError(message, "VALIDATION_ERROR", 400),
  unauthorized: (message = "Unauthorized") => new AppError(message, "UNAUTHORIZED", 401),
  forbidden: (message = "Forbidden") => new AppError(message, "FORBIDDEN", 403),
  notFound: (message = "Not found") => new AppError(message, "NOT_FOUND", 404),
  conflict: (message = "Conflict") => new AppError(message, "CONFLICT", 409),
  rateLimit: (message = "Rate limit exceeded") => new AppError(message, "RATE_LIMIT", 429),
  internal: (message = "Internal server error") => new AppError(message, "INTERNAL_ERROR", 500),
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(error.message, "UNKNOWN_ERROR", 500)
  }

  return new AppError("An unknown error occurred", "UNKNOWN_ERROR", 500)
}
