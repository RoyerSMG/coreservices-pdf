# AGENTS.md — CoreServices

Este archivo contiene las convenciones de trabajo, estándares de código y limites operativos para los agentes de Inteligencia Artificial y desarrolladores que colaboren en **CoreServices**.

---

## Nombre del Proyecto
**CoreServices** (Node.js Modular Monolith Engine)

---

## Stack y Estructura

### Tech Stack
- **Backend:** Node.js 20 (ES6+ / CommonJS o Modules), Express.js.
- **Procesamiento de Archivos:** Busboy (Stream Parser).
- **Librerías de Dominio:** `pdf-lib`.
- **Contenedores:** Docker (Multi-stage build / Alpine).
- **Infraestructura:** Render Web Service.

### Estructura de Directorios
```text
CoreServices/
├── .opencode/
│   └── commands/                  # Comandos personalizados para el ciclo SDD
│       ├── sdd-constitution.md
│       ├── sdd-spec.md
│       ├── sdd-clarify.md
│       ├── sdd-plan.md
│       ├── sdd-tasks.md
│       ├── sdd-implement.md
│       ├── sdd-validate.md
│       ├── sdd-change.md
│       └── sdd-status.md
├── .agents/
│   └── skills/
│       └── sdd/                   # Skill principal de Spec-Driven Development
│           └── SKILL.md
├── docs/
│   └── constitution.md            # Principios innegociables de CoreServices
├── specs/
│   └── 001-pdf-encryption/        # Directorio de la especificación activa del servicio PDF
│       ├── spec.md                # El qué y el por qué (Requisitos EARS)
│       ├── plan.md                # Arquitectura, decisiones técnicas y estrategia de tests
│       └── tasks.md               # Tareas atómicas con checkboxes y "Hecho cuando:"
├── src/
│   └── services/
│       └── pdf/                   # Módulo de PDF (Arquitectura Hexagonal)
│           ├── domain/
│           ├── application/
│           └── infrastructure/
├── tests/                         # Pruebas automatizadas (Node test runner)
├── AGENTS.md                      # Reglas generales del agente e integración SDD
├── MEMORY.md                      # Registro de estado y decisiones técnicas
└── PROMPT.md                    # Punto de entrada principal

```