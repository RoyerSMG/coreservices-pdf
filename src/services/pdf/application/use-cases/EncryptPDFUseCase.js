/**
 * Use case for PDF encryption.
 * Orchestrates validation and encryption using domain ports.
 */

import { EncryptionOptions } from '../../domain/value-objects/EncryptionOptions.js';
import { PDFDocument } from '../../domain/entities/PDFDocument.js';
import { AppError, Errors } from '../../../../shared/errors/AppError.js';
import { ErrorCodes } from '../../../../shared/errors/errorCodes.js';

export class EncryptPDFUseCase {
  /**
   * @param {import('../../domain/ports/PDFValidatorPort.js').PDFValidatorPort} pdfValidator
   * @param {import('../../domain/ports/PDFEncryptorPort.js').PDFEncryptorPort} pdfEncryptor
   */
  constructor(pdfValidator, pdfEncryptor) {
    this._pdfValidator = pdfValidator;
    this._pdfEncryptor = pdfEncryptor;
  }

  /**
   * Executes the PDF encryption use case.
   * @param {EncryptPDFDTO} dto
   * @returns {Promise<Uint8Array>} Encrypted PDF buffer
   */
  async execute(dto) {
    // 1. Validate password length (RF-3)
    if (dto.password.length < 4) {
      throw Errors.passwordTooShort(4);
    }

    // 2. Create domain entity
    const pdfDocument = PDFDocument.create(dto.fileBuffer, dto.originalName);

    // 3. Validate PDF structure
    const validation = pdfDocument.validate();
    if (!validation.valid) {
      throw Errors.invalidPdf(validation.error);
    }

    // 4. Also validate via port (additional validation layer)
    const portValidation = await this._pdfValidator.validate(dto.fileBuffer);
    if (!portValidation.valid) {
      throw Errors.invalidPdf(portValidation.error);
    }

    // 5. Build encryption options (RF-4: default permissions)
    const encryptionOptions = EncryptionOptions.fromPassword(dto.password);

    // 6. Encrypt PDF
    try {
      const encryptedBuffer = await this._pdfEncryptor.encrypt(dto.fileBuffer, encryptionOptions);
      return encryptedBuffer;
    } catch (error) {
      throw Errors.encryptionFailed(error.message);
    }
  }
}