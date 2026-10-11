/**
 * Middleware for X-API-Key authentication.
 * Validates the API key from header against configured value.
 */

import config from '../../config/index.js';
import { Errors } from '../errors/AppError.js';

/**
 * Express middleware to validate X-API-Key header.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return next(Errors.unauthorized({ reason: 'Missing X-API-Key header' }));
  }

  if (apiKey !== config.apiKey) {
    return next(Errors.invalidApiKey());
  }

  // Attach authenticated flag for potential downstream use
  req.auth = { apiKey: true };
  next();
}

/**
 * Optional: Middleware that allows both API key and future auth methods.
 * Currently just aliases apiKeyAuth.
 * @type {import('express').RequestHandler}
 */
export const authenticate = apiKeyAuth;