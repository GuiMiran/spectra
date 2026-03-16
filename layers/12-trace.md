# CAPA 12 — SPECTRA-TRACE
## Matriz de Trazabilidad Agéntica Bidireccional

> **Propósito**: Grafo vivo de relaciones entre specs e implementación. Se actualiza automáticamente al final de cada iteración. Detecta gaps funcionales (spec sin código) y gaps técnicos (código sin spec).

---

## Diseño de ingeniería

### Qué problema resuelve

Los sistemas de trazabilidad tradicionales (RTM, DOORS, Jira) son **snapshots manuales**. Alguien los crea, nadie los actualiza, en dos semanas son mentira.

SPECTRA-TRACE es diferente en tres aspectos:

1. **Lo actualiza el agente, no el humano** — al final de cada iteración, el agente ejecuta el protocolo de traza y actualiza el archivo
2. **Es bidireccional** — no solo spec→código sino también código→spec
3. **Tipifica los gaps** — no todos los gaps son iguales. Un invariante sin implementar es CRÍTICO. Una historia de baja prioridad sin implementar es MENOR.

### Inspiración de frameworks existentes

| Framework | Qué tomamos | Qué descartamos |
|---|---|---|
| **RTM (IEEE 829)** | Estructura matricial bidireccional | Proceso manual, estático |
| **ADR** | Registro de decisiones con contexto | Solo captura el pasado, no el estado actual |
| **Cucumber/BDD** | Linkado spec↔test ejecutable | Acoplado a código, no a dominio |
| **OpenTelemetry** | Concepto de span con metadata tipada | Orientado a runtime, no a diseño |
| **Backstage** | Catálogo con ownership y relaciones | Demasiado pesado, requiere infraestructura |
| **SBOM** | Inventario exhaustivo de componentes | Solo descripción, sin gaps ni estado |

SPECTRA-TRACE combina la **estructura de RTM**, el **tipado de OpenTelemetry** y el **protocolo de actualización agéntica** que ninguno de ellos tiene.

---

## Schema del archivo `SPECTRA-TRACE.md`

```
SPECTRA-TRACE.md
├── [1] Coverage Dashboard     ← métricas de cobertura auto-calculadas
├── [2] Forward Matrix         ← Spec → Código (detecta gaps FUNCIONALES)
├── [3] Reverse Matrix         ← Código → Spec (detecta gaps TÉCNICOS)
├── [4] Gap Report             ← resumen accionable de la iteración actual
├── [5] Iteration Log          ← historial de cambios por iteración
└── [6] Agent Protocol         ← instrucciones para que el agente actualice
```

---

## [1] Coverage Dashboard

```markdown
## Coverage Dashboard
> Última actualización: iter-N · {fecha} · Agente: {modelo}

| Métrica                    | Valor   | Tendencia |
|----------------------------|---------|-----------|
| Specs totales              | 47      | —         |
| Specs implementadas        | 31      | ↑ +4      |
| Cobertura funcional        | 65.9%   | ↑ +8.5%   |
| Artefactos sin spec        | 3       | ↓ -1      |
| Gaps CRÍTICOS              | 2       | ↓ -1      |
| Gaps MAYORES               | 6       | → 0       |
| Gaps MENORES               | 8       | ↑ +2      |
| Iteración actual           | iter-5  | —         |
```

**Regla de cobertura funcional**:
```
cobertura = specs_implementadas / specs_totales × 100
```

Una spec está "implementada" cuando tiene al menos un artefacto de código vinculado Y al menos un criterio de aceptación que la valida.

---

## [2] Forward Matrix — Spec → Código

**Detecta gaps FUNCIONALES**: specs que no tienen implementación.

### Campos obligatorios

