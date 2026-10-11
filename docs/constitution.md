# Constitución CoreServices Engine
Principios innegociables. Toda spec, plan y tarea debe respetarlos rigurosamente.

1. **Simplicidad y Modularidad**: Monolito modular basado en Node.js, Express y Docker. Cada servicio en `services/` debe estar completamente aislado.
2. **La Spec Manda**: Nada se implementa si no está descrito y aprobado en la especificación activa (`specs/`). Si falta una decisión, se detiene el proceso y se pregunta.
3. **Arquitectura Hexagonal Estricta**: La lógica de negocio pura (`application/`) no debe tener acoplamiento con frameworks HTTP (Express) ni librerías de infraestructura (`pdf-lib`).
4. **Tests como Puerta de Calidad**: La lógica y los adaptadores se validan mediante pruebas automáticas con el test runner nativo de Node.js (`node --test`). Prohibido avanzar con tests en rojo.
5. **Seguridad y Control de Cargas**: Todo archivo procesado multipart debe respetar estrictamente el límite moderado establecido (50 MB - 100 MB) mediante streams (`busboy`) para proteger la RAM.
6. **Idioma**: Código fuente, comentarios técnicos y nombres de métodos en inglés; documentación, especificaciones e interfaz de usuario/mensajes en español.