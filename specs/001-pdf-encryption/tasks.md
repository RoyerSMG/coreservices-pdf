# Tasks 001 — Servicio de Encriptación de PDF

> **Regla:** Una tarea a la vez. Tests en rojo → código → tests en verde → marcar ✅ → siguiente.

---

## T1 — Configuración base del proyecto y shared

- [ ] **T1.1** Crear `package.json` con dependencias: `express`, `busboy`, `pdf-lib`, `dotenv` y scripts `test`, `start`, `dev`.
- [ ] **T1.2** Crear `.env.example` con variables requeridas (`PORT`, `API_KEY`, `MAX_FILE_SIZE`, `NODE_ENV`).
- [ ] **T1.3** Crear `src/config/index.js` para carga y validación de variables de entorno.
- [ ] **T1.4** Crear `src/shared/errors/errorCodes.js` con códigos: `ERR_UNAUTHORIZED`, `ERR_BAD_REQUEST`, `ERR_FILE_TOO_LARGE`, `ERR_INVALID_PDF`, `ERR_ENCRYPTION_FAILED`, `ERR_INTERNAL`.
- [ ] **T1.5** Crear `src/shared/errors/AppError.js` clase base extendiendo `Error` con `code`, `statusCode`, `details`.
- [ ] **T1.6** Crear `src/shared/errors/errorHandler.js` middleware Express centralizado (log + respuesta JSON consistente).
- [ ] **T1.7** Crear `src/shared/middleware/apiKeyAuth.js` middleware valida `X-API-Key` contra `process.env.API_KEY` (401 si inválida/falta).
- [ ] **T1.8** Crear `src/shared/middleware/requestLimits.js` middleware Express `express.raw`/`express.json` limits globales.
- [x] **T1.9** **Tests unitarios** `tests/unit/shared/errors/` y `tests/unit/shared/middleware/` para AppError, errorHandler, apiKeyAuth.
- [x] **Hecho cuando:** `npm test` pasa tests shared; `npm run dev` levanta server sin errores.

---

## T2 — Capa Domain (PDF)

- [ ] **T2.1** Crear `src/services/pdf/domain/value-objects/EncryptionOptions.js` value object inmutable con `userPassword`, `ownerPassword`, `permissions` (defaults RF-4).
- [ ] **T2.2** Crear `src/services/pdf/domain/entities/PDFDocument.js` entidad con `buffer`, `originalName`, `size`, `validate()`.
- [ ] **T2.3** Crear `src/services/pdf/domain/ports/PDFValidatorPort.js` interface: `validate(buffer) → { valid: boolean, error?: string }`.
- [ ] **T2.4** Crear `src/services/pdf/domain/ports/PDFEncryptorPort.js` interface: `encrypt(buffer, options) → Promise<Uint8Array>`.
- [x] **T2.5** **Tests unitarios** `tests/unit/domain/` para EncryptionOptions (inmutabilidad, defaults), PDFDocument (validate), y contratos de puertos (mock verification).
- [x] **Hecho cuando:** Tests domain en verde; cero dependencias externas en carpeta `domain/`.

---

## T3 — Capa Application (Caso de Uso)

- [ ] **T3.1** Crear `src/services/pdf/application/dto/EncryptPDFDTO.js` DTO con `fileBuffer`, `password`, `originalName`, `size` + factory `fromRequest(req)`.
- [ ] **T3.2** Crear `src/services/pdf/application/use-cases/EncryptPDFUseCase.js`:
  - Recibe `PDFValidatorPort`, `PDFEncryptorPort` por constructor (DI).
  - `execute(dto)`: valida → construye `EncryptionOptions` → encripta → retorna `encryptedBuffer`.
  - Lanza `AppError` con códigos apropiados en fallos validación/encriptación.
- [x] **T3.3** **Tests unitarios** `tests/unit/application/use-cases/EncryptPDFUseCase.test.js` con mocks de puertos:
  - Happy path: valida OK → encripta OK → retorna buffer.
  - Password < 4 chars → `ERR_BAD_REQUEST`.
  - PDFValidatorPort devuelve inválido → `ERR_INVALID_PDF`.
  - PDFEncryptorPort lanza error → `ERR_ENCRYPTION_FAILED`.
- [x] **Hecho cuando:** Tests use-case en verde; `EncryptPDFUseCase` no importa Express, busboy, ni pdf-lib.

---

## T4 — Capa Infrastructure: Adapters (pdf-lib)

- [ ] **T4.1** Crear `src/services/pdf/infrastructure/adapters/PDFValidatorAdapter.js` implementa `PDFValidatorPort`:
  - `validate(buffer)`: verifica magic bytes `%PDF-` + tamaño > 0.
- [ ] **T4.2** Crear `src/services/pdf/infrastructure/adapters/PDFEncryptorAdapter.js` implementa `PDFEncryptorPort`:
  - Usa `pdf-lib`: `PDFDocument.load(buffer)` → `encrypt(options)` → `save()` → `Uint8Array`.
  - Permisos según RF-4 (modify:false, copy:false, print:true, printHighQuality:true, etc.).
  - Owner password = `options.ownerPassword`; user password = `options.userPassword` (vacío).
- [x] **T4.3** **Tests integración** `tests/integration/infrastructure/adapters/`:
  - PDFValidatorAdapter: PDF válido, PDF corrupto, buffer vacío, non-PDF.
  - PDFEncryptorAdapter: encripta PDF real → output descifrable con password correcto; permisos aplicados.
