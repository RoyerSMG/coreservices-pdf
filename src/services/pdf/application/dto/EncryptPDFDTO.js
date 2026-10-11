/**
 * Data Transfer Object for PDF encryption request.
 * Encapsulates data coming from the HTTP layer.
 */

export class EncryptPDFDTO {
  /**
   * @param {Object} params
   * @param {Buffer} params.fileBuffer - Raw PDF file buffer
   * @param {string} params.password - Encryption password (owner password)
   * @param {string} params.originalName - Original filename
   * @param {number} params.size - File size in bytes
   */
  constructor({ fileBuffer, password, originalName, size }) {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('fileBuffer is required');
    }
    if (!password || typeof password !== 'string') {
      throw new Error('password is required');
    }
    if (!originalName || typeof originalName !== 'string') {
      throw new Error('originalName is required');
    }
    if (typeof size !== 'number' || size <= 0) {
      throw new Error('size must be a positive number');
    }

    this._fileBuffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
    this._password = password;
    this._originalName = originalName;
    this._size = size;
  }

  get fileBuffer() {
    return this._fileBuffer;
  }

  get password() {
    return this._password;
  }

  get originalName() {
    return this._originalName;
  }

  get size() {
    return this._size;
  }

  /**
   * Creates DTO from Express request (after busboy middleware).
   * @param {import('express').Request} req - Express request with req.fileBuffer, req.body.password, req.file.originalname
   * @returns {EncryptPDFDTO}
   */
  static fromRequest(req) {
    const fileBuffer = req.fileBuffer;
    const password = req.body?.password;
    const originalName = req.file?.originalname || 'document.pdf';

    if (!fileBuffer) {
      throw new Error('File buffer not found in request');
    }
    if (!password) {
      throw new Error('Password field is required');
    }

    return new EncryptPDFDTO({
      fileBuffer,
      password,
      originalName,
      size: fileBuffer.length,
    });
  }
}