| Campo | Tipo | Descripción |
|---|---|---|
| `spec_id` | string | ID de la spec origen (RN-001, INV-003, HU-007...) |
| `spec_type` | enum | `RN` `INV` `HU` `POL` `EVT` `SK` `WF` |
| `descripcion` | string | Descripción corta de la spec |
| `prioridad` | enum | `MUST` `SHOULD` `COULD` |
| `estado` | enum | `✅ IMPL` `⏳ PARCIAL` `❌ PENDIENTE` `🚫 EXCLUIDO` |
| `artefactos` | string[] | Archivos/funciones que la implementan |
| `tests` | string[] | IDs de criterios de aceptación que la validan |
| `severidad_gap` | enum | `CRÍTICO` `MAYOR` `MENOR` `—` |
| `iter_ultima` | string | Última iteración que la tocó |
| `notas` | string | Decisiones, bloqueos, deuda técnica |

### Tabla de severidad de gaps

```
CRÍTICO  ← INV (invariante) sin implementar
          ← RN de normativa legal sin implementar  
          ← SK (skill) bloqueante sin implementar
          
MAYOR    ← RN de negocio MUST sin implementar
          ← HU prioridad MUST sin implementar
          ← WF (workflow) principal sin implementar
          
MENOR    ← RN SHOULD/COULD sin implementar
          ← HU prioridad SHOULD/COULD sin implementar
          ← POL de caso edge sin implementar
```

### Ejemplo de Forward Matrix

```markdown
## Forward Matrix — Spec → Código

| spec_id | tipo | descripción | prior. | estado | artefactos | tests | severidad | iter |
|---------|------|-------------|--------|--------|------------|-------|-----------|------|
| INV-001 | INV | total = subtotal + IVA siempre | MUST | ✅ IMPL | accounting.js:computeInvoiceFigures | AC-001 | — | iter-2 |
| INV-002 | INV | cliente requerido para facturar | MUST | ✅ IMPL | AppContext.jsx:generateInvoice, CobrosView.jsx | AC-007 | — | iter-3 |
| INV-003 | INV | 3 asientos contables por factura | MUST | ⏳ PARCIAL | accounting.js:generateJournalEntries | — | CRÍTICO | iter-4 |
| RN-001  | RN  | IVA 21% base imponible | MUST | ✅ IMPL | accounting.js:VAT_RATE | AC-002 | — | iter-2 |
| RN-007  | RN  | numeración FAC-YYYY-NNN secuencial | MUST | ✅ IMPL | invoiceGen.js:generateInvoiceNumber | AC-011 | — | iter-3 |
| RN-012  | RN  | retención IRPF 15% profesionales | MUST | ❌ PENDIENTE | — | — | MAYOR | — |
| HU-004  | HU  | exportar factura a PDF | SHOULD | ⏳ PARCIAL | InvoiceDocument.jsx | — | MENOR | iter-4 |
| POL-003 | POL | recargo equivalencia 5.2% | COULD | 🚫 EXCLUIDO | — | — | — | iter-1 |
```

---

## [3] Reverse Matrix — Código → Spec

**Detecta gaps TÉCNICOS**: artefactos de código sin spec que los justifique.

### Campos obligatorios

| Campo | Tipo | Descripción |
|---|---|---|
| `artefacto` | string | Archivo o función |
| `tipo` | enum | `función` `componente` `hook` `util` `config` `test` |
| `descripcion` | string | Qué hace |
| `spec_id` | string[] | IDs de specs que lo justifican |
| `estado` | enum | `✅ TRAZADO` `⚠️ HUÉRFANO` `🔍 REVISAR` |
| `accion` | enum | `MANTENER` `ESPECIFICAR` `ELIMINAR` `REFACTORIZAR` |
| `iter_detectado` | string | Cuándo se detectó el gap |

### Clasificación de artefactos huérfanos

```
⚠️ HUÉRFANO + ELIMINAR     ← código que nadie pidió, no aporta valor
⚠️ HUÉRFANO + ESPECIFICAR  ← código válido pero falta la spec que lo justifique
⚠️ HUÉRFANO + REFACTORIZAR ← código que debería estar en otra spec
🔍 REVISAR                 ← ambiguo, necesita decisión humana
```

### Ejemplo de Reverse Matrix

