/**
 * Error handling utilities for consistent error management.
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 400,
    public context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Type guard to check if value is an Error instance.
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error
}

/**
 * Extracts error message from various error types.
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return 'An unexpected error occurred'
}

/**
 * Logs and handles errors safely.
 */
export function handleError(
  error: unknown,
  context: string,
  logger: Console = console
): AppError {
  const message = getErrorMessage(error)
  logger.error(`[${context}] ${message}`, error)

  if (error instanceof AppError) {
    return error
  }

  return new AppError(message, 'UNKNOWN_ERROR', 500, { context })
}

/**
 * Converts any error to a user-friendly message.
 */
export function getUserFriendlyMessage(error: unknown, defaultMessage: string = 'Something went wrong'): string {
  if (error instanceof AppError) {
    return error.message
  }
  const message = getErrorMessage(error)
  return message.length > 0 ? message : defaultMessage
}
