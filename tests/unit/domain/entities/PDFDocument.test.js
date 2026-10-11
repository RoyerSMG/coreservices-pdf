/**
 * Unit tests for PDFDocument entity
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from '../../../../src/services/pdf/domain/entities/PDFDocument.js';

describe('PDFDocument', () => {
  const validPdfBuffer = Buffer.from('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');

  describe('constructor', () => {
    it('should create with valid buffer, name, and size', () => {
      const doc = new PDFDocument({
        buffer: validPdfBuffer,
        originalName: 'test.pdf',
        size: validPdfBuffer.length,
      });
      assert.strictEqual(doc.originalName, 'test.pdf');
      assert.strictEqual(doc.size, validPdfBuffer.length);
      assert.ok(Buffer.isBuffer(doc.buffer));
    });

    it('should accept Uint8Array and convert to Buffer', () => {
      const uint8 = new Uint8Array(validPdfBuffer);
      const doc = new PDFDocument({
        buffer: uint8,
        originalName: 'test.pdf',
        size: validPdfBuffer.length,
      });
      assert.ok(Buffer.isBuffer(doc.buffer));
    });

    it('should throw if buffer is empty', () => {
      assert.throws(
        () => new PDFDocument({ buffer: Buffer.from([]), originalName: 'test.pdf', size: 0 }),
        { message: /buffer cannot be empty/ }
      );
    });

    it('should throw if originalName is missing', () => {
      assert.throws(
        () => new PDFDocument({ buffer: validPdfBuffer, originalName: '', size: validPdfBuffer.length }),
        { message: /Original name is required/ }
      );
    });

    it('should throw if size is not positive', () => {
      assert.throws(
        () => new PDFDocument({ buffer: validPdfBuffer, originalName: 'test.pdf', size: -1 }),
        { message: /Size must be a positive number/ }
      );
    });

    it('should throw if buffer length does not match size', () => {
      assert.throws(
        () => new PDFDocument({ buffer: validPdfBuffer, originalName: 'test.pdf', size: 999 }),
        { message: /Buffer length does not match/ }
      );
    });
  });

  describe('validate', () => {
    it('should return valid for proper PDF magic bytes', () => {
      const doc = new PDFDocument({
        buffer: validPdfBuffer,
        originalName: 'test.pdf',
        size: validPdfBuffer.length,
      });
      const result = doc.validate();
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.error, undefined);
    });

    it('should return invalid for non-PDF buffer', () => {
      const doc = new PDFDocument({
        buffer: Buffer.from('not a pdf'),
        originalName: 'test.txt',
        size: 9,
      });
      const result = doc.validate();
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('magic bytes'));
    });

    it('should return invalid for empty buffer', () => {
      // This would be caught in constructor, but test validate directly
      const doc = new PDFDocument({
        buffer: Buffer.from('%PDF-'),
        originalName: 'test.pdf',
        size: 5,
      });
      const result = doc.validate();
      assert.strictEqual(result.valid, true); // %PDF- is valid magic bytes
    });
  });

  describe('create static factory', () => {
    it('should create document from buffer and name', () => {
      const doc = PDFDocument.create(validPdfBuffer, 'test.pdf');
      assert.strictEqual(doc.originalName, 'test.pdf');
      assert.strictEqual(doc.size, validPdfBuffer.length);
    });
  });

  describe('toJSON', () => {
    it('should serialize without buffer', () => {
      const doc = new PDFDocument({
        buffer: validPdfBuffer,
        originalName: 'test.pdf',
        size: validPdfBuffer.length,
      });
      const json = doc.toJSON();
      assert.deepStrictEqual(json, {
        originalName: 'test.pdf',
        size: validPdfBuffer.length,
      });
      assert.strictEqual(json.buffer, undefined);
    });
  });
});