```markdown
## Reverse Matrix — Código → Spec

| artefacto | tipo | descripción | specs | estado | acción | iter |
|-----------|------|-------------|-------|--------|--------|------|
| accounting.js:computeInvoiceFigures | función | calcula subtotal/vat/total | INV-001, RN-001 | ✅ TRAZADO | MANTENER | iter-2 |
| invoiceGen.js:renderInvoiceText | función | genera texto WhatsApp | HU-009 | ✅ TRAZADO | MANTENER | iter-3 |
| utils/calculateDiscount.js | función | aplica descuentos por volumen | — | ⚠️ HUÉRFANO | ESPECIFICAR | iter-4 |
| hooks/useRetryLogic.js | hook | reintentos de llamadas API | — | ⚠️ HUÉRFANO | ELIMINAR | iter-4 |
| components/DebugPanel.jsx | componente | panel de debug interno | — | ⚠️ HUÉRFANO | ELIMINAR | iter-3 |
```

---

## [4] Gap Report

Generado automáticamente al final de cada iteración. Es el output accionable.

```markdown
## Gap Report — iter-5 · 2024-03-15

### 🔴 Gaps CRÍTICOS (bloquean completitud del dominio)

GAP-C001 · INV-003 sin implementar completamente
  Spec: "Cada factura genera exactamente 3 asientos contables balanceados"
  Estado actual: generateJournalEntries() genera DR 430 pero falta CR 700 y CR 477
  Acción requerida: completar los 3 asientos en accounting.js
  Impacto: el sistema puede emitir facturas con contabilidad incorrecta

### 🟠 Gaps MAYORES (funcionalidad de negocio incompleta)

GAP-M001 · RN-012 sin implementar
  Spec: "Retención IRPF 15% en facturas a profesionales"
  Estado actual: sin implementación
  Acción requerida: añadir lógica de retención en invoiceGen.js
  Impacto: facturas a profesionales son fiscalmente incorrectas

GAP-M002 · HU-006 parcialmente implementada
  Spec: "Como administrador quiero ver el libro de IVA mensual"
  Estado actual: AccountingView muestra totales pero sin desglose mensual
  Acción requerida: añadir filtro temporal en DailyClosure.jsx

### 🟡 Gaps MENORES (mejoras y casos edge)

GAP-m001 · HU-004 parcialmente implementada
  Spec: "exportar factura a PDF"
  Estado actual: renderInvoiceHTML() existe pero el botón de descarga no está conectado
  Acción requerida: conectar botón en InvoiceDocument.jsx

### ⚠️ Artefactos Huérfanos (código sin spec)

HUÉRFANO-001 · utils/calculateDiscount.js
  Detectado: iter-4. Nadie ha reclamado esta función.
  Decisión requerida: ¿especificar descuentos o eliminar?

HUÉRFANO-002 · hooks/useRetryLogic.js
  Detectado: iter-4. Lógica de reintentos sin caso de uso definido.
  Recomendación: ELIMINAR — no hay spec que lo justifique

### ✅ Cerrado en esta iteración

CERRADO-001 · INV-002 — cliente requerido para facturar (era CRÍTICO en iter-4)
CERRADO-002 · RN-001 — IVA 21% base imponible (era MAYOR en iter-1)
```

---

## [5] Iteration Log

Historial comprimido. Una línea por iteración.

```markdown
## Iteration Log

| iter | fecha | specs_impl | cobertura | gaps_críticos | gaps_mayores | huérfanos | nota |
|------|-------|------------|-----------|---------------|--------------|-----------|------|
| iter-1 | 2024-01-10 | 8/47 | 17% | 5 | 12 | 0 | Setup inicial, modelos de datos |
| iter-2 | 2024-01-17 | 18/47 | 38% | 3 | 9 | 0 | Lógica contable core |
| iter-3 | 2024-01-24 | 25/47 | 53% | 2 | 8 | 1 | Generación de facturas |
| iter-4 | 2024-02-01 | 27/47 | 57% | 3 | 7 | 3 | CobrosView — regresión en INV-003 |
| iter-5 | 2024-02-08 | 31/47 | 65% | 2 | 6 | 2 | Corrección INV-002, HU parciales |
```

