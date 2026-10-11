/**
 * CoreServices Application Entry Point.
 * Configures Express app with middleware, routes, and error handling.
 */

import express from 'express';
import config from './config/index.js';
import { errorHandler, notFoundHandler } from './shared/errors/errorHandler.js';
import { requestLimits, createBodyParsers } from './shared/middleware/requestLimits.js';
import { createPdfRoutes } from './services/pdf/infrastructure/http/routes/pdfRoutes.js';
import { PDFController } from './services/pdf/infrastructure/http/controllers/PDFController.js';
import { EncryptPDFUseCase } from './services/pdf/application/use-cases/EncryptPDFUseCase.js';
import { PDFValidatorAdapter } from './services/pdf/infrastructure/adapters/PDFValidatorAdapter.js';
import { PDFEncryptorAdapter } from './services/pdf/infrastructure/adapters/PDFEncryptorAdapter.js';

/**
 * Creates and configures the Express application.
 * @returns {Promise<import('express').Express>}
 */
export async function createApp() {
  const app = express();

  // Trust proxy for correct IP behind reverse proxy (Render, etc.)
  app.set('trust proxy', true);

  // Create body parsers with size limits (async for ESM compatibility)
  const { jsonLimitMiddleware, rawLimitMiddleware } = await createBodyParsers();

  // Body parsing middleware with size limits
  app.use(jsonLimitMiddleware);
  app.use(rawLimitMiddleware);
  app.use(requestLimits);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Dependency injection: wire up PDF service
  const pdfValidator = new PDFValidatorAdapter();
  const pdfEncryptor = new PDFEncryptorAdapter();
  const encryptUseCase = new EncryptPDFUseCase(pdfValidator, pdfEncryptor);
  const pdfController = new PDFController(encryptUseCase);

  // Mount PDF routes
  app.use('/api/v1/pdf', createPdfRoutes(pdfController));

  // 404 handler for unmatched routes
  app.use(notFoundHandler);

  // Centralized error handler (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Starts the HTTP server.
 * Only runs if this file is executed directly (not imported for testing).
 */
export async function startServer() {
  const app = await createApp();
  const server = app.listen(config.port, () => {
    console.log(`CoreServices running on port ${config.port} (${config.nodeEnv})`);
    console.log(`Health check: http://localhost:${config.port}/health`);
    console.log(`PDF Encrypt: POST http://localhost:${config.port}/api/v1/pdf/encrypt`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down gracefully...`);
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return server;
}

// Auto-start if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}