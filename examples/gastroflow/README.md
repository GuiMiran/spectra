# GastroFlow — Spectra Example

> Caso de uso completo. Una app de gestión de restaurante especificada con Spectra y construida 100% por IA agéntica.

## Qué es GastroFlow

SPA de gestión de restaurante sin backend. Dark mode. Todo el estado vive en React context con mock data.

Flujo principal:
```
[/dashboard] Camarero crea pedido
     ↓
[/cobros] Caja cobra la mesa → asigna cliente → genera factura
     ↓
[/accounting] Asientos contables automáticos (doble partida)
[/invoices]   Registro de facturas + exportación WhatsApp/PDF
```

## Stack
React 19 + Vite 8 + Tailwind CSS v4 + react-router-dom v6

## Archivos de specs

| Archivo | Contenido |
|---------|-----------|
| `00-index.md` | Índice y dispatcher para agentes IA |
| `01-setup.md` | Stack, npm, file tree, Tailwind v4 |
| `02-models.md` | Data models, state shape, reducer, hooks |
| `specs.md` | Master reconstruction prompt — spec completa |
| `invariants.md` | Todas las reglas que nunca pueden romperse |
| `skills.json` | Contratos de utilidades (accounting, invoiceGen, taxLogic, UI) |

## Test de reconstrucción

Dale estos archivos a un agente en contexto vacío y pídele que construya GastroFlow desde cero. Debe producir una app idéntica sin que le expliques nada más.

Eso es Spectra funcionando.
