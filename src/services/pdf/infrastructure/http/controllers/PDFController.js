/**
 * HTTP Controller for PDF encryption endpoint.
 * Handles request/response transformation and delegates to use case.
 */

import { EncryptPDFDTO } from '../../../application/dto/EncryptPDFDTO.js';

export class PDFController {
  /**
   * @param {import('../../../application/use-cases/EncryptPDFUseCase.js').EncryptPDFUseCase} encryptUseCase
   */
  constructor(encryptUseCase) {
    this._encryptUseCase = encryptUseCase;
  }

  /**
   * POST /api/v1/pdf/encrypt
   * Encrypts a PDF file with the provided password.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async encrypt(req, res, next) {
    try {
      // Build DTO from request (validated by pdfUploadMiddleware)
      const dto = EncryptPDFDTO.fromRequest(req);

      // Execute use case
      const encryptedBuffer = await this._encryptUseCase.execute(dto);

      // Return encrypted PDF as binary response
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="encrypted_${req.file.originalname}"`,
        'Content-Length': encryptedBuffer.length,
        'Cache-Control': 'no-store, private',
      });

      res.send(encryptedBuffer);
    } catch (error) {
      next(error);
    }
  }
}