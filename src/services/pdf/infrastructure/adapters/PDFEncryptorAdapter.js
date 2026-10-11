/**
 * Adapter implementing PDFEncryptorPort using @pdfsmaller/pdf-encrypt.
 * Handles PDF encryption with AES-256 and permission settings.
 */

import { PDFEncryptorPort } from '../../domain/ports/PDFEncryptorPort.js';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt';

export class PDFEncryptorAdapter extends PDFEncryptorPort {
  /**
   * Encrypts a PDF buffer with the given options.
   * @param {Buffer|Uint8Array} buffer - PDF file buffer
   * @param {import('../../../domain/value-objects/EncryptionOptions.js').EncryptionOptions} options - Encryption options
   * @returns {Promise<Uint8Array>} Encrypted PDF as Uint8Array
   */
  async encrypt(buffer, options) {
    const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

    try {
      // @pdfsmaller/pdf-encrypt API expects string passwords and boolean permissions
      // The library internally handles password encoding
      const encryptedBytes = await encryptPDF(buf, options.userPassword || '', {
        ownerPassword: options.ownerPassword,
        algorithm: 'AES-256',
        allowPrinting: options.permissions.print,
        allowModifying: options.permissions.modify,
        allowCopying: options.permissions.copy,
        allowAnnotating: options.permissions.annotate,
        allowFillingForms: options.permissions.fillForms,
        allowExtraction: options.permissions.extract,
        allowAssembly: options.permissions.assemble,
        allowHighQualityPrint: options.permissions.printHighQuality,
      });

      return encryptedBytes;
    } catch (error) {
      throw new Error(`PDF encryption failed: ${error.message}`);
    }
  }
}