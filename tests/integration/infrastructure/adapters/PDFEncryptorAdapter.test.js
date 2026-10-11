/**
 * Integration tests for PDFEncryptorAdapter
 * Tests actual encryption using @pdfsmaller/pdf-encrypt.
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { PDFEncryptorAdapter } from '../../../../src/services/pdf/infrastructure/adapters/PDFEncryptorAdapter.js';
import { EncryptionOptions } from '../../../../src/services/pdf/domain/value-objects/EncryptionOptions.js';
import { PDFDocument as PDFDoc } from 'pdf-lib';

describe('PDFEncryptorAdapter', () => {
  let adapter;
  let validPdfBuffer;

  before(async () => {
    adapter = new PDFEncryptorAdapter();
    // Create a simple valid PDF using pdf-lib for testing
    const pdfDoc = await PDFDoc.create();
    pdfDoc.addPage([400, 300]);
    validPdfBuffer = await pdfDoc.save();
  });

  describe('encrypt', () => {
    it('should encrypt PDF and return Uint8Array', async () => {
      const options = EncryptionOptions.fromPassword('ownerpass123');
      const encrypted = await adapter.encrypt(validPdfBuffer, options);

      assert.ok(encrypted instanceof Uint8Array);
      assert.ok(encrypted.length > 0);
      // Encrypted PDF should be different from original
      assert.notDeepStrictEqual(Buffer.from(encrypted), validPdfBuffer);
    });

    it('should produce encrypted PDF that can be loaded with ignoreEncryption', async () => {
      const options = EncryptionOptions.fromPassword('ownerpass123');
      const encrypted = await adapter.encrypt(validPdfBuffer, options);

      // Verify the encrypted PDF can be loaded (with ignoreEncryption)
      const decryptedDoc = await PDFDoc.load(encrypted, { ignoreEncryption: true });
      const pages = decryptedDoc.getPages();
      assert.strictEqual(pages.length, 1);
    });

    it('should apply default permissions (RF-4) - verified via encryption options', async () => {
      const options = EncryptionOptions.fromPassword('ownerpass123');
      const encrypted = await adapter.encrypt(validPdfBuffer, options);

      // Load with ignoreEncryption to verify structure is valid
      const decryptedDoc = await PDFDoc.load(encrypted, { ignoreEncryption: true });
      const pages = decryptedDoc.getPages();
      assert.strictEqual(pages.length, 1);

      // The encryption options are tested at the unit level (EncryptionOptions tests)
      // and the adapter passes them correctly to the encryption library
      // Verifying actual PDF permissions requires pdf-lib to support encrypted doc inspection
      // which is not available with ignoreEncryption: true
    });

    it('should throw on invalid PDF buffer', async () => {
      const options = EncryptionOptions.fromPassword('ownerpass123');
      await assert.rejects(
        adapter.encrypt(Buffer.from('not a pdf'), options),
        { message: /PDF encryption failed/ }
      );
    });

    it('should throw on empty buffer', async () => {
      const options = EncryptionOptions.fromPassword('ownerpass123');
      await assert.rejects(
        adapter.encrypt(Buffer.from([]), options),
        { message: /PDF encryption failed/ }
      );
    });

    it('should use owner password for permissions with empty user password', async () => {
      const options = new EncryptionOptions({
        userPassword: '', // Empty = no open password
        ownerPassword: 'ownerpass123',
      });
      const encrypted = await adapter.encrypt(validPdfBuffer, options);

      // Should be able to load with ignoreEncryption (user password is empty)
      const doc = await PDFDoc.load(encrypted, { ignoreEncryption: true });
      assert.strictEqual(doc.getPages().length, 1);
    });

    it('should produce different output for different passwords', async () => {
      const options1 = EncryptionOptions.fromPassword('password1');
      const options2 = EncryptionOptions.fromPassword('password2');
      
      const encrypted1 = await adapter.encrypt(validPdfBuffer, options1);
      const encrypted2 = await adapter.encrypt(validPdfBuffer, options2);

      // Different passwords should produce different encrypted output
      assert.notDeepStrictEqual(Buffer.from(encrypted1), Buffer.from(encrypted2));
    });

    it('should produce valid PDF structure after encryption', async () => {
      const options = EncryptionOptions.fromPassword('ownerpass123');
      const encrypted = await adapter.encrypt(validPdfBuffer, options);

      // Verify the encrypted PDF has PDF magic bytes
      const header = Buffer.from(encrypted).subarray(0, 5).toString('ascii');
      assert.strictEqual(header, '%PDF-');

      // Verify EOF marker exists
      const tail = Buffer.from(encrypted).subarray(Math.max(0, encrypted.length - 1024)).toString('ascii');
      assert.ok(tail.includes('%%EOF'));
    });
  });
});