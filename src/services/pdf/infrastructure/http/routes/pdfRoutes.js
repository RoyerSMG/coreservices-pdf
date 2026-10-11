/**
 * PDF service routes.
 * Defines the API endpoints for PDF encryption.
 */

import { Router } from 'express';
import { apiKeyAuth } from '../../../../../shared/middleware/apiKeyAuth.js';
import { pdfUploadMiddleware } from '../middlewares/pdfUploadMiddleware.js';

/**
 * Creates PDF routes with all middleware and controllers wired.
 * @param {import('../controllers/PDFController.js').PDFController} pdfController
 * @returns {Router}
 */
export function createPdfRoutes(pdfController) {
  const router = Router();

  // POST /api/v1/pdf/encrypt
  // Requires X-API-Key header, multipart form with 'file' and 'password' fields
  router.post(
    '/encrypt',
    apiKeyAuth,
    pdfUploadMiddleware,
    pdfController.encrypt.bind(pdfController)
  );

  return router;
}