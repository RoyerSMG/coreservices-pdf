/**
 * Unit tests for apiKeyAuth.js middleware
 */

import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// Set up env before importing modules that depend on config
const originalEnv = { ...process.env };

function setupEnv() {
  process.env.API_KEY = 'test-secret-key-123';
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3000';
  process.env.MAX_FILE_SIZE = '104857600';
}

function restoreEnv() {
  process.env = { ...originalEnv };
}

// Import after env setup
let apiKeyAuth;
let Errors;
let ErrorCodes;

describe('apiKeyAuth middleware', () => {
  beforeEach(async () => {
    setupEnv();
    // Dynamic import after env is set
    const authModule = await import('../../../../src/shared/middleware/apiKeyAuth.js');
    const appErrorModule = await import('../../../../src/shared/errors/AppError.js');
    const errorCodesModule = await import('../../../../src/shared/errors/errorCodes.js');
    apiKeyAuth = authModule.apiKeyAuth;
    Errors = appErrorModule.Errors;
    ErrorCodes = errorCodesModule.ErrorCodes;
  });

  afterEach(() => {
    restoreEnv();
  });

  function createMockReq(headers = {}) {
    return {
      headers: { ...headers },
      auth: undefined,
    };
  }

  function createMockRes() {
    return {
      statusCode: 200,
      headers: {},
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      setHeader(name, value) {
        this.headers[name] = value;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      },
    };
  }

  function createMockNext() {
    return mock.fn();
  }

  it('should call next() when valid API key provided', () => {
    const req = createMockReq({ 'x-api-key': 'test-secret-key-123' });
    const res = createMockRes();
    const next = createMockNext();

    apiKeyAuth(req, res, next);

    assert.strictEqual(next.mock.callCount(), 1);
    assert.strictEqual(req.auth.apiKey, true);
  });

  it('should reject when X-API-Key header is missing', () => {
    const req = createMockReq({});
    const res = createMockRes();
    const next = createMockNext();

    apiKeyAuth(req, res, next);

    assert.strictEqual(next.mock.callCount(), 1);
    const error = next.mock.calls[0].arguments[0];
    assert.ok(error instanceof Error);
    assert.strictEqual(error.code, ErrorCodes.ERR_UNAUTHORIZED);
    // Check details contain the reason
    assert.ok(error.details.reason.includes('Missing'));
  });

  it('should reject when X-API-Key is invalid', () => {
    const req = createMockReq({ 'x-api-key': 'wrong-key' });
    const res = createMockRes();
    const next = createMockNext();

    apiKeyAuth(req, res, next);

    assert.strictEqual(next.mock.callCount(), 1);
    const error = next.mock.calls[0].arguments[0];
    assert.strictEqual(error.code, ErrorCodes.ERR_INVALID_API_KEY);
  });

  it('should reject when X-API-Key is empty string', () => {
    const req = createMockReq({ 'x-api-key': '' });
    const res = createMockRes();
    const next = createMockNext();

    apiKeyAuth(req, res, next);

    assert.strictEqual(next.mock.callCount(), 1);
    const error = next.mock.calls[0].arguments[0];
    // Empty string is treated as missing header
    assert.strictEqual(error.code, ErrorCodes.ERR_UNAUTHORIZED);
  });

  it('should be case-insensitive for header name (Express normalizes)', () => {
    const req = createMockReq({ 'x-api-key': 'test-secret-key-123' });
    const res = createMockRes();
    const next = createMockNext();

    apiKeyAuth(req, res, next);

    assert.strictEqual(next.mock.callCount(), 1);
    assert.strictEqual(req.auth.apiKey, true);
  });
});