- [x] **Hecho cuando:** Tests adapters en verde; adapters solo dependen de `domain/ports` y `pdf-lib`.

---

## T5 — Capa Infrastructure: HTTP (Express)

- [ ] **T5.1** Crear `src/services/pdf/infrastructure/http/middlewares/pdfUploadMiddleware.js`:
  - Configura `busboy` con límites: `fileSize: MAX_FILE_SIZE`, `files: 1`, `fields: { password: { maxLength: 128 } }`.
  - Expone `req.fileBuffer` (Buffer), `req.body.password`, `req.file.originalname`.
  - Errores busboy → `AppError` con `ERR_FILE_TOO_LARGE` o `ERR_BAD_REQUEST`.
- [ ] **T5.2** Crear `src/services/pdf/infrastructure/http/controllers/PDFController.js`:
  - `encrypt(req, res, next)`: construye DTO → llama `EncryptPDFUseCase.execute()` → `res.set('Content-Type', 'application/pdf')` → `res.send(encryptedBuffer)`.
  - Manejo errores via `next(err)` → `errorHandler`.
- [ ] **T5.3** Crear `src/services/pdf/infrastructure/http/routes/pdfRoutes.js`:
  - `POST /api/v1/pdf/encrypt` → middlewares: `apiKeyAuth`, `pdfUploadMiddleware` → `PDFController.encrypt`.
- [x] **T5.4** **Tests integración HTTP** `tests/integration/http/` (usando `fetch` nativo o supertest contra app real):
  - RF-1: 200 + PDF binario cifrado con API key válida, password válido, PDF válido.
  - RF-2: 401 sin API key / API key inválida.
  - RF-3: 400 password < 4 chars; 400 archivo > 100MB; 400 archivo no PDF.
  - RF-4: PDF resultante tiene permisos correctos (verificar con pdf-lib en test).
- [x] **Hecho cuando:** Tests HTTP en verde; todos RF cubiertos.

---

## T6 — Wiring Principal y Docker

- [x] **T6.1** Crear/actualizar `src/app.js`:
  - Carga config, middlewares globales (`express.json`, `requestLimits`, `errorHandler`).
  - Monta rutas PDF: `app.use('/api/v1/pdf', pdfRoutes)`.
  - Health check `GET /health` → `{ status: 'ok' }`.
  - Exporta `app` para tests; `listen(PORT)` solo si `require.main === module`.
- [x] **T6.2** Crear `Dockerfile` multi-stage (builder + runtime Alpine):
  - Stage 1: `node:20-alpine` install deps (prod only), build si hubiera.
  - Stage 2: `node:20-alpine` copy deps + src, user `node`, `EXPOSE 3000`, `CMD ["node", "src/app.js"]`.
  - `.dockerignore` excluyendo `node_modules`, `.git`, `tests`, `*.md`, `.env*`.
- [x] **T6.3** Crear `.dockerignore`.
- [ ] **T6.4** **Test smoke Docker**: `docker build -t coreservices . && docker run -p 3000:3000 -e API_KEY=test coreservices` → `curl -H "X-API-Key: test" ...` funciona.
- [ ] **Hecho cuando:** App arranca en Docker; health check OK; endpoint responde en contenedor.

---

## T7 — Validación Final y Cierre

- [x] **T7.1** Ejecutar suite completa: `npm test` → todos verdes.
- [x] **T7.2** Verificar manualmente con cURL (ver sección Pruebas Manuales abajo).
- [x] **T7.3** Actualizar `MEMORY.md` con estado final, decisiones y siguiente servicio.
- [x] **Hecho cuando:** Suite 100% verde; validación manual exitosa; memoria actualizada.

---

## Pruebas Manuales (cURL)

```bash
# Variables
API_KEY="tu-api-key-segura"
ENDPOINT="http://localhost:3000/api/v1/pdf/encrypt"
PDF_FILE="documento.pdf"

# 1. Happy path (RF-1)
curl -X POST "$ENDPOINT" \
  -H "X-API-Key: $API_KEY" \
  -F "file=@$PDF_FILE" \
  -F "password=secreto123" \
  --output documento_encriptado.pdf

# 2. Sin API Key (RF-2) → 401
curl -X POST "$ENDPOINT" \
  -F "file=@$PDF_FILE" \
  -F "password=secreto123" \
  -v

# 3. API Key inválida (RF-2) → 401
curl -X POST "$ENDPOINT" \
  -H "X-API-Key: invalida" \
  -F "file=@$PDF_FILE" \
  -F "password=secreto123" \
  -v

# 4. Password corto (RF-3) → 400
curl -X POST "$ENDPOINT" \
  -H "X-API-Key: $API_KEY" \
  -F "file=@$PDF_FILE" \
  -F "password=123" \
  -v

# 5. Archivo > 100MB (RF-3) → 400 (crear archivo grande: dd if=/dev/zero of=big.pdf bs=1M count=101)
curl -X POST "$ENDPOINT" \
  -H "X-API-Key: $API_KEY" \
  -F "file=@big.pdf" \
  -F "password=secreto123" \
  -v

# 6. Archivo no PDF (RF-3) → 400
curl -X POST "$ENDPOINT" \
  -H "X-API-Key: $API_KEY" \
  -F "file=@imagen.png" \
  -F "password=secreto123" \
  -v

# 7. Health check
curl http://localhost:3000/health
```

---

## Orden de Ejecución Obligatorio

```
T1 → T2 → T3 → T4 → T5 → T6 → T7
```

**No saltar tareas.** Cada tarea depende de la anterior. Si una falla, parar y resolver antes de continuar.