/**
 * Port interface for PDF encryption.
 * Implementations must encrypt a PDF buffer with given options.
 */

export class PDFEncryptorPort {
  /**
   * Encrypts a PDF buffer.
   * @param {Buffer|Uint8Array} buffer - PDF file buffer
   * @param {import('../../value-objects/EncryptionOptions.js').EncryptionOptions} options - Encryption options
   * @returns {Promise<Uint8Array>} Encrypted PDF as Uint8Array
   */
  async encrypt(buffer, options) {
    throw new Error('encrypt() must be implemented by adapter');
  }
}