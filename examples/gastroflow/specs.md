# GastroFlow — Master Reconstruction Prompt

> **Purpose**: This document is a complete specification for agentic AI reconstruction.
> Reading this file alone must be sufficient to recreate GastroFlow identically from scratch.

---

## 1. Mission

Restaurant management SPA: order lifecycle, cash collection, invoicing, double-entry accounting — all in a single dark-mode interface. No backend; all state lives in a React context backed by in-memory mock data.

---

## 2. Tech Stack

| Layer       | Choice                                 |
|-------------|----------------------------------------|
| Framework   | React 19 + Vite 8                      |
| Language    | JSX (no TypeScript)                    |
| Styling     | Tailwind CSS v4 via `@tailwindcss/vite`|
| Routing     | react-router-dom v6                    |
| Icons       | lucide-react                           |
| Dates       | date-fns with `es` locale              |
| Charts      | recharts (accounting view)             |
| Utilities   | clsx, tailwind-merge                   |

### Critical setup notes (must follow exactly)

1. **Tailwind v4 is NOT config-file-driven.** Do NOT create `tailwind.config.js`. Tokens go in `src/index.css` under `@theme {}`.
2. **PostCSS plugin removed in v4.** `postcss.config.js` must NOT include `tailwindcss: {}`. Use only `autoprefixer: {}`.
3. **CSS entry point** must begin with `@import "tailwindcss";` (v4 directive), NOT `@tailwind base/components/utilities`.
4. **`@utility` vs `@layer components`**: classes that are referenced by `@apply` in other classes MUST be defined with `@utility className {}`, not inside `@layer components`. `@apply` inside `@layer components` can only reference built-in Tailwind utilities or `@utility`-registered classes.
5. **`@tailwindcss/vite@4.x` peer dep declares `vite ^5||^6||^7`**. If vite@8 is present, run `npm install --legacy-peer-deps`.
6. **Entry point**: `index.html` must reference `/src/main.jsx`, NOT `main.tsx`.
7. **React Fast Refresh (HMR)**: each file must export ONLY React components OR ONLY non-components (hooks, utils). Mixing breaks Fast Refresh. `AppContext.jsx` exports `AppContext` (const) + `AppProvider` (component). `useApp` lives in `src/hooks/useApp.js`.
8. **React Router v7 compat flags** on `<BrowserRouter>`:
   ```jsx
   future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
   ```

---

## 3. File Tree