**Regresión**: cuando `gaps_críticos` sube entre iteraciones, el agente debe incluir una nota explicando por qué (nueva spec añadida, refactoring que rompió algo, etc.)

---

## [6] Agent Protocol — Cómo actualizar SPECTRA-TRACE

Este bloque es para el agente. Lo lee al final de cada iteración.

```
PROTOCOLO DE ACTUALIZACIÓN — SPECTRA-TRACE
Ejecutar al final de cada iteración, antes de cerrar la sesión.

PASO 1 — ESCANEAR SPECS
  Para cada spec en layers/03 a 11:
    - Buscar su ID en el código fuente
    - Determinar estado: IMPL / PARCIAL / PENDIENTE
    - Identificar artefactos que la implementan
    - Vincular criterios de aceptación que la validan

PASO 2 — ESCANEAR CÓDIGO
  Para cada artefacto significativo (funciones, componentes, hooks, utils):
    - Buscar qué spec_id lo justifica
    - Si no hay spec_id: marcar como HUÉRFANO
    - Clasificar acción: ESPECIFICAR / ELIMINAR / REFACTORIZAR

PASO 3 — CALCULAR GAPS
  Forward gaps = specs con estado PENDIENTE o PARCIAL
  Reverse gaps = artefactos con estado HUÉRFANO
  Clasificar severidad según tabla de severidad

PASO 4 — ACTUALIZAR ARCHIVO
  Actualizar [1] Coverage Dashboard con nuevas métricas
  Actualizar [2] Forward Matrix con cambios de estado
  Actualizar [3] Reverse Matrix con nuevos artefactos
  Generar nuevo [4] Gap Report para la iteración
  Añadir fila a [5] Iteration Log

PASO 5 — REPORTAR AL HUMANO
  Formato de reporte de fin de iteración:

  "Iteración {N} completada.
   Cobertura: {X}% ({+/-Y}% respecto a iter anterior)
   Gaps críticos: {N} ({+/-M})
   Próxima prioridad recomendada: {GAP-ID} — {descripción}"

REGLAS DEL PROTOCOLO:
  - Nunca marcar IMPL sin artefacto vinculado
  - Nunca marcar IMPL sin criterio de aceptación vinculado
  - Siempre documentar regresiones (gap nuevo que antes era IMPL)
  - Los huérfanos no se eliminan automáticamente — se marcan y se reportan
  - Las specs 🚫 EXCLUIDO no se tocan — son decisiones explícitas de alcance
```

---

## Integración con el resto de Spectra

```
Capa 03 (RN) ──────────────────┐
Capa 04 (INV) ─────────────────┤
Capa 02 (HU) ──────────────────┤──→ SPECTRA-TRACE.Forward Matrix
Capa 06 (POL) ─────────────────┤       ↕ bidireccional
Capa 09 (SK) ──────────────────┘
                                    SPECTRA-TRACE.Reverse Matrix
Código fuente ─────────────────────────────────────────────────→

SPECTRA-TRACE.Gap Report ──→ próxima iteración de OpenSpec/GitHub Spec Kit
```

SPECTRA-TRACE es el puente entre las specs estáticas (capas 00-11) y las herramientas de construcción iterativa (OpenSpec, GitHub Spec Kit). El Gap Report es el input natural para `/opsx:new` o `/specify`.

---

## Diferencia clave con RTM tradicional

| | RTM Tradicional | SPECTRA-TRACE |
|---|---|---|
| **Quién lo actualiza** | Humano (QA/PM) | El agente autónomamente |
| **Cuándo se actualiza** | Cuando alguien recuerda | Al final de cada iteración |
| **Dirección** | Unidireccional (req→test) | Bidireccional (spec↔código) |
| **Gap typing** | No existe | FUNCIONAL vs TÉCNICO |
| **Severidad** | Manual o no existe | Automática por tipo de spec |
| **Historial** | Snapshot | Log de iteraciones |
| **Accionable** | No directamente | Gap Report → siguiente iteración |
| **Formato** | Excel/Word/herramienta SaaS | Markdown en el repo |
