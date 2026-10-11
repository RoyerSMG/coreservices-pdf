/**
 * Unit tests for AppError.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AppError, Errors } from '../../../../src/shared/errors/AppError.js';
import { ErrorCodes, ErrorStatusCodes } from '../../../../src/shared/errors/errorCodes.js';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create error with code and default message', () => {
      const error = new AppError({ code: ErrorCodes.ERR_UNAUTHORIZED });
      assert.strictEqual(error.code, ErrorCodes.ERR_UNAUTHORIZED);
      assert.strictEqual(error.statusCode, 401);
      assert.ok(error.message.includes('autorizado'));
    });

    it('should create error with custom message', () => {
      const error = new AppError({ code: ErrorCodes.ERR_BAD_REQUEST, message: 'Custom message' });
      assert.strictEqual(error.message, 'Custom message');
    });

    it('should create error with details', () => {
      const error = new AppError({ code: ErrorCodes.ERR_VALIDATION_FAILED, details: { field: 'email' } });
      assert.deepStrictEqual(error.details, { field: 'email' });
    });

    it('should create error with cause', () => {
      const cause = new Error('Original error');
      const error = new AppError({ code: ErrorCodes.ERR_INTERNAL, cause });
      assert.strictEqual(error.cause, cause);
    });

    it('should default to ERR_INTERNAL when no code provided', () => {
      const error = new AppError({});
      assert.strictEqual(error.code, ErrorCodes.ERR_INTERNAL);
      assert.strictEqual(error.statusCode, 500);
    });
  });

  describe('toJSON', () => {
    it('should serialize error correctly', () => {
      const error = new AppError({
        code: ErrorCodes.ERR_BAD_REQUEST,
        message: 'Test error',
        details: { field: 'test' },
      });
      const json = error.toJSON();
      assert.deepStrictEqual(json, {
        error: {
          code: ErrorCodes.ERR_BAD_REQUEST,
          message: 'Test error',
          details: { field: 'test' },
        },
      });
    });

    it('should include cause in non-production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      try {
        const cause = new Error('Original');
        const error = new AppError({ code: ErrorCodes.ERR_INTERNAL, cause });
        const json = error.toJSON();
        assert.ok(json.error.cause);
        assert.strictEqual(json.error.cause, 'Original');
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should exclude cause in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      try {
        const cause = new Error('Original');
        const error = new AppError({ code: ErrorCodes.ERR_INTERNAL, cause });
        const json = error.toJSON();
        assert.strictEqual(json.error.cause, undefined);
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });

  describe('fromUnknown', () => {
    it('should return same AppError if already AppError', () => {
      const original = new AppError({ code: ErrorCodes.ERR_BAD_REQUEST });
      const result = AppError.fromUnknown(original);
      assert.strictEqual(result, original);
    });

    it('should wrap generic Error', () => {
      const generic = new Error('Generic error');
      const result = AppError.fromUnknown(generic, ErrorCodes.ERR_BAD_REQUEST);
      assert.ok(result instanceof AppError);
      assert.strictEqual(result.code, ErrorCodes.ERR_BAD_REQUEST);
      assert.strictEqual(result.message, 'Generic error');
      assert.strictEqual(result.cause, generic);
    });

    it('should wrap non-Error values', () => {
      const result = AppError.fromUnknown('string error', ErrorCodes.ERR_BAD_REQUEST);
      assert.ok(result instanceof AppError);
      assert.strictEqual(result.message, 'string error');
    });
  });
});

describe('Errors factory', () => {
  it('should create unauthorized error', () => {
    const error = Errors.unauthorized({ reason: 'test' });
    assert.strictEqual(error.code, ErrorCodes.ERR_UNAUTHORIZED);
    assert.strictEqual(error.details.reason, 'test');
  });

  it('should create invalidApiKey error', () => {
    const error = Errors.invalidApiKey();
    assert.strictEqual(error.code, ErrorCodes.ERR_INVALID_API_KEY);
  });

  it('should create badRequest error', () => {
    const error = Errors.badRequest('Custom msg', { field: 'test' });
    assert.strictEqual(error.code, ErrorCodes.ERR_BAD_REQUEST);
    assert.strictEqual(error.message, 'Custom msg');
    assert.deepStrictEqual(error.details, { field: 'test' });
  });

  it('should create fileTooLarge error with computed MB', () => {
    const error = Errors.fileTooLarge(104857600); // 100MB
    assert.strictEqual(error.code, ErrorCodes.ERR_FILE_TOO_LARGE);
    assert.strictEqual(error.details.maxSizeBytes, 104857600);
    assert.strictEqual(error.details.maxSizeMB, 100);
  });

  it('should create passwordTooShort error', () => {
    const error = Errors.passwordTooShort(4);
    assert.strictEqual(error.code, ErrorCodes.ERR_PASSWORD_TOO_SHORT);
    assert.strictEqual(error.details.minLength, 4);
  });

  it('should create internal error from unknown', () => {
    const error = Errors.internal(new Error('boom'));
    assert.strictEqual(error.code, ErrorCodes.ERR_INTERNAL);
    assert.strictEqual(error.cause.message, 'boom');
  });
});