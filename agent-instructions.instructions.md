---
name: agent-instructions
version: 1.0
description: "Instrucciones persistentes del usuario para agentes: ejecutar solo lo pedido y con mínima intrusión. No retroactivas."
applyTo:
  - "**/*.js"
  - "**/*.ts"
  - "**/*.html"
  - "**/*.md"
doNotEditExistingFilesAutomatically: true
---

Resumen
- Estas instrucciones deben aplicarse cada vez que el usuario pida una tarea concreta. Son reglas persistentes y no retroactivas.

Regla principal
- Si se pide "haz X", haz únicamente `X`. No introducir cambios adicionales, refactorizaciones ni optimizaciones no solicitadas.
- Solo se permiten cambios adicionales cuando son estrictamente necesarios para que `X` funcione; en ese caso, incluir una breve justificación en el commit/patch (1 línea).

Reglas complementarias (breves)
- Comentarios: mínimos y humanos — explicar decisiones no obvias; evitar comentarios en primera persona o de historial.
- Código: claro y legible; respetar el estilo y convenciones del repositorio.
- Validación: asumir por defecto que la entrada/formatos son correctos; añadir validaciones solo si se pide o la documentación lo indica.
- Componentes: no eliminar componentes ni implementar `remove()` salvo petición explícita.

Ejemplos
- Petición: "Corrige bug en `foo()` para que devuelva 0 en caso X" → Cambiar solo `foo()` (líneas estrictamente necesarias). Si se requieren otras modificaciones, justificarlas en 1 línea.
- Petición: "Añade validación al endpoint" → Añadir solo la validación solicitada en el lugar indicado; no añadir validaciones globales.

Aplicación práctica para agentes/robots
- Antes de crear parches, limitar el diff a lo estrictamente necesario.
- Evitar reformataciones masivas o renombrados que no estén en la petición.
- Si detectas que `X` no es posible sin cambios mayores, detener y pedir confirmación al usuario explicando la mínima intervención requerida.

Texto machine-readable (resumen para parsers):

```json
{
  "rules": [
    { "id": "R1", "text": "Do only X when asked; no other changes unless strictly necessary." },
    { "id": "R2", "text": "Minimal human comments; no agent narration." },
    { "id": "R3", "text": "Prefer clear, readable code; follow repo conventions." },
    { "id": "R4", "text": "Assume inputs/formats are correct by default." },
    { "id": "R5", "text": "Do not remove components or implement remove() unless asked." }
  ],
  "notRetroactive": true
}
```

Ambigüedades que requieren confirmación
- Ámbito: si debe aplicarse solo a archivos de código o también a docs; por defecto se aplica a `applyTo` del frontmatter.

Nota sobre retroactividad
- La bandera `doNotEditExistingFilesAutomatically` indica que el agente no debe modificar archivos existentes por su cuenta cuando estas reglas entren en vigor. Las reglas se aplican a acciones futuras o cuando el usuario solicite explícitamente que edite código existente.

Fin.
