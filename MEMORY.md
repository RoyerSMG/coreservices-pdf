# MEMORY.md — CoreServices Engine Log

Diario de memoria técnica del proyecto entre sesiones. Mantener breve (~50 líneas máximo).

## Estado actual
- **Proyecto:** `CoreServices` (Monolito Modular Node.js).
- **Fase:** Completada - Servicio PDF de encriptación operativo.
- **Servicio activo:** `src/services/pdf` (encriptación de documentos PDF).
- **Límite de carga:** Configurado en 100 MB procesados por streams.

## Decisiones Principales (y por qué)
- **Monolito Modular sobre Microservicios:** Facilita el desarrollo veloz y reduce costos de infraestructura al desplegar en Render, manteniendo la opción de separar servicios en el futuro.
- **Límite de Payload (100MB):** Establecido para equilibrar la capacidad de procesar archivos complejos/pesados de uso empresarial sin desbordar los recursos de memoria del servidor.
- **Procesamiento Eficiente con Busboy:** Uso de parsers basados en streams para procesar partes binarias sobre la marcha sin sobrecargar la RAM con buffers pesados.
- **Autenticación Dual:** Permite el consumo transparente de peticiones desde el formulario cliente interno y mediante `X-API-Key` para integrar con software externo.
- **Arquitectura Hexagonal Estricta:** Separación clara domain/application/infrastructure para mantenibilidad y testabilidad.
- **Librería de Encriptación:** `@pdfsmaller/pdf-encrypt` (AES-256) tras detectar que `pdf-lib` v1.17.1 no expone método `encrypt()`.

## Aprendizajes y Errores a Evitar
- No acumular streams en memoria sin establecer límites de tamaño de archivo (`fileSize` limit en Busboy) para evitar vulnerabilidades DoS.
- Evitar importar Express dentro de los casos de uso (`application/`) para preservar la independencia de la arquitectura hexagonal.
- `require()` no funciona en ESM - usar `import()` dinámico para middlewares que necesiten Express.
- `@pdfsmaller/pdf-encrypt` espera passwords como strings (no Uint8Array) y opciones de permisos con nombres específicos (`allowPrinting`, `allowModifying`, etc.).
- Tests de integración HTTP requieren configurar variables de entorno ANTES de importar la app (config se carga en import time).

## Próximos pasos
1. Desplegar en Render.com usando el Dockerfile multi-stage.
2. Configurar variable `API_KEY` segura en entorno de producción.
3. Implementar rate limiting en Render (WAF/Cloudflare) para protección adicional.
4. Próximo servicio candidato: `services/email` o `services/reports` según prioridad de negocio.