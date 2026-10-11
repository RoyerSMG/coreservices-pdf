/**
 * Base application error class.
 * All domain/application errors should extend this class.
 */

import { ErrorCodes, ErrorStatusCodes, ErrorMessages } from './errorCodes.js';

/**
 * @typedef {Object} AppErrorOptions
 * @property {string} [code] - Error code from ErrorCodes
 * @property {number} [statusCode] - HTTP status code (defaults based on code)
 * @property {string} [message] - Human-readable message (defaults based on code)
 * @property {Object} [details] - Additional error details
 * @property {Error} [cause] - Original error that caused this error
 */

export class AppError extends Error {
  /**
   * @param {AppErrorOptions} options
   */
  constructor({ code, statusCode, message, details, cause } = {}) {
    const errorCode = code || ErrorCodes.ERR_INTERNAL;
    super(message || ErrorMessages[errorCode] || 'Unknown error');

    this.name = 'AppError';
    this.code = errorCode;
    this.statusCode = statusCode || ErrorStatusCodes[errorCode] || 500;
    this.details = details;
    this.cause = cause;

    // Maintains proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Creates an AppError from an unknown error (catch-all).
   * @param {unknown} error - Caught error
   * @param {string} [defaultCode] - Default code if error is not AppError
   * @returns {AppError}
   */
  static fromUnknown(error, defaultCode = ErrorCodes.ERR_INTERNAL) {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError({
        code: defaultCode,
        message: error.message,
        cause: error,
      });
    }

    return new AppError({
      code: defaultCode,
      message: String(error),
    });
  }

  /**
   * Serializes error for JSON response.
   * @returns {Object}
   */
  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
        ...(process.env.NODE_ENV !== 'production' && this.cause && { cause: this.cause.message }),
      },
    };
  }
}

/**
 * Factory functions for common errors.
 */
export const Errors = {
  unauthorized: (details) => new AppError({ code: ErrorCodes.ERR_UNAUTHORIZED, details }),
  invalidApiKey: () => new AppError({ code: ErrorCodes.ERR_INVALID_API_KEY }),
  badRequest: (message, details) => new AppError({ code: ErrorCodes.ERR_BAD_REQUEST, message, details }),
  validationFailed: (details) => new AppError({ code: ErrorCodes.ERR_VALIDATION_FAILED, details }),
  fileTooLarge: (maxSize) => new AppError({
    code: ErrorCodes.ERR_FILE_TOO_LARGE,
    details: { maxSizeBytes: maxSize, maxSizeMB: Math.round(maxSize / 1024 / 1024) },
  }),
  invalidFileType: (allowedTypes) => new AppError({
    code: ErrorCodes.ERR_INVALID_FILE_TYPE,
    details: { allowedTypes },
  }),
  missingField: (field) => new AppError({
    code: ErrorCodes.ERR_MISSING_FIELD,
    details: { field },
  }),
  invalidFieldValue: (field, value, reason) => new AppError({
    code: ErrorCodes.ERR_INVALID_FIELD_VALUE,
    details: { field, value, reason },
  }),
  invalidPdf: (reason) => new AppError({ code: ErrorCodes.ERR_INVALID_PDF, details: { reason } }),
  encryptionFailed: (reason) => new AppError({ code: ErrorCodes.ERR_ENCRYPTION_FAILED, details: { reason } }),
  passwordTooShort: (minLength) => new AppError({
    code: ErrorCodes.ERR_PASSWORD_TOO_SHORT,
    details: { minLength },
  }),
  internal: (cause) => AppError.fromUnknown(cause, ErrorCodes.ERR_INTERNAL),
  configuration: (details) => new AppError({ code: ErrorCodes.ERR_CONFIGURATION, details }),
};