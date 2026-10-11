name: sdd
description: Úsala siempre que trabajes con Spec-Driven Development en este proyecto (docs/constitution.md o specs/), ya sea para redactar, revisar, cambiar o implementar tareas de una spec.

# Spec-Driven Development (SDD) en CoreServices

## Reglas del Flujo
1. **Secuencia estricta:** Constitución ➔ Spec ➔ Clarificación ➔ Plan ➔ Tareas ➔ Implementación ➔ Validación[cite: 11]. Nunca pases de fase sin aprobación explícita[cite: 16].
2. **La Spec manda:** Si un requisito no está en la spec activa, no se escribe código[cite: 16].
3. **Estructura en EARS (en español):**
   - `RF-x: CUANDO <evento>, EL SISTEMA <respuesta>[cite: 13, 16].`
   - `RF-x: SI <condición no deseada>, ENTONCES EL SISTEMA <respuesta>[cite: 13, 16].`
   - `RF-x: MIENTRAS <estado>, EL SISTEMA <respuesta>[cite: 13, 16].`
   - `RF-x: EL SISTEMA <comportamiento permanente>[cite: 13, 16].`
4. **Implementación atómica:** Una sola tarea a la vez (`tasks.md`). Tests primero (en rojo), luego código hasta ponerlos en verde con `node --test`, marcar la tarea y parar[cite: 16, 18].
5. **Memoria:** Al terminar cada fase, actualiza `MEMORY.md`[cite: 16].