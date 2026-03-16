# Spectra vs el ecosistema de specs para IA

> **TL;DR**: Spectra, OpenSpec y GitHub Spec Kit no compiten. Son capas distintas del mismo stack. Spectra va primero.

---

## El stack completo

```
┌─────────────────────────────────────────────────────┐
│  CAPA 1 · DOMINIO                                   │
│  ┌─────────────────────────────────────────────┐   │
│  │  SPECTRA                                    │   │
│  │  Qué es el sistema                          │   │
│  │  Reglas · Invariantes · Normativa · Dominio │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
         ↓  las specs alimentan al agente
┌─────────────────────────────────────────────────────┐
│  CAPA 2 · CONSTRUCCIÓN                              │
│  ┌──────────────────┐   ┌──────────────────────┐   │
│  │  OpenSpec        │   │  GitHub Spec Kit      │   │
│  │  Cómo evoluciona │   │  /specify → /plan     │   │
│  │  el código       │   │  → /tasks → build     │   │
│  └──────────────────┘   └──────────────────────┘   │
└─────────────────────────────────────────────────────┘
         ↓  el agente construye
┌─────────────────────────────────────────────────────┐
│  CAPA 3 · CÓDIGO                                    │
│  Tu aplicación                                      │
└─────────────────────────────────────────────────────┘
```

Sin Spectra en la capa 1, el agente en la capa 2 adivina el dominio. Con Spectra, lo conoce.

---

## Comparativa detallada

### ¿Qué especifica cada herramienta?

| | Spectra | OpenSpec | GitHub Spec Kit |
|---|---|---|---|
| **Reglas de negocio** | ✅ Con fuente normativa | ❌ | ❌ |
| **Invariantes booleanas** | ✅ | ❌ | ❌ |
| **Normativa legal** | ✅ Obligatorio | ❌ | ❌ |
| **Glosario de dominio** | ✅ | ❌ | ❌ |
| **Contratos de operación** | ✅ Pre/post condiciones | ❌ | Parcial |
| **Agentes y skills** | ✅ | ❌ | ❌ |
| **Features técnicas** | ❌ (no es su capa) | ✅ | ✅ |
| **Tareas de código** | ❌ (no es su capa) | ✅ | ✅ |
| **Reconstrucción total** | ✅ | ❌ | ❌ |

### ¿Cómo funciona cada uno?

**Spectra**
```
1. Rellenas SPECTRA-PROMPT.md con tu dominio
2. LLM genera las 12 capas (Markdown puro)
3. Las specs viven en tu repo como fuente de verdad
4. El agente las consume como contexto en cada sesión
5. Cuando cambia una regla → actualizas la spec
```

**OpenSpec**
```
1. /opsx:new  → crea carpeta para el cambio
2. /opsx:ff   → genera proposal.md + specs/ + design.md + tasks.md
3. /opsx:apply → el agente implementa las tasks
4. /opsx:archive → fusiona en la spec principal
```

**GitHub Spec Kit**
```
1. /specify  → genera la especificación técnica de la feature
2. /plan     → produce el plan de implementación
3. /tasks    → deriva la lista de tareas accionables
4. El agente (Copilot/Claude Code/Gemini) implementa
```

### ¿Qué problema resuelve cada uno?

| | Problema que resuelve |
|---|---|
| **Spectra** | *"El agente no conoce mi dominio, adivina las reglas de negocio y las normas que aplican"* |
| **OpenSpec** | *"El agente pierde el contexto de los cambios anteriores y no mantiene coherencia entre features"* |
| **GitHub Spec Kit** | *"No sé cómo pasar de una idea a tareas concretas que el agente pueda ejecutar"* |

Son tres problemas distintos. Los tres son reales.

---

## Por qué Spectra va primero

OpenSpec y GitHub Spec Kit son herramientas de construcción. Necesitan saber qué construir.

Cuando el agente genera una feature con OpenSpec o GitHub Spec Kit, implícitamente toma decisiones de negocio: qué validaciones aplicar, qué estados son posibles, qué reglas fiscales respetar, qué flujos son legales. Sin Spectra, esas decisiones las toma el agente solo — y las toma mal, o de forma inconsistente, o ignorando la normativa.

Con Spectra como contexto, el agente que ejecuta OpenSpec o GitHub Spec Kit ya conoce el dominio. Sus decisiones de implementación son correctas porque las restricciones del negocio están explícitas.

```
Sin Spectra:
/opsx:new "añadir facturación"
→ el agente inventa cómo funciona la facturación

Con Spectra:
/opsx:new "añadir facturación"
→ el agente sabe que factura = subtotal + IVA 21%,
  que necesita customerId obligatorio,
  que genera 3 asientos contables,
  que el número es secuencial FAC-YYYY-NNN
```

---

## El argumento de reconstrucción

Esta es la diferencia más importante, y la menos obvia.

Cada vez que abres una nueva sesión con un agente, el agente empieza desde cero. No recuerda la sesión anterior. No sabe qué decisiones se tomaron hace tres semanas. No conoce las excepciones que "todo el mundo sabe".

OpenSpec y GitHub Spec Kit gestionan el historial de cambios — qué se añadió, qué se modificó, qué está planificado. Pero no capturan el porqué de las reglas de negocio, la normativa que las justifica, los invariantes que no pueden romperse.

Spectra captura exactamente eso. Es el contexto que no cambia entre sesiones.

```
Test de reconstrucción:

1. Borra todo el código
2. Abre una sesión nueva con el agente
3. Dale solo las Spectra specs
4. Pídele que reconstruya el sistema

Si puede: las specs son completas.
Si no puede: hay conocimiento viviendo fuera de las specs.
```

OpenSpec y GitHub Spec Kit no pasan este test. No están diseñados para ello. Spectra sí.

---

## Cuándo usar qué

**Solo Spectra** — cuando estás en fase de diseño de dominio, antes de escribir una línea de código. Cuando necesitas alinear al equipo sobre las reglas del negocio. Cuando quieres que cualquier agente pueda retomar el proyecto sin briefing.

**Spectra + OpenSpec** — para proyectos en curso con cambios frecuentes. Spectra como capa de dominio permanente, OpenSpec para gestionar la evolución del código.

**Spectra + GitHub Spec Kit** — si usas el ecosistema GitHub/Copilot. Spectra como contexto de dominio, GitHub Spec Kit para el flujo /specify → /plan → /tasks.

**Los tres juntos** — stack completo para proyectos complejos con dominio regulado, equipo distribuido y agentes múltiples.

---

## Lo que Spectra no intenta ser

Spectra no reemplaza a OpenSpec ni a GitHub Spec Kit. No gestiona el historial de features, no genera tareas de código, no se integra con tu IDE.

Spectra hace una sola cosa: dar al agente el conocimiento de dominio que necesita para que todas las demás herramientas funcionen correctamente.

**Las specs no son documentación. Son el sistema.**

---

## Referencias

- [OpenSpec](https://github.com/fission-codes/openspec) — Fission AI, 27k⭐
- [GitHub Spec Kit](https://github.com/github/spec-kit) — GitHub, 2025
- [Spectra](https://github.com/tuusuario/spectra) — este repo
