# Plan 001 — Servicio de Encriptación de PDF

## Visión General Arquitectónica

Implementación del servicio `pdf` siguiendo **Arquitectura Hexagonal** dentro del monolito modular `CoreServices`. El módulo reside en `src/services/pdf/` con tres capas aisladas:

- **domain/** — Contratos puros (interfaces, entidades, puertos). Cero dependencias externas.
- **application/** — Casos de uso con lógica de negocio. Depende solo de `domain/`.
- **infrastructure/** — Adaptadores Express, controladores, implementación `pdf-lib`, middlewares. Depende de `domain/` y `application/`.

## Decisiones Técnicas

| Área | Decisión | Justificación |
|------|----------|---------------|
| **Framework HTTP** | Express.js | Estándar en Node.js, middleware ecosystem maduro |
| **Multipart parsing** | `busboy` (stream) | Procesa archivos >50MB sin cargar en RAM completa |
| **PDF Engine** | `pdf-lib` | Pure JS, sin binarios nativos, soporta encriptación AES-256 |
| **Auth** | `X-API-Key` header + middleware | Simple, stateless, apto para integración externa |
| **Testing** | `node --test` nativo | Sin dependencias extra, rápido, estándar Node 20 |
| **Error Handling** | Middleware centralizado `shared/errors` | Consistencia, logging, no fugas de stack traces |

## Estructura de Archivos a Crear

```
src/
├── app.js                          # Entry point, wiring global
├── shared/
│   ├── errors/
│   │   ├── AppError.js             # Clase base error aplicativo
│   │   ├── errorHandler.js         # Middleware centralizado
│   │   └── errorCodes.js           # Códigos estandarizados
│   └── middleware/
│       ├── apiKeyAuth.js           # Validación X-API-Key
│       └── requestLimits.js        # Límites body/stream
├── services/
│   └── pdf/
│       ├── domain/
│       │   ├── entities/
│       │   │   └── PDFDocument.js  # Entidad de dominio
│       │   ├── ports/
│       │   │   ├── PDFEncryptorPort.js     # Puerto salida (interface)
│       │   │   └── PDFValidatorPort.js     # Puerto validación
│       │   └── value-objects/
│       │       └── EncryptionOptions.js    # Value object opciones
│       ├── application/
│       │   ├── use-cases/
│       │   │   └── EncryptPDFUseCase.js    # Caso de uso principal
│       │   └── dto/
│       │       └── EncryptPDFDTO.js        # Data Transfer Object
│       └── infrastructure/
│           ├── adapters/
│           │   ├── PDFEncryptorAdapter.js  # Implementa PDFEncryptorPort con pdf-lib
│           │   └── PDFValidatorAdapter.js  # Implementa PDFValidatorPort
│           ├── http/
│           │   ├── routes/
│           │   │   └── pdfRoutes.js        # Definición rutas Express
│           │   ├── controllers/
│           │   │   └── PDFController.js    # Controlador HTTP
│           │   └── middlewares/
│               └── pdfUploadMiddleware.js  # Busboy config + límites
├── config/
│   └── index.js                      # Config centralizada (env)
└── server.js                         # Bootstrap server (opcional, si app.js no lo hace)
```

## Estrategia de Tests

| Capa | Tipo | Herramienta | Cobertura Objetivo |
|------|------|-------------|-------------------|
| **domain** | Unitarias | `node --test` | 100% entidades/value-objects |
| **application** | Unitarias (mocks puertos) | `node --test` | 100% casos de uso |
| **infrastructure/adapters** | Integración (pdf-lib real) | `node --test` | Happy path + edge cases |
| **infrastructure/http** | Integración HTTP (supertest o fetch nativo) | `node --test` | RF-1 a RF-4 completos |

**Test files location:** `tests/` mirroring `src/` structure:
```
tests/
├── unit/
│   ├── domain/
│   └── application/
├── integration/
│   ├── infrastructure/
│   └── http/
```

## Variables de Entorno Requeridas

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto HTTP | `3000` |
| `API_KEY` | Clave válida para `X-API-Key` | **requerida** |
| `MAX_FILE_SIZE` | Límite bytes upload (100MB) | `104857600` |
| `NODE_ENV` | Entorno | `development` |

## Flujo de Datos (RF-1)

```
Client POST /api/v1/pdf/encrypt
  → apiKeyAuth middleware (RF-2)
  → pdfUploadMiddleware (busboy, RF-3 size limit)
  → PDFController.encrypt()
      → EncryptPDFDTO (file buffer, password)
      → EncryptPDFUseCase.execute(dto)
          → PDFValidatorPort.validate(fileBuffer)  (RF-3 mime/type)
          → EncryptionOptions VO (password, permissions)
          → PDFEncryptorPort.encrypt(fileBuffer, options)
              → PDFEncryptorAdapter (pdf-lib) → Uint8Array encrypted
      → Response: binary PDF + headers
```

## Permisos PDF (RF-4)

`pdf-lib` permissions flags (owner password):
- `modify: false` — Prohíbe modificar
- `copy: false` — Prohíbe copiar contenido
- `print: true` — Permite impresión
- `printHighQuality: true` — Permite impresión alta resolución
- `annotate: false` — Prohíbe anotaciones
- `fillForms: false` — Prohíbe rellenar formularios
- `extract: false` — Prohíbe extraer texto/gráficos
- `assemble: false` — Prohíbe insertar/eliminar/girar páginas

User password: vacío (solo owner password protege permisos; user password abriría el doc).

## Seguridad

- Validación estricta `Content-Type: multipart/form-data`
- Límite `fileSize` en busboy = `MAX_FILE_SIZE` (100MB)
- Límite `files: 1` (solo un PDF por request)
- Sanitización nombre archivo original (no se usa en salida)
- Rate limiting recomendado en Render (WAF/Cloudflare), no en código

## Observabilidad

- Logging estructurado (consola JSON) en `errorHandler` y controladores
- Correlation ID opcional via header `X-Request-ID`
- Métricas básicas: latencia request, tamaño archivo, éxito/fallo