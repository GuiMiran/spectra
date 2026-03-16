# GastroFlow — Specs Index (Agent Dispatcher)

> **Para agentes IA**: Lee este fichero primero. Te indica exactamente qué documentos
> cargar según tu tarea. No cargues todo — carga solo lo que necesitas.

---

## Tareas y documentos requeridos

| Tarea del agente                                 | Lee estos ficheros                                           |
|--------------------------------------------------|--------------------------------------------------------------|
| Reconstruir la app desde cero                    | `01-setup.md` + `02-models.md` + `03-components.md` + `invariants.md` |
| Solo configurar el proyecto (stack, npm, CSS)    | `01-setup.md` + `invariants.md` (sección T-1 a T-8)         |
| Implementar modelos de datos y estado global     | `02-models.md` + `invariants.md` (sección A-1 a A-4)        |
| Implementar UI / componentes visuales            | `03-components.md` + `invariants.md` (sección B-3)          |
| Implementar lógica contable / facturas           | `skills/accounting.md` + `skills/invoice-gen.md` + `invariants.md` (B-1, B-5) |
| Implementar clasificación fiscal                 | `skills/tax-logic.md`                                        |
| Implementar sistema de diseño (CSS, tokens)      | `03-components.md` (sección Design System) + `invariants.md` (T-1, T-2) |
| Depurar errores de HMR / Fast Refresh            | `invariants.md` (T-3, T-4)                                  |
| Depurar errores de Tailwind v4                   | `invariants.md` (T-1, T-2) + `01-setup.md` (sección CSS)   |
| Verificar que la app está completa               | `invariants.md` (Enforcement Checklist al final)             |

---

## Estructura de ficheros

```
specs/
  00-index.md          ← ESTE FICHERO — leer siempre primero
  01-setup.md          ← Tech stack, npm, file tree, Tailwind v4, pitfalls
  02-models.md         ← Data models, state shape, reducer, hooks
  03-components.md     ← Routes, component contracts, design system
  invariants.md        ← Todas las reglas que nunca pueden romperse
  skills/
    accounting.md      ← AccountingAgent: cálculos, asientos, cierre
    invoice-gen.md     ← InvoiceGen: numeración, WhatsApp, impresión
    tax-logic.md       ← TaxLogic: clasificación fiscal por item
    ui-system.md       ← Design tokens, badge system, iconos
```

---

## Resumen del proyecto

**GastroFlow** — SPA de gestión de restaurante. Sin backend. Dark mode.

Flujo principal:
```
[/dashboard] Camarero crea pedido
     ↓
[/cobros] Caja cobra la mesa → asigna cliente → genera factura
     ↓
[/accounting] Asientos contables automáticos + cierre de caja
[/invoices]   Registro de facturas + exportación WhatsApp/PDF
```

Stack: React 19 + Vite 8 + Tailwind CSS v4 + react-router-dom v6
