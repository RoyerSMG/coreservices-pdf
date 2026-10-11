/**
 * Unit tests for errorHandler.js middleware
 */

import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { errorHandler, notFoundHandler } from '../../../../src/shared/errors/errorHandler.js';
import { AppError, Errors } from '../../../../src/shared/errors/AppError.js';
import { ErrorCodes } from '../../../../src/shared/errors/errorCodes.js';

describe('errorHandler middleware', () => {
  function createMockReq(overrides = {}) {
    return {
      method: 'POST',
      originalUrl: '/api/v1/pdf/encrypt',
      url: '/api/v1/pdf/encrypt',
      headers: {
        'x-request-id': 'test-req-123',
      },
      ...overrides,
      headers: {
        'x-request-id': 'test-req-123',
        ...(overrides.headers || {}),
      },
    };
  }

  function createMockRes() {
    const res = {
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
    return res;
  }

  function createMockNext() {
    return mock.fn();
  }

  it('should handle AppError and return formatted JSON', async () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = createMockNext();

    const error = Errors.badRequest('Test error', { field: 'test' });
    errorHandler(error, req, res, next);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.headers['X-Request-ID'], 'test-req-123');
    assert.deepStrictEqual(res.body, {
      error: {
        code: ErrorCodes.ERR_BAD_REQUEST,
        message: 'Test error',
        details: { field: 'test' },
      },
    });
    assert.strictEqual(next.mock.callCount(), 0);
  });

  it('should handle generic Error and wrap as internal', async () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = createMockNext();

    const genericError = new Error('Something broke');
    errorHandler(genericError, req, res, next);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.error.code, ErrorCodes.ERR_INTERNAL);
    assert.strictEqual(res.body.error.message, 'Something broke');
  });

  it('should handle non-Error values', async () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = createMockNext();

    errorHandler('string error', req, res, next);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.error.code, ErrorCodes.ERR_INTERNAL);
    assert.strictEqual(res.body.error.message, 'string error');
  });

  it('should generate request ID if not present', async () => {
    // Don't pass headers at all to test generation
    const req = {
      method: 'POST',
      originalUrl: '/api/v1/pdf/encrypt',
      url: '/api/v1/pdf/encrypt',
      headers: {},
    };
    const res = createMockRes();
    const next = createMockNext();

    errorHandler(new Error('test'), req, res, next);

    assert.ok(res.headers['X-Request-ID']);
    assert.ok(res.headers['X-Request-ID'].startsWith('req_'));
  });

  it('should hide details in production for 5xx errors', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      const error = Errors.internal(new Error('Internal secret'));
      errorHandler(error, req, res, next);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.error.message, 'Error interno del servidor');
      assert.strictEqual(res.body.error.details, undefined);
      assert.strictEqual(res.body.error.cause, undefined);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('should show details in development for 5xx errors', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    try {
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      const error = Errors.internal(new Error('Internal secret'));
      errorHandler(error, req, res, next);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.error.message, 'Internal secret');
      assert.ok(res.body.error.cause);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('should show details for 4xx errors even in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      const error = Errors.badRequest('Bad request', { field: 'test' });
      errorHandler(error, req, res, next);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.error.message, 'Bad request');
      assert.deepStrictEqual(res.body.error.details, { field: 'test' });
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});

describe('notFoundHandler', () => {
  function createMockReq(overrides = {}) {
    return {
      method: 'GET',
      originalUrl: '/unknown',
      url: '/unknown',
      headers: {
        ...(overrides.headers || {}),
      },
      ...overrides,
    };
  }

  function createMockRes() {
    const res = {
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
    return res;
  }

  it('should return 404 with error format', () => {
    const req = createMockReq({ method: 'POST', originalUrl: '/api/v1/unknown' });
    const res = createMockRes();

    notFoundHandler(req, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.error.code, ErrorCodes.ERR_BAD_REQUEST);
    assert.ok(res.body.error.message.includes('POST'));
    assert.ok(res.body.error.message.includes('/api/v1/unknown'));
  });

  it('should include request ID in response', () => {
    const req = createMockReq({ headers: { 'x-request-id': 'custom-id' } });
    const res = createMockRes();

    notFoundHandler(req, res);

    // res.setHeader uses exact case 'X-Request-ID'
    assert.strictEqual(res.headers['X-Request-ID'], 'custom-id');
  });
});