```
DEMOSTARTUP/
├── index.html
├── package.json
├── postcss.config.js
├── vite.config.ts
├── specs/
│   ├── specs.md          ← this file
│   ├── invariants.md
│   └── skills.json
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

## 4. Routes

| Path          | Component         | Description                                  |
|---------------|-------------------|----------------------------------------------|
| `/`           | redirect          | → `/dashboard`                               |
| `/dashboard`  | `Dashboard`       | Order creation, kitchen status, waiter view  |
| `/cobros`     | `CobrosView`      | Cashier view: collect, assign customer, bill |
| `/accounting` | `AccountingView`  | Journal entries, daily closure               |
| `/invoices`   | `InvoiceList`     | Invoice registry with PDF/WhatsApp export    |

---

## 5. Data Models

### Customer
```js
{
  id: string,          // 'c1', 'c2', ...
  name: string,        // full name
  nif: string,         // tax ID
  email: string,
}
```

### MenuItem (catalog)
```js
{
  id: string,
  name: string,
  price: number,       // EUR, before tax
  category: string,    // 'food' | 'beverage' | 'dessert'
}
```

### OrderItem
```js
{
  id: string,          // menuItem.id
  name: string,
  price: number,       // unit price
  qty: number,
  lineTotal: number,   // price * qty
}
```

### Order
```js
{
  id: string,          // 'ORD-001', ...
  tableNumber: number,
  items: OrderItem[],
  status: 'confirmed' | 'paid' | 'invoiced',
  customerId: string | null,
  createdAt: ISO8601 string,
  // enriched at runtime (not stored):
  // customer: Customer | null   (joined from customers array)
  // subtotal, vat, total        (computed via computeInvoiceFigures)
  // invoice: Invoice | null     (joined from invoices array)
}
```

### Invoice
```js
{
  id: string,
  invoiceNumber: string,   // 'FAC-2024-001'
  orderId: string,
  customerId: string,
  items: OrderItem[],
  subtotal: number,
  vat: number,
  total: number,
  createdAt: ISO8601 string,
  journalEntries: JournalEntry[],
}
```

### JournalEntry
```js
{
  id: string,
  date: string,
  account: string,     // e.g. '430', '700', '477'
  accountName: string,
  debit: number,
  credit: number,
  description: string,
}
```

---

## 6. Global State Shape (AppContext)

```js
{
  // data
  customers: Customer[],
  menuItems: MenuItem[],
  orders: Order[],
  invoices: Invoice[],

  // UI
  notification: { type: 'success' | 'error', message: string } | null,

  // actions (dispatch via useReducer)
  addOrder(order: Order): void,
  updateOrderStatus(orderId, status): void,
  assignCustomer(orderId, customerId): void,
  generateInvoice(orderId): void,    // creates Invoice + JournalEntries, sets status 'invoiced'
  showNotification(type, message): void,
}
```

Reducer actions: `ADD_ORDER`, `UPDATE_ORDER_STATUS`, `ASSIGN_CUSTOMER`, `ADD_INVOICE`, `SET_NOTIFICATION`, `CLEAR_NOTIFICATION`.

---

## 7. Design System (index.css)

### Tokens (`@theme {}`)
```css
--color-surface-900: #0f172a;
--color-surface-800: #1e293b;
--color-surface-700: #334155;
--color-surface-600: #475569;
--color-brand:       #10b981;   /* emerald-500 */
--color-brand-light: #34d399;
--color-brand-dark:  #059669;
--color-danger:      #f43f5e;
--shadow-card:  0 0 0 1px rgba(51,65,85,0.5), 0 4px 24px rgba(0,0,0,0.4);
--shadow-glow:  0 0 16px rgba(16,185,129,0.3);
--shadow-glow-red: 0 0 16px rgba(244,63,94,0.3);
--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, monospace;
```

Tokens defined here auto-generate utility classes: `bg-surface-800`, `text-brand`, `shadow-glow`, etc.

### Custom classes

| Class            | Type              | Usage                                      |
|------------------|-------------------|--------------------------------------------|
| `.card`          | `@layer components` | Dark card surface                        |
| `.stat-card`     | `@layer components` | Stat tile (flex-col, gap-0.25rem)        |
| `.btn-primary`   | `@layer components` | Brand green button                       |
| `.btn-ghost`     | `@layer components` | Transparent button with border           |
| `.badge`         | `@utility`        | Base badge (must be `@utility`, not layer)|
| `.badge-success` | `@layer components` | `@apply badge;` + emerald colors         |
| `.badge-warning` | `@layer components` | `@apply badge;` + amber colors           |
| `.badge-info`    | `@layer components` | `@apply badge;` + blue colors            |
| `.badge-neutral` | `@layer components` | `@apply badge;` + slate colors           |
| `.input`         | `@layer components` | Dark form input                          |
| `.label`         | `@layer components` | Uppercase xs tracking-wide muted text    |
| `.table-row-hover` | `@layer components` | Row hover transition                   |

**Critical**: `.badge` must be defined as `@utility badge { ... }` so that `@apply badge;` inside `@layer components` works in Tailwind v4.

---

## 8. Component Contracts

### Layout
Sidebar (w-64) + `<Outlet />` wrapped in scrollable main. Sticky Header (h-16). Logo: ChefHat icon + "GastroFlow" + "Gestión de Restaurante".

### Sidebar
Two `NAV_GROUPS`:
- **Operaciones**: Pedidos (`/dashboard`), Cobros de Mesa (`/cobros`)
- **Administración**: Contabilidad (`/accounting`), Facturas (`/invoices`)

Active link: `bg-brand/15 text-brand shadow-glow`. Inactive: `text-slate-400 hover:text-white hover:bg-surface-700`.

### Header
- Route title from `ROUTE_TITLES` map keyed by `pathname`
- Notification toast: emerald (success) or rose (error), `animate-pulse`
- Spanish date via `date-fns` format `"EEEE, d 'de' MMMM yyyy"` with `es` locale, `capitalize`
- Bell icon button (decoration only)

### Dashboard (`/dashboard`)
- StatsBar: 4 stat-cards (Activas, En cocina, Completadas, Facturadas)
- OrderList: grid of OrderCards
- "+ Nuevo Pedido" → NewOrderModal
- Click any card → OrderDetail modal (slide-in panel or modal)

### CobrosView (`/cobros`) — **Cashier separation**
Strictly separates payment from order creation. Three sections:
1. **Confirmadas — Pendientes de Cobro** (status=`confirmed`): button "Cobrar Mesa N" → `updateOrderStatus(id, 'paid')`
2. **Cobradas — Pendientes de Factura** (status=`paid`): if no `customerId`, show amber warning "Asigna un cliente para poder facturar (Invariante #2)". Button "Generar Factura" disabled if no customerId.
3. **Facturadas Hoy** (status=`invoiced`): read-only summary grid

Stats row: Por cobrar | Cobradas hoy | Sin cliente | Facturadas

MesaCard border color logic:
- invoiced → `border-slate-700`
- canInvoice && hasCustomer → `border-brand/40`
- needsCustomer → `border-amber-500/40`
- confirmed → `border-blue-500/40`

### OrderDetail
Modal/panel showing full order: items table, subtotal/VAT/total, customer selector (dropdown of customers), "Generar Factura" CTA, and "Enviar por WhatsApp" link.

### AccountingView (`/accounting`)
- Daily summary: total revenue, VAT collected
- JournalEntries table: date, account, accountName, debit, credit
- DailyClosure: bar chart (recharts) + "Cerrar Caja" button

### InvoiceList (`/invoices`)
Table of all invoices: invoiceNumber, customer, date, total. Click row → InvoiceDocument modal with print and WhatsApp share.

---

## 9. Mock Data Seed (mockData.js)

Seed: 3 customers, 6 menu items, 4 orders (mix of statuses), 1 pre-existing invoice.
Orders must cover all statuses: at least 1 `confirmed`, 1 `paid` without customer, 1 `paid` with customer, 1 `invoiced`.

---

## 10. npm scripts

```bash
npm install --legacy-peer-deps   # required for vite@8 + @tailwindcss/vite@4.x peer dep mismatch
npm run dev                      # vite dev server → http://localhost:5173
npm run build                    # vite build (remove tsc -b from build script)
```

---

## 11. Fonts (index.html)

Add Google Fonts preconnect + stylesheet for Inter (400,500,600,700) and JetBrains Mono (400,500).

---

## 12. Order State Machine

```
confirmed ──[Cobrar]──> paid ──[Generar Factura + has customerId]──> invoiced
```

No backwards transitions. `invoiced` is terminal.
