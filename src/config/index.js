/**
 * Centralized configuration loader and validator.
 * Loads environment variables and provides typed access.
 */

import 'dotenv/config';

/**
 * @typedef {Object} Config
 * @property {number} port
 * @property {string} nodeEnv
 * @property {string} apiKey
 * @property {number} maxFileSize
 */

/**
 * Validates required environment variables and returns typed config.
 * @returns {Config}
 * @throws {Error} If required variables are missing or invalid
 */
function loadConfig() {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'your-super-secret-api-key-change-in-production') {
    throw new Error('API_KEY is required and must be changed from default value');
  }

  const port = parseInt(process.env.PORT || '3000', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid port number (1-65535)');
  }

  const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '104857600', 10);
  if (isNaN(maxFileSize) || maxFileSize < 1) {
    throw new Error('MAX_FILE_SIZE must be a positive integer (bytes)');
  }

  const nodeEnv = process.env.NODE_ENV || 'development';
  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be one of: development, production, test');
  }

  return {
    port,
    nodeEnv,
    apiKey,
    maxFileSize,
  };
}

const config = loadConfig();

export default config;