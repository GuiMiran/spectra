# Spectra vs el ecosistema completo de frameworks de especificación

> Comparativa honesta. Spectra no reemplaza a ninguno de estos — toma lo mejor de cada uno y añade lo que ninguno tiene.

---

## El mapa completo

```
CATEGORÍA 1 — ESPECIFICACIÓN DE DOMINIO
  Spectra          ← este repo
  DOORS (IBM)      ← enterprise RTM tradicional
  
CATEGORÍA 2 — ESPECIFICACIÓN PARA AGENTES DE CÓDIGO  
  OpenSpec         ← Fission AI, 27k⭐
  GitHub Spec Kit  ← GitHub, 2025

CATEGORÍA 3 — ESPECIFICACIÓN DE COMPORTAMIENTO
  BDD / Cucumber   ← Behaviour-Driven Development
  Gherkin          ← lenguaje de BDD
  
CATEGORÍA 4 — REGISTRO DE DECISIONES
  ADR              ← Architecture Decision Records
  MADR             ← Markdown ADR

CATEGORÍA 5 — CATÁLOGO DE SOFTWARE
  Backstage        ← Spotify, software catalog
  
CATEGORÍA 6 — INVENTARIO DE COMPONENTES
  SBOM             ← Software Bill of Materials

CATEGORÍA 7 — TRAZABILIDAD EN RUNTIME
  OpenTelemetry    ← spans, traces, métricas de ejecución
```

---

## Comparativa detallada

### Spectra vs RTM / DOORS

**RTM (Requirements Traceability Matrix)** es el estándar IEEE 829 de trazabilidad. DOORS es su implementación enterprise de IBM.

| Dimensión | RTM / DOORS | Spectra |
|---|---|---|
| Origen | IEEE 829, 1998 | 2025 |
| Destinatario | QA engineers, auditores | Agentes de IA |
| Formato | Excel, Word, herramienta SaaS | Markdown en el repo |
| Actualización | Manual por humanos | Automática por el agente |
| Dirección | Req → Test (unidireccional) | Spec ↔ Código (bidireccional) |
| Gap typing | No existe | FUNCIONAL vs TÉCNICO |
| Normativa | Referenciada externamente | Integrada en la spec |
| Coste | DOORS: licencia enterprise | Free, open source |
| Setup | Semanas | Minutos |
| Adecuado para IA agéntica | ❌ No | ✅ Diseñado para ello |

**Lo que Spectra toma de RTM**: la estructura matricial bidireccional y el concepto de trazabilidad como artefacto de primera clase.

**Lo que Spectra añade**: actualización agéntica, gap typing, severidad automática, integración con el ciclo de desarrollo.

---

### Spectra vs OpenSpec

**OpenSpec** (Fission AI) gestiona la evolución iterativa del código con un flujo `/opsx:new → /opsx:ff → /opsx:apply → /opsx:archive`.

| Dimensión | OpenSpec | Spectra |
|---|---|---|
| Capa | Construcción (capa 2) | Dominio (capa 1) |
| Qué especifica | Features de código | Dominio de negocio |
| Normativa legal | ❌ No | ✅ Obligatorio |
| Invariantes | ❌ No | ✅ Booleanas, verificables |
| Reconstrucción total | ❌ No | ✅ Sí |
| Requiere CLI | ✅ Sí | ❌ Solo Markdown |
| Gestiona backlog | ✅ Sí | ❌ No (lo delega) |
| Gap detection | ❌ No | ✅ Bidireccional |
| Historial de cambios | ✅ Por feature | ✅ Por iteración |

**Relación**: Spectra va primero. El Gap Report de SPECTRA-TRACE es el input natural para `/opsx:new`. Son complementarios, no competidores.

```
Spectra gap report  →  /opsx:new "implementar RN-012"  →  /opsx:ff  →  /opsx:apply
```

---

### Spectra vs GitHub Spec Kit

**GitHub Spec Kit** es el flujo `/specify → /plan → /tasks` integrado con Copilot/Claude Code/Gemini dentro del IDE de GitHub.

| Dimensión | GitHub Spec Kit | Spectra |
|---|---|---|
| Capa | Construcción (capa 2) | Dominio (capa 1) |
| Integración | GitHub + IDE | Agnóstico (cualquier LLM) |
| Qué genera | Plan técnico + tareas | Conocimiento de dominio |
| Normativa | ❌ No | ✅ Sí |
| Independiente del IDE | ❌ No | ✅ Sí |
| Reconstrucción total | ❌ No | ✅ Sí |

**Relación**: El SPECTRA-TRACE Gap Report puede alimentar directamente `/specify`. Spectra le da el contexto de dominio que GitHub Spec Kit no tiene.

---

### Spectra vs BDD / Cucumber / Gherkin

**BDD (Behaviour-Driven Development)** especifica comportamiento en formato DADO/CUANDO/ENTONCES. Cucumber lo ejecuta como test.

| Dimensión | BDD / Cucumber | Spectra |
|---|---|---|
| Foco | Comportamiento testeable | Dominio completo |
| Normativa | ❌ No | ✅ Sí |
| Invariantes | ❌ No | ✅ Sí |
| Ejecutable como test | ✅ Sí | ❌ No directamente |
| Requiere implementación | ✅ Sí (step definitions) | ❌ No |
| Orientado a IA | ❌ No | ✅ Sí |
| Cubre todo el dominio | Parcial (solo comportamiento) | ✅ Completo |

**Lo que Spectra toma de BDD**: la capa 11 (Criterios de Aceptación) usa el formato DADO/CUANDO/ENTONCES de Gherkin.

**Diferencia clave**: BDD especifica cómo el sistema se comporta en situaciones concretas. Spectra especifica por qué el sistema existe, qué reglas lo gobiernan, y qué invariantes nunca pueden romperse. BDD es un subconjunto de lo que Spectra cubre.

