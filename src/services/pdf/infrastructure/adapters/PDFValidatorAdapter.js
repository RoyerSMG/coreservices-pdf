/**
 * Adapter implementing PDFValidatorPort using basic PDF structure validation.
 * Checks magic bytes and basic structure.
 */

import { PDFValidatorPort } from '../../domain/ports/PDFValidatorPort.js';

export class PDFValidatorAdapter extends PDFValidatorPort {
  /**
   * Validates a PDF buffer by checking magic bytes and basic structure.
   * @param {Buffer|Uint8Array} buffer - PDF file buffer
   * @returns {Promise<{ valid: boolean, error?: string }>}
   */
  async validate(buffer) {
    if (!buffer || buffer.length === 0) {
      return { valid: false, error: 'Empty buffer' };
    }

    const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

    // Check PDF magic bytes: %PDF-
    const header = buf.subarray(0, 5).toString('ascii');
    if (header !== '%PDF-') {
      return { valid: false, error: 'Invalid PDF magic bytes' };
    }

    // Check for EOF marker (basic structure check)
    const tail = buf.subarray(Math.max(0, buf.length - 1024)).toString('ascii');
    if (!tail.includes('%%EOF')) {
      return { valid: false, error: 'Missing EOF marker' };
    }

    return { valid: true };
  }
}