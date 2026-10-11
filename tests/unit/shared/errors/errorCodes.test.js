/**
 * Unit tests for errorCodes.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ErrorCodes, ErrorStatusCodes, ErrorMessages } from '../../../../src/shared/errors/errorCodes.js';

describe('errorCodes', () => {
  describe('ErrorCodes', () => {
    it('should have all required error codes', () => {
      assert.strictEqual(ErrorCodes.ERR_UNAUTHORIZED, 'ERR_UNAUTHORIZED');
      assert.strictEqual(ErrorCodes.ERR_INVALID_API_KEY, 'ERR_INVALID_API_KEY');
      assert.strictEqual(ErrorCodes.ERR_BAD_REQUEST, 'ERR_BAD_REQUEST');
      assert.strictEqual(ErrorCodes.ERR_FILE_TOO_LARGE, 'ERR_FILE_TOO_LARGE');
      assert.strictEqual(ErrorCodes.ERR_INVALID_PDF, 'ERR_INVALID_PDF');
      assert.strictEqual(ErrorCodes.ERR_ENCRYPTION_FAILED, 'ERR_ENCRYPTION_FAILED');
      assert.strictEqual(ErrorCodes.ERR_PASSWORD_TOO_SHORT, 'ERR_PASSWORD_TOO_SHORT');
      assert.strictEqual(ErrorCodes.ERR_INTERNAL, 'ERR_INTERNAL');
    });
  });

  describe('ErrorStatusCodes', () => {
    it('should map each error code to correct HTTP status', () => {
      assert.strictEqual(ErrorStatusCodes[ErrorCodes.ERR_UNAUTHORIZED], 401);
      assert.strictEqual(ErrorStatusCodes[ErrorCodes.ERR_INVALID_API_KEY], 401);
      assert.strictEqual(ErrorStatusCodes[ErrorCodes.ERR_BAD_REQUEST], 400);
      assert.strictEqual(ErrorStatusCodes[ErrorCodes.ERR_FILE_TOO_LARGE], 413);
      assert.strictEqual(ErrorStatusCodes[ErrorCodes.ERR_INVALID_PDF], 400);
      assert.strictEqual(ErrorStatusCodes[ErrorCodes.ERR_ENCRYPTION_FAILED], 500);
      assert.strictEqual(ErrorStatusCodes[ErrorCodes.ERR_PASSWORD_TOO_SHORT], 400);
      assert.strictEqual(ErrorStatusCodes[ErrorCodes.ERR_INTERNAL], 500);
    });

    it('should have a status code for every error code', () => {
      for (const code of Object.values(ErrorCodes)) {
        assert.ok(ErrorStatusCodes[code], `Missing status code for ${code}`);
        assert.ok(ErrorStatusCodes[code] >= 400 && ErrorStatusCodes[code] < 600);
      }
    });
  });

  describe('ErrorMessages', () => {
    it('should have Spanish message for every error code', () => {
      for (const code of Object.values(ErrorCodes)) {
        assert.ok(ErrorMessages[code], `Missing message for ${code}`);
        assert.ok(typeof ErrorMessages[code] === 'string' && ErrorMessages[code].length > 0);
      }
    });

    it('messages should be in Spanish', () => {
      assert.ok(ErrorMessages[ErrorCodes.ERR_UNAUTHORIZED].includes('autorizado'));
      assert.ok(ErrorMessages[ErrorCodes.ERR_FILE_TOO_LARGE].includes('supera'));
      assert.ok(ErrorMessages[ErrorCodes.ERR_PASSWORD_TOO_SHORT].includes('caracteres'));
    });
  });
});