```
Spectra Capa 11 (Criterios de Aceptación)  ≈  BDD scenarios
Spectra Capas 03-06 (Reglas, Invariantes, Contratos, Políticas)  ≠  Nada en BDD
```

---

### Spectra vs ADR / MADR

**ADR (Architecture Decision Records)** captura decisiones de arquitectura: contexto, opciones consideradas, decisión tomada, consecuencias.

| Dimensión | ADR / MADR | Spectra |
|---|---|---|
| Qué captura | Decisiones pasadas | Estado actual + historial |
| Formato | Narrativo | Estructurado y machine-readable |
| Orientado a IA | ❌ No | ✅ Sí |
| Bidireccional | ❌ No (solo pasado→presente) | ✅ Sí |
| Dominio de negocio | Parcial | ✅ Completo |
| Gap detection | ❌ No | ✅ Sí |

**Lo que Spectra toma de ADR**: el concepto de capturar el *porqué* de las decisiones, no solo el *qué*. La capa de notas en SPECTRA-TRACE incluye el contexto de decisión como hace ADR.

**Diferencia clave**: ADR mira hacia atrás (por qué se decidió así). Spectra mira hacia adelante (qué falta implementar) y hacia atrás simultáneamente.

---

### Spectra vs Backstage

**Backstage** (Spotify) es un portal de desarrolladores que cataloga componentes de software, owners, documentación y dependencias.

| Dimensión | Backstage | Spectra |
|---|---|---|
| Qué cataloga | Componentes técnicos | Dominio de negocio |
| Requiere infraestructura | ✅ Servidor, plugins | ❌ Solo Markdown |
| Normativa | ❌ No | ✅ Sí |
| Gap detection | ❌ No | ✅ Sí |
| Para equipos grandes | ✅ Diseñado para ello | ✅ También escala |
| Orientado a IA agéntica | ❌ No | ✅ Sí |

**Diferencia clave**: Backstage cataloga lo que existe. Spectra define lo que debe existir y detecta la diferencia.

---

### Spectra vs SBOM

**SBOM (Software Bill of Materials)** es un inventario formal de los componentes de un sistema software. Origen en supply chain security.

| Dimensión | SBOM | Spectra |
|---|---|---|
| Qué inventaría | Dependencias y componentes | Specs y su implementación |
| Orientado a seguridad | ✅ Sí (CVEs, licencias) | ❌ No |
| Orientado a dominio | ❌ No | ✅ Sí |
| Gap detection | ❌ No | ✅ Sí |
| Machine-readable | ✅ SPDX, CycloneDX | ✅ Markdown estructurado |

**Concepto prestado**: SPECTRA-TRACE toma la idea de inventario exhaustivo de SBOM y la aplica a la relación specs↔código en lugar de dependencias↔vulnerabilidades.

---

### Spectra vs OpenTelemetry

**OpenTelemetry** captura trazas, métricas y logs de la ejecución de sistemas distribuidos en runtime.

| Dimensión | OpenTelemetry | Spectra |
|---|---|---|
| Cuándo actúa | Runtime (producción) | Design time (antes del código) |
| Qué traza | Llamadas, latencias, errores | Specs, gaps, decisiones |
| Orientado a IA | ❌ No | ✅ Sí |
| Normativa | ❌ No | ✅ Sí |

**Concepto prestado**: SPECTRA-TRACE toma el concepto de **span** de OpenTelemetry — cada implementación tiene metadata tipada (qué spec implementa, cuándo, en qué iteración) — y lo aplica al diseño en lugar del runtime.

---

## Tabla resumen global

| Framework | Capa | Dominio negocio | Normativa | Invariantes | Gap detection | Orientado IA | Actualización |
|---|---|---|---|---|---|---|---|
| **Spectra** | Dominio | ✅ | ✅ | ✅ | ✅ Bidireccional | ✅ | Agéntica |
| OpenSpec | Construcción | ❌ | ❌ | ❌ | ❌ | Parcial | Agéntica |
| GitHub Spec Kit | Construcción | ❌ | ❌ | ❌ | ❌ | Parcial | Agéntica |
| BDD/Cucumber | Comportamiento | Parcial | ❌ | ❌ | ❌ | ❌ | Manual |
| RTM/DOORS | Trazabilidad | ❌ | Referencia | ❌ | Parcial | ❌ | Manual |
| ADR/MADR | Decisiones | Parcial | ❌ | ❌ | ❌ | ❌ | Manual |
| Backstage | Catálogo | ❌ | ❌ | ❌ | ❌ | ❌ | Semi-auto |
| SBOM | Inventario | ❌ | ❌ | ❌ | ❌ | ❌ | Auto |
| OpenTelemetry | Runtime | ❌ | ❌ | ❌ | ❌ | ❌ | Auto |

---

## El stack completo recomendado

```
┌─────────────────────────────────────────────────────────────┐
│  ANTES DEL CÓDIGO                                           │
│  Spectra ← dominio, normativa, invariantes, 12 capas       │
│  ADR     ← decisiones de arquitectura que complementan      │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  CONSTRUCCIÓN ITERATIVA                                     │
│  OpenSpec / GitHub Spec Kit ← features, tareas, código     │
│  alimentado por SPECTRA-TRACE.Gap Report                    │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  EL CÓDIGO                                                  │
│  BDD/Cucumber ← tests de comportamiento                     │
│  SBOM         ← inventario de dependencias                  │
│  OpenTelemetry ← observabilidad en runtime                  │
└─────────────────────────────────────────────────────────────┘
```

Spectra no compite con ninguno de estos frameworks. Es la capa que faltaba antes de todos ellos.
