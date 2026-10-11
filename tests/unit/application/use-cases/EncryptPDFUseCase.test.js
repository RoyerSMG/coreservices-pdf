/**
 * Unit tests for EncryptPDFUseCase
 * Uses mocks for ports to test business logic in isolation.
 */

import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { EncryptPDFUseCase } from '../../../../src/services/pdf/application/use-cases/EncryptPDFUseCase.js';
import { EncryptPDFDTO } from '../../../../src/services/pdf/application/dto/EncryptPDFDTO.js';
import { Errors } from '../../../../src/shared/errors/AppError.js';
import { ErrorCodes } from '../../../../src/shared/errors/errorCodes.js';

describe('EncryptPDFUseCase', () => {
  let useCase;
  let mockValidator;
  let mockEncryptor;
  let validDto;

  beforeEach(() => {
    // Create mock ports
    mockValidator = {
      validate: mock.fn(),
    };
    mockEncryptor = {
      encrypt: mock.fn(),
    };

    useCase = new EncryptPDFUseCase(mockValidator, mockEncryptor);

    // Valid PDF buffer with magic bytes
    const pdfBuffer = Buffer.from('%PDF-1.4\n%test content');
    validDto = new EncryptPDFDTO({
      fileBuffer: pdfBuffer,
      password: 'secret123',
      originalName: 'test.pdf',
      size: pdfBuffer.length,
    });
  });

  describe('execute', () => {
    it('should encrypt PDF successfully (happy path)', async () => {
      mockValidator.validate.mock.mockImplementation(async () => ({ valid: true }));
      mockEncryptor.encrypt.mock.mockImplementation(async (buffer) => new Uint8Array(buffer));

      const result = await useCase.execute(validDto);

      assert.ok(result instanceof Uint8Array);
      assert.strictEqual(mockValidator.validate.mock.callCount(), 1);
      assert.strictEqual(mockEncryptor.encrypt.mock.callCount(), 1);
    });

    it('should throw ERR_PASSWORD_TOO_SHORT when password < 4 chars', async () => {
      const shortPasswordDto = new EncryptPDFDTO({
        fileBuffer: validDto.fileBuffer,
        password: '123', // Too short
        originalName: 'test.pdf',
        size: validDto.size,
      });

      await assert.rejects(
        useCase.execute(shortPasswordDto),
        (error) => {
          assert.strictEqual(error.code, ErrorCodes.ERR_PASSWORD_TOO_SHORT);
          assert.strictEqual(error.details.minLength, 4);
          return true;
        }
      );

      // Should not call validator or encryptor
      assert.strictEqual(mockValidator.validate.mock.callCount(), 0);
      assert.strictEqual(mockEncryptor.encrypt.mock.callCount(), 0);
    });

    it('should throw ERR_INVALID_PDF when domain entity validation fails', async () => {
      const invalidPdfBuffer = Buffer.from('not a pdf');
      const invalidDto = new EncryptPDFDTO({
        fileBuffer: invalidPdfBuffer,
        password: 'secret123',
        originalName: 'test.txt',
        size: invalidPdfBuffer.length,
      });

      await assert.rejects(
        useCase.execute(invalidDto),
        (error) => {
          assert.strictEqual(error.code, ErrorCodes.ERR_INVALID_PDF);
          return true;
        }
      );

      // Should not call ports
      assert.strictEqual(mockValidator.validate.mock.callCount(), 0);
      assert.strictEqual(mockEncryptor.encrypt.mock.callCount(), 0);
    });

    it('should throw ERR_INVALID_PDF when port validator returns invalid', async () => {
      mockValidator.validate.mock.mockImplementation(async () => ({
        valid: false,
        error: 'Corrupted PDF structure',
      }));

      await assert.rejects(
        useCase.execute(validDto),
        (error) => {
          assert.strictEqual(error.code, ErrorCodes.ERR_INVALID_PDF);
          assert.ok(error.details.reason.includes('Corrupted'));
          return true;
        }
      );

      assert.strictEqual(mockValidator.validate.mock.callCount(), 1);
      assert.strictEqual(mockEncryptor.encrypt.mock.callCount(), 0);
    });

    it('should throw ERR_ENCRYPTION_FAILED when encryptor throws', async () => {
      mockValidator.validate.mock.mockImplementation(async () => ({ valid: true }));
      mockEncryptor.encrypt.mock.mockImplementation(async () => {
        throw new Error('pdf-lib encryption error');
      });

      await assert.rejects(
        useCase.execute(validDto),
        (error) => {
          assert.strictEqual(error.code, ErrorCodes.ERR_ENCRYPTION_FAILED);
          assert.ok(error.details.reason.includes('pdf-lib encryption error'));
          return true;
        }
      );

      assert.strictEqual(mockValidator.validate.mock.callCount(), 1);
      assert.strictEqual(mockEncryptor.encrypt.mock.callCount(), 1);
    });

    it('should pass correct encryption options to encryptor', async () => {
      let capturedOptions;
      mockValidator.validate.mock.mockImplementation(async () => ({ valid: true }));
      mockEncryptor.encrypt.mock.mockImplementation(async (buffer, options) => {
        capturedOptions = options;
        return new Uint8Array(buffer);
      });

      await useCase.execute(validDto);

      assert.ok(capturedOptions);
      assert.strictEqual(capturedOptions.ownerPassword, 'secret123');
      assert.strictEqual(capturedOptions.userPassword, '');
      assert.strictEqual(capturedOptions.permissions.modify, false);
      assert.strictEqual(capturedOptions.permissions.copy, false);
      assert.strictEqual(capturedOptions.permissions.print, true);
      assert.strictEqual(capturedOptions.permissions.printHighQuality, true);
    });
  });
});