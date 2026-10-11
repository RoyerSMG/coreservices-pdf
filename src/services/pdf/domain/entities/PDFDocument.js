/**
 * Domain entity representing a PDF document.
 * Encapsulates the raw buffer and metadata.
 */

export class PDFDocument {
  /**
   * @param {Object} params
   * @param {Buffer|Uint8Array} params.buffer - Raw PDF file buffer
   * @param {string} params.originalName - Original filename from upload
   * @param {number} params.size - File size in bytes
   */
  constructor({ buffer, originalName, size }) {
    if (!buffer || buffer.length === 0) {
      throw new Error('PDF buffer cannot be empty');
    }
    if (!originalName || typeof originalName !== 'string') {
      throw new Error('Original name is required');
    }
    if (typeof size !== 'number' || size <= 0) {
      throw new Error('Size must be a positive number');
    }
    if (buffer.length !== size) {
      throw new Error('Buffer length does not match declared size');
    }

    this._buffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    this._originalName = originalName;
    this._size = size;
  }

  get buffer() {
    return this._buffer;
  }

  get originalName() {
    return this._originalName;
  }

  get size() {
    return this._size;
  }

  /**
   * Validates the PDF by checking magic bytes.
   * @returns {{ valid: boolean, error?: string }}
   */
  validate() {
    // Check PDF magic bytes: %PDF-
    const header = this._buffer.subarray(0, 5).toString('ascii');
    if (header !== '%PDF-') {
      return { valid: false, error: 'Invalid PDF magic bytes' };
    }
    return { valid: true };
  }

  /**
   * Creates a PDFDocument from a busboy file stream result.
   * @param {Buffer} buffer
   * @param {string} originalName
   * @returns {PDFDocument}
   */
  static create(buffer, originalName) {
    return new PDFDocument({
      buffer,
      originalName,
      size: buffer.length,
    });
  }

  toJSON() {
    return {
      originalName: this._originalName,
      size: this._size,
    };
  }
}