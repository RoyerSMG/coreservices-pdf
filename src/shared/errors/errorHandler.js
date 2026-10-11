/**
 * Centralized error handling middleware for Express.
 * Formats all errors consistently and logs appropriately.
 */

import { AppError, Errors } from './AppError.js';
import { ErrorCodes } from './errorCodes.js';

/**
 * Generates a simple request ID for correlation.
 * @returns {string}
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Structured logger for errors.
 * In production, replace with proper logger (pino, winston, etc.)
 * @param {Error} error
 * @param {Object} context
 */
function logError(error, context) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: error instanceof AppError && error.statusCode < 500 ? 'warn' : 'error',
    requestId: context.requestId,
    method: context.method,
    url: context.url,
    error: {
      name: error.name,
      code: error instanceof AppError ? error.code : 'UNKNOWN',
      message: error.message,
      stack: error.stack,
      ...(error.details && { details: error.details }),
    },
  };

  // Use stderr for errors, stdout for warnings
  const stream = logEntry.level === 'error' ? process.stderr : process.stdout;
  stream.write(JSON.stringify(logEntry) + '\n');
}

/**
 * Express error handling middleware.
 * Must be registered after all routes (last middleware).
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function errorHandler(err, req, res, next) {
  const requestId = req.headers['x-request-id'] || generateRequestId();

  // Ensure request ID in response headers for tracing
  res.setHeader('X-Request-ID', requestId);

  // Convert unknown errors to AppError
  const appError = err instanceof AppError ? err : Errors.internal(err);

  // Log error with context
  logError(appError, {
    requestId,
    method: req.method,
    url: req.originalUrl || req.url,
  });

  // Don't leak internal details in production
  const isProduction = process.env.NODE_ENV === 'production';
  const response = appError.toJSON();

  if (isProduction && appError.statusCode >= 500) {
    // Hide internal error details in production
    response.error.message = ErrorMessages[ErrorCodes.ERR_INTERNAL];
    delete response.error.details;
    delete response.error.cause;
  }

  res.status(appError.statusCode).json(response);
}

/**
 * 404 handler for unmatched routes.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function notFoundHandler(req, res) {
  const requestId = req.headers['x-request-id'] || generateRequestId();
  res.setHeader('X-Request-ID', requestId);

  res.status(404).json({
    error: {
      code: ErrorCodes.ERR_BAD_REQUEST,
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    },
  });
}

// Re-export ErrorMessages for use in errorHandler
import { ErrorMessages } from './errorCodes.js';

export { AppError, Errors } from './AppError.js';
export { ErrorCodes } from './errorCodes.js';