/**
 * Integration tests for PDF HTTP endpoints.
 * Tests the full HTTP request/response cycle.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';

// Set up environment before importing app
const originalEnv = { ...process.env };

function setupEnv() {
  process.env.API_KEY = 'test-secret-key-123';
  process.env.NODE_ENV = 'test';
  // Don't set PORT - let config use default (3000) or let OS assign via port 0 in listen()
  process.env.MAX_FILE_SIZE = '104857600';
}

function restoreEnv() {
  process.env = { ...originalEnv };
}

let createApp;
let validPdfBuffer;
const API_KEY = 'test-secret-key-123';

describe('PDF HTTP Integration', () => {
  let app;
  let server;
  let baseUrl;

  before(async () => {
    setupEnv();
    // Import after env is set
    const appModule = await import('../../../src/app.js');
    createApp = appModule.createApp;

    // Create a valid PDF for testing
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([400, 300]);
    validPdfBuffer = await pdfDoc.save();

    // Create app and start server
    app = await createApp();
    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    restoreEnv();
  });

  function makeRequest(endpoint, options = {}) {
    const url = `${baseUrl}${endpoint}`;
    const headers = {
      'X-API-Key': API_KEY,
      ...options.headers,
    };

    return fetch(url, {
      method: options.method || 'POST',
      headers,
      body: options.body,
    });
  }

  function createFormData(fileBuffer, password, fileName = 'test.pdf') {
    const formData = new FormData();
    const file = new File([fileBuffer], fileName, { type: 'application/pdf' });
    formData.append('file', file);
    formData.append('password', password);
    return formData;
  }

  describe('POST /api/v1/pdf/encrypt', () => {
    it('should return 200 with encrypted PDF for valid request (RF-1)', async () => {
      const formData = createFormData(validPdfBuffer, 'secret123');
      
      const response = await makeRequest('/api/v1/pdf/encrypt', {
        body: formData,
      });

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers.get('content-type').startsWith('application/pdf'));
      assert.ok(response.headers.get('content-length'));
      
      const encryptedBuffer = await response.arrayBuffer();
      assert.ok(encryptedBuffer.byteLength > 0);
      assert.notDeepStrictEqual(Buffer.from(encryptedBuffer), validPdfBuffer);
    });

    it('should return 401 without API key (RF-2)', async () => {
      const formData = createFormData(validPdfBuffer, 'secret123');
      
      const response = await fetch(`${baseUrl}/api/v1/pdf/encrypt`, {
        method: 'POST',
        body: formData,
        // No X-API-Key header
      });

      assert.strictEqual(response.status, 401);
      const body = await response.json();
      assert.strictEqual(body.error.code, 'ERR_UNAUTHORIZED');
    });

    it('should return 401 with invalid API key (RF-2)', async () => {
      const formData = createFormData(validPdfBuffer, 'secret123');
      
      const response = await makeRequest('/api/v1/pdf/encrypt', {
        headers: { 'X-API-Key': 'invalid-key' },
        body: formData,
      });

      assert.strictEqual(response.status, 401);
      const body = await response.json();
      assert.strictEqual(body.error.code, 'ERR_INVALID_API_KEY');
    });

    it('should return 400 for password < 4 chars (RF-3)', async () => {
      const formData = createFormData(validPdfBuffer, '123');
      
      const response = await makeRequest('/api/v1/pdf/encrypt', {
        body: formData,
      });

      assert.strictEqual(response.status, 400);
      const body = await response.json();
      assert.strictEqual(body.error.code, 'ERR_PASSWORD_TOO_SHORT');
    });

    it('should return 400 for non-PDF file (RF-3)', async () => {
      const textBuffer = Buffer.from('not a pdf');
      const formData = createFormData(textBuffer, 'secret123', 'test.txt');
      
      const response = await makeRequest('/api/v1/pdf/encrypt', {
        body: formData,
      });

      assert.strictEqual(response.status, 400);
      const body = await response.json();
      assert.strictEqual(body.error.code, 'ERR_INVALID_PDF');
    });

    it('should return 400 for missing password field', async () => {
      const formData = new FormData();
      const file = new File([validPdfBuffer], 'test.pdf', { type: 'application/pdf' });
      formData.append('file', file);
      // No password field
      
      const response = await makeRequest('/api/v1/pdf/encrypt', {
        body: formData,
      });

      assert.strictEqual(response.status, 400);
      const body = await response.json();
      assert.strictEqual(body.error.code, 'ERR_BAD_REQUEST');
    });

    it('should return 400 for missing file', async () => {
      const formData = new FormData();
      formData.append('password', 'secret123');
      // No file field
      
      const response = await makeRequest('/api/v1/pdf/encrypt', {
        body: formData,
      });

      assert.strictEqual(response.status, 400);
      const body = await response.json();
      assert.strictEqual(body.error.code, 'ERR_BAD_REQUEST');
    });

    it('should set correct response headers for encrypted PDF', async () => {
      const formData = createFormData(validPdfBuffer, 'secret123');
      
      const response = await makeRequest('/api/v1/pdf/encrypt', {
        body: formData,
      });

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers.get('content-type').startsWith('application/pdf'));
      assert.ok(response.headers.get('content-disposition').includes('attachment'));
      assert.ok(response.headers.get('content-disposition').includes('encrypted_'));
      assert.strictEqual(response.headers.get('cache-control'), 'no-store, private');
    });

    it('should return different encrypted output for different passwords', async () => {
      const formData1 = createFormData(validPdfBuffer, 'password1');
      const formData2 = createFormData(validPdfBuffer, 'password2');
      
      const response1 = await makeRequest('/api/v1/pdf/encrypt', { body: formData1 });
      const response2 = await makeRequest('/api/v1/pdf/encrypt', { body: formData2 });

      assert.strictEqual(response1.status, 200);
      assert.strictEqual(response2.status, 200);

      const buf1 = Buffer.from(await response1.arrayBuffer());
      const buf2 = Buffer.from(await response2.arrayBuffer());
      
      assert.notDeepStrictEqual(buf1, buf2);
    });
  });

  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const response = await fetch(`${baseUrl}/health`);
      assert.strictEqual(response.status, 200);
      
      const body = await response.json();
      assert.strictEqual(body.status, 'ok');
      assert.ok(body.timestamp);
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await fetch(`${baseUrl}/unknown`);
      assert.strictEqual(response.status, 404);
      
      const body = await response.json();
      assert.strictEqual(body.error.code, 'ERR_BAD_REQUEST');
    });
  });
});