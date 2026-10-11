/**
 * Middleware for handling multipart file uploads with busboy.
 * Enforces file size limits and extracts file buffer and form fields.
 */

import config from '../../../../../config/index.js';
import { Errors } from '../../../../../shared/errors/AppError.js';
import Busboy from 'busboy';

/**
 * Express middleware to handle multipart/form-data uploads for PDF encryption.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function pdfUploadMiddleware(req, res, next) {
  // Verify content type
  const contentType = req.headers['content-type'] || '';
  if (!contentType.startsWith('multipart/form-data')) {
    return next(Errors.badRequest('Content-Type must be multipart/form-data'));
  }

  const busboy = Busboy({
    headers: req.headers,
    limits: {
      fileSize: config.maxFileSize,
      files: 1,
      fields: 5,
      fieldNameSize: 100,
      fieldSize: 1024 * 1024, // 1MB for field values
    },
  });

  let fileBuffer = null;
  let fileName = 'document.pdf';
  let fileSize = 0;
  const fields = {};
  let fileReceived = false;
  let finished = false;

  busboy.on('file', (fieldname, file, info) => {
    if (fieldname !== 'file') {
      // Ignore unexpected file fields
      file.resume();
      return;
    }

    if (fileReceived) {
      // Only one file allowed
      file.resume();
      return;
    }

    fileReceived = true;
    fileName = info.filename || 'document.pdf';

    const chunks = [];
    file.on('data', (chunk) => {
      chunks.push(chunk);
      fileSize += chunk.length;
      
      // Check file size limit during upload
      if (fileSize > config.maxFileSize) {
        file.destroy();
        busboy.destroy();
        if (!finished) {
          finished = true;
          next(Errors.fileTooLarge(config.maxFileSize));
        }
      }
    });

    file.on('end', () => {
      fileBuffer = Buffer.concat(chunks);
    });

    file.on('error', (err) => {
      if (!finished) {
        finished = true;
        next(Errors.badRequest(`File upload error: ${err.message}`));
      }
    });
  });

  busboy.on('field', (fieldname, val) => {
    if (fieldname === 'password') {
      fields.password = val;
    }
  });

  busboy.on('filesLimit', () => {
    if (!finished) {
      finished = true;
      next(Errors.badRequest('Only one file allowed'));
    }
  });

  busboy.on('fieldsLimit', () => {
    if (!finished) {
      finished = true;
      next(Errors.badRequest('Too many fields'));
    }
  });

  busboy.on('finish', () => {
    if (finished) return;

    if (!fileReceived || !fileBuffer) {
      return next(Errors.badRequest('No file uploaded. Field name must be "file"'));
    }

    if (!fields.password) {
      return next(Errors.badRequest('Password field is required'));
    }

    // Attach parsed data to request
    req.fileBuffer = fileBuffer;
    req.file = {
      originalname: fileName,
      size: fileSize,
    };
    req.body = fields;

    next();
  });

  busboy.on('error', (err) => {
    if (!finished) {
      finished = true;
      // Busboy emits error for size limits too
      if (err.message.includes('File size limit')) {
        next(Errors.fileTooLarge(config.maxFileSize));
      } else {
        next(Errors.badRequest(`Upload error: ${err.message}`));
      }
    }
  });

  // Pipe request to busboy
  req.pipe(busboy);
}