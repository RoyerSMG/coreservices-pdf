/**
 * Port interface for PDF validation.
 * Implementations must validate PDF structure and return validation result.
 */

export class PDFValidatorPort {
  /**
   * Validates a PDF buffer.
   * @param {Buffer|Uint8Array} buffer - PDF file buffer
   * @returns {Promise<{ valid: boolean, error?: string }>}
   */
  async validate(buffer) {
    throw new Error('validate() must be implemented by adapter');
  }
}