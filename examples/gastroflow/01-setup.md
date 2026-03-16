# GastroFlow — Setup: Stack, File Tree & Tailwind v4

---

## Tech Stack

| Layer       | Choice                                  | Version  |
|-------------|-----------------------------------------|----------|
| Framework   | React                                   | 19.x     |
| Build tool  | Vite                                    | 8.x      |
| Language    | JSX (no TypeScript en app code)         | —        |
| Styling     | Tailwind CSS via `@tailwindcss/vite`    | 4.x      |
| Routing     | react-router-dom                        | 6.x      |
| Icons       | lucide-react                            | latest   |
| Dates       | date-fns + locale `es`                  | 3.x      |
| Charts      | recharts                                | 3.x      |
| Utilities   | clsx, tailwind-merge                    | latest   |

---

## npm Install

```bash
# SIEMPRE usar --legacy-peer-deps
# Motivo: @tailwindcss/vite@4.x declara peerDep "vite ^5||^6||^7"
# pero el proyecto usa vite@8.x → conflicto de peer deps
npm install --legacy-peer-deps

npm run dev     # → http://localhost:5173
npm run build   # vite build (sin tsc -b)
```

**package.json build script** — eliminar `tsc -b`:
```json
"scripts": {
  "dev":   "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

---

## File Tree (completo)

```
DEMOSTARTUP/
├── index.html                ← apunta a /src/main.jsx (NO main.tsx)
├── package.json
├── postcss.config.js         ← SOLO autoprefixer (ver sección CSS)
├── vite.config.ts            ← usa @tailwindcss/vite plugin
├── specs/
│   ├── 00-index.md
│   ├── 01-setup.md           ← ESTE FICHERO
│   ├── 02-models.md
│   ├── 03-components.md
│   ├── invariants.md
│   └── skills/
│       ├── accounting.md
│       ├── invoice-gen.md
│       ├── tax-logic.md
│       └── ui-system.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── context/
    │   └── AppContext.jsx
    ├── hooks/
    │   ├── useApp.js
    │   └── useOrders.js
    ├── data/
    │   └── mockData.js
    ├── utils/
    │   ├── accounting.js
    │   ├── invoiceGen.js
    │   └── taxLogic.js
    └── components/
        ├── layout/
        │   ├── Layout.jsx
        │   ├── Sidebar.jsx
        │   └── Header.jsx
        ├── dashboard/
        │   ├── Dashboard.jsx
        │   ├── OrderList.jsx
        │   ├── OrderCard.jsx
        │   └── StatsBar.jsx
        ├── orders/
        │   ├── OrderDetail.jsx
        │   └── NewOrderModal.jsx
        ├── cobros/
        │   └── CobrosView.jsx
        ├── accounting/
        │   ├── AccountingView.jsx
        │   ├── JournalEntries.jsx
        │   └── DailyClosure.jsx
        └── invoices/
            ├── InvoiceList.jsx
            └── InvoiceDocument.jsx
```

---

## Configuración de ficheros raíz

### `vite.config.ts`
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### `postcss.config.js`
```js
// En Tailwind v4, el plugin PostCSS desaparece.
// El procesado lo hace @tailwindcss/vite directamente.
export default {
  plugins: {
    autoprefixer: {},
  },
}
```
**NO incluir `tailwindcss: {}`** — provocaría `Cannot find module 'tailwindcss'`.

### `index.html`
```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GastroFlow</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## CSS Architecture (Tailwind v4)

### `src/index.css` — estructura obligatoria

```css
/* 1. Import Tailwind v4 (NO @tailwind base/components/utilities) */
@import "tailwindcss";

/* 2. Design tokens → auto-generan clases utilitarias */
@theme {
  --color-surface-900: #0f172a;
  --color-surface-800: #1e293b;
  --color-surface-700: #334155;
  --color-surface-600: #475569;
  --color-brand:       #10b981;
  --color-brand-light: #34d399;
  --color-brand-dark:  #059669;
  --color-danger:      #f43f5e;

  --shadow-card:    0 0 0 1px rgba(51,65,85,0.5), 0 4px 24px rgba(0,0,0,0.4);
  --shadow-glow:    0 0 16px rgba(16,185,129,0.3);
  --shadow-glow-red: 0 0 16px rgba(244,63,94,0.3);

  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}

/* 3. Base styles */
@layer base {
  html { color-scheme: dark; background-color: #0f172a; }
  body { font-family: var(--font-sans); color: #f8fafc; }
  * { box-sizing: border-box; }
}

/* 4. @utility — clases que necesitan ser @apply-adas por otras clases */
/* REGLA CRÍTICA: si una clase es referenciada por @apply en @layer components,
   DEBE estar aquí como @utility, NO en @layer components */
@utility badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding-inline: 0.625rem;
  padding-block: 0.125rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  border-width: 1px;
  border-style: solid;
}

/* 5. Componentes custom */
@layer components {
  .card { ... }
  .stat-card { ... }
  .btn-primary { ... }
  .btn-ghost { ... }
  .badge-success { @apply badge; background: rgba(16,185,129,0.15); color: #34d399; border-color: rgba(16,185,129,0.3); }
  .badge-warning { @apply badge; background: rgba(245,158,11,0.15); color: #fbbf24; border-color: rgba(245,158,11,0.3); }
  .badge-info    { @apply badge; background: rgba(59,130,246,0.15);  color: #60a5fa; border-color: rgba(59,130,246,0.3); }
  .badge-neutral { @apply badge; background: rgba(100,116,139,0.15); color: #94a3b8; border-color: rgba(100,116,139,0.3); }
  .input  { ... }
  .label  { ... }
}
```

### Por qué `@utility badge` y no `@layer components`

En Tailwind v4, `@apply` dentro de `@layer components` **solo puede referenciar**:
- Utilidades integradas de Tailwind (`flex`, `items-center`, etc.)
- Clases definidas con `@utility`

Si `.badge` estuviera en `@layer components`, el `@apply badge` en `.badge-success` fallaría con:
> `Cannot apply unknown utility class 'badge'`

---

## React Fast Refresh — Regla HMR

Cada fichero debe exportar **solo un tipo**:

| Fichero             | Exporta               | Correcto |
|---------------------|-----------------------|----------|
| `AppContext.jsx`    | `AppContext` + `AppProvider` | ✓ (ambos son "context/component scope") |
| `useApp.js`         | solo `useApp` hook    | ✓        |
| `useOrders.js`      | solo `useOrders` hook | ✓        |

Si un fichero exporta tanto un componente React como un hook, HMR rompe con:
> `"useApp" export is incompatible with React Fast Refresh`

**Solución**: separar hooks en ficheros propios bajo `src/hooks/`.

---

## React Router — Flags v7

```jsx
<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
```
Sin estos flags, la consola del navegador muestra warnings de deprecación.
