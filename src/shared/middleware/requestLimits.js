/**
 * Middleware for global request size limits.
 * Applies to JSON and raw body parsing (not multipart - handled by busboy).
 */

import config from '../../config/index.js';
import { Errors } from '../errors/AppError.js';

/**
 * Express middleware to enforce request size limits for non-multipart requests.
 * Multipart limits are enforced in pdfUploadMiddleware via busboy.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function requestLimits(req, res, next) {
  // Skip for multipart - busboy handles it
  const contentType = req.headers['content-type'] || '';
  if (contentType.startsWith('multipart/form-data')) {
    return next();
  }

  // Check content-length header if present
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > config.maxFileSize) {
    return next(Errors.fileTooLarge(config.maxFileSize));
  }

  next();
}

/**
 * Creates Express built-in middleware with size limits.
 * Uses dynamic import for ESM compatibility.
 */
export async function createBodyParsers() {
  const express = await import('express');
  return {
    jsonLimitMiddleware: express.json({ limit: config.maxFileSize }),
    rawLimitMiddleware: express.raw({ limit: config.maxFileSize, type: 'application/pdf' }),
  };
}