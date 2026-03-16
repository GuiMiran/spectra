# GastroFlow — Spectra Example

> Complete real-world case. A restaurant management app specified with Spectra and built 100% by an AI agent.

## What is GastroFlow

A backend-free restaurant management SPA. Dark mode. All state lives in React context with mock data.

Main flow:
```
[/dashboard] Waiter creates order
     ↓
[/cobros] Cashier collects payment → assigns customer → generates invoice
     ↓
[/accounting] Automatic journal entries (double-entry bookkeeping)
[/invoices]   Invoice registry + WhatsApp/PDF export
```

## Stack
React 19 + Vite 8 + Tailwind CSS v4 + react-router-dom v6

## Spec files

| File | Contents |
|------|----------|
| `00-index.md` | Index and dispatcher for AI agents |
| `01-setup.md` | Stack, npm, file tree, Tailwind v4 setup |
| `02-models.md` | Data models, state shape, reducer, hooks |
| `specs.md` | Master reconstruction prompt — complete spec |
| `invariants.md` | All rules that can never be broken |
| `skills.json` | Utility contracts (accounting, invoiceGen, taxLogic, UI) |

## The reconstruction test

Give these files to an agent in an empty context and ask it to build GastroFlow from scratch. It should produce an identical app without any additional explanation from you.

That's Spectra working.
