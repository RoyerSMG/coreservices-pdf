# Spec 001 — Servicio de Encriptación de PDF

**Estado:** aprobada[cite: 16]

## Contexto y objetivo
Permitir a sistemas externos y aplicaciones cliente cifrar documentos PDF de forma segura mediante una API REST en Node.js, aplicando contraseñas de usuario/propietario y restricciones de permisos sin saturar los recursos del servidor[cite: 9, 13].

## Usuarios / actores
- Desarrolladores y aplicaciones cliente que consumen la API REST mediante autenticación por clave de API.

## Historias de usuario
- **HU-1:** Como desarrollador de una aplicación externa, quiero enviar un archivo PDF y una contraseña al endpoint de la API para recibir de vuelta el documento protegido con cifrado.

## Requisitos funcionales (EARS)
- **RF-1:** CUANDO el cliente envíe una petición POST a `/api/v1/pdf/encrypt` con una clave `x-api-key` válida, un archivo PDF adjunto y el campo `password`, EL SISTEMA procesará el archivo y devolverá el binario cifrado con cabecera `application/pdf`[cite: 13, 16].
- **RF-2:** SI la petición no incluye la cabecera `x-api-key` o esta es incorrecta, ENTONCES EL SISTEMA rechazará la conexión respondiendo con código `401 Unauthorized`[cite: 13, 16].
- **RF-3:** SI el archivo PDF supera el límite de 100 MB o la contraseña tiene menos de 4 caracteres, ENTONCES EL SISTEMA detendrá el proceso y devolverá un código `400 Bad Request` con el detalle del error.
- **RF-4:** EL SISTEMA aplicará permisos predeterminados que prohíban la modificación y copia del contenido, permitiendo la impresión en alta resolución[cite: 13, 16].

## Requisitos no funcionales
- Procesamiento en streaming mediante `busboy` para optimizar el consumo de memoria RAM.
- Despliegue contenerizado mediante Docker en Render.com.

## Casos límite
- Archivos corruptos o que no correspondan al formato MIME de PDF.
- Peticiones concurrentes masivas dentro del límite de tamaño permitido.

## Fuera de alcance
- Interfaz gráfica integrada dentro del monolito (el frontend estará completamente desacoplado en otro repositorio/proyecto).

## Criterios de finalización
- Todos los requisitos funcionales cuentan con pruebas automatizadas en verde usando `node --test`[cite: 13, 14].
- Verificación exitosa del flujo mediante pruebas de integración HTTP.