/**
 * Integration tests for PDFValidatorAdapter
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { PDFValidatorAdapter } from '../../../../src/services/pdf/infrastructure/adapters/PDFValidatorAdapter.js';

describe('PDFValidatorAdapter', () => {
  let adapter;

  before(() => {
    adapter = new PDFValidatorAdapter();
  });

  describe('validate', () => {
    it('should return valid for proper PDF magic bytes', async () => {
      // Minimal valid PDF structure
      const pdfBuffer = Buffer.from(
        '%PDF-1.4\n%test\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF'
      );
      const result = await adapter.validate(pdfBuffer);
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.error, undefined);
    });

    it('should return invalid for non-PDF buffer', async () => {
      const result = await adapter.validate(Buffer.from('not a pdf'));
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('magic bytes'));
    });

    it('should return invalid for empty buffer', async () => {
      const result = await adapter.validate(Buffer.from([]));
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('Empty'));
    });

    it('should return invalid for buffer without EOF marker', async () => {
      const pdfBuffer = Buffer.from('%PDF-1.4\n%test\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>');
      const result = await adapter.validate(pdfBuffer);
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('EOF'));
    });

    it('should accept Uint8Array input', async () => {
      const pdfBuffer = new Uint8Array(Buffer.from('%PDF-1.4\n%test\n%%EOF'));
      const result = await adapter.validate(pdfBuffer);
      assert.strictEqual(result.valid, true);
    });
  });
});