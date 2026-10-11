/**
 * Standardized application error codes.
 * Used across all layers for consistent error handling.
 */

export const ErrorCodes = {
  // Authentication & Authorization
  ERR_UNAUTHORIZED: 'ERR_UNAUTHORIZED',
  ERR_FORBIDDEN: 'ERR_FORBIDDEN',
  ERR_INVALID_API_KEY: 'ERR_INVALID_API_KEY',

  // Request Validation
  ERR_BAD_REQUEST: 'ERR_BAD_REQUEST',
  ERR_VALIDATION_FAILED: 'ERR_VALIDATION_FAILED',
  ERR_FILE_TOO_LARGE: 'ERR_FILE_TOO_LARGE',
  ERR_INVALID_FILE_TYPE: 'ERR_INVALID_FILE_TYPE',
  ERR_MISSING_FIELD: 'ERR_MISSING_FIELD',
  ERR_INVALID_FIELD_VALUE: 'ERR_INVALID_FIELD_VALUE',

  // PDF Processing
  ERR_INVALID_PDF: 'ERR_INVALID_PDF',
  ERR_ENCRYPTION_FAILED: 'ERR_ENCRYPTION_FAILED',
  ERR_PDF_CORRUPTED: 'ERR_PDF_CORRUPTED',
  ERR_PASSWORD_TOO_SHORT: 'ERR_PASSWORD_TOO_SHORT',

  // Internal
  ERR_INTERNAL: 'ERR_INTERNAL',
  ERR_SERVICE_UNAVAILABLE: 'ERR_SERVICE_UNAVAILABLE',
  ERR_CONFIGURATION: 'ERR_CONFIGURATION',
};

/**
 * HTTP status code mapping for error codes.
 * @type {Record<string, number>}
 */
export const ErrorStatusCodes = {
  [ErrorCodes.ERR_UNAUTHORIZED]: 401,
  [ErrorCodes.ERR_FORBIDDEN]: 403,
  [ErrorCodes.ERR_INVALID_API_KEY]: 401,
  [ErrorCodes.ERR_BAD_REQUEST]: 400,
  [ErrorCodes.ERR_VALIDATION_FAILED]: 400,
  [ErrorCodes.ERR_FILE_TOO_LARGE]: 413,
  [ErrorCodes.ERR_INVALID_FILE_TYPE]: 400,
  [ErrorCodes.ERR_MISSING_FIELD]: 400,
  [ErrorCodes.ERR_INVALID_FIELD_VALUE]: 400,
  [ErrorCodes.ERR_INVALID_PDF]: 400,
  [ErrorCodes.ERR_ENCRYPTION_FAILED]: 500,
  [ErrorCodes.ERR_PDF_CORRUPTED]: 400,
  [ErrorCodes.ERR_PASSWORD_TOO_SHORT]: 400,
  [ErrorCodes.ERR_INTERNAL]: 500,
  [ErrorCodes.ERR_SERVICE_UNAVAILABLE]: 503,
  [ErrorCodes.ERR_CONFIGURATION]: 500,
};

/**
 * Human-readable messages for error codes (Spanish for user-facing).
 * @type {Record<string, string>}
 */
export const ErrorMessages = {
  [ErrorCodes.ERR_UNAUTHORIZED]: 'No autorizado: credenciales inválidas o faltantes',
  [ErrorCodes.ERR_FORBIDDEN]: 'Acceso denegado',
  [ErrorCodes.ERR_INVALID_API_KEY]: 'Clave de API inválida',
  [ErrorCodes.ERR_BAD_REQUEST]: 'Petición incorrecta',
  [ErrorCodes.ERR_VALIDATION_FAILED]: 'Validación fallida',
  [ErrorCodes.ERR_FILE_TOO_LARGE]: 'El archivo supera el tamaño máximo permitido',
  [ErrorCodes.ERR_INVALID_FILE_TYPE]: 'Tipo de archivo no válido',
  [ErrorCodes.ERR_MISSING_FIELD]: 'Campo requerido faltante',
  [ErrorCodes.ERR_INVALID_FIELD_VALUE]: 'Valor de campo inválido',
  [ErrorCodes.ERR_INVALID_PDF]: 'El archivo no es un PDF válido',
  [ErrorCodes.ERR_ENCRYPTION_FAILED]: 'Error al encriptar el documento',
  [ErrorCodes.ERR_PDF_CORRUPTED]: 'El archivo PDF está corrupto',
  [ErrorCodes.ERR_PASSWORD_TOO_SHORT]: 'La contraseña debe tener al menos 4 caracteres',
  [ErrorCodes.ERR_INTERNAL]: 'Error interno del servidor',
  [ErrorCodes.ERR_SERVICE_UNAVAILABLE]: 'Servicio no disponible temporalmente',
  [ErrorCodes.ERR_CONFIGURATION]: 'Error de configuración del servidor',
};