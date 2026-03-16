# GastroFlow — Invariants & Constraints

> **Purpose**: All rules that must hold at every point in time. An AI agent reconstructing
> this project MUST enforce every invariant listed here — both business rules and technical ones.

---

## BUSINESS INVARIANTS

### B-1 · Financial Balance (Arithmetic Integrity)
```
invoice.total = invoice.subtotal + invoice.vat
invoice.subtotal = Σ (item.price × item.qty)  for all items
invoice.vat = invoice.subtotal × 0.21
```
- **Never** store a pre-rounded total. Compute it every time from items.
- **Never** subtract from a stored total to derive subtotal.
- Implementation: `computeInvoiceFigures(items)` in `src/utils/accounting.js` is the single source of truth.
- `VAT_RATE = 0.21` is defined once in `accounting.js` and imported everywhere else.

### B-2 · Customer Required Before Invoicing
```
order.status === 'invoiced'  →  order.customerId !== null
```
- A `generateInvoice()` call with no `customerId` must be rejected (show error notification, do NOT mutate state).
- In `CobrosView`, the "Generar Factura" button is `disabled` when `!order.customerId`.
- An amber warning badge "Asigna un cliente para poder facturar (Invariante #2)" is displayed beneath the card.
- `validateInvoiceable(order)` in `accounting.js` enforces this and returns `{ valid: false, error: '...' }`.

### B-3 · UI Status Color Coding
```
Success / completed state  →  Emerald green  (#10b981 / emerald-400/500)
Error / warning state      →  Rose / red     (#f43f5e / rose-400/500)
Pending / info state       →  Blue           (blue-400/500)
Needs attention            →  Amber          (amber-400/500)
Invoiced / neutral         →  Slate / violet (slate-400, violet-400)
```
- These colors are enforced through the badge system: `.badge-success`, `.badge-warning`, `.badge-info`, `.badge-neutral`.
- Never use green for errors. Never use red for success. No exceptions.

### B-4 · Order State Machine (One-Way Flow)
```
confirmed → paid → invoiced
```
- Transitions are strictly forward. No backwards transitions.
- `invoiced` is a terminal state. A facturada order is immutable.
- `confirmed` orders can only be moved to `paid` (Cobrar action).
- `paid` orders can only be moved to `invoiced` (Generar Factura action, requires B-2).

### B-5 · Double-Entry Accounting Completeness
Every invoice generates exactly 3 journal entries (balanced):
```
DR 430 Clientes          total        —
CR 700 Ventas            —            subtotal
CR 477 IVA Repercutido   —            vat
```
- `DR debits == CR credits`: `total === subtotal + vat` (guaranteed by B-1).
- Journal entries are generated inside `generateInvoice()` and stored on `invoice.journalEntries`.

---

## TECHNICAL INVARIANTS

### T-1 · Tailwind v4 CSS Architecture

**MUST**:
- `src/index.css` starts with `@import "tailwindcss";`
- Design tokens in `@theme {}` block
- `postcss.config.js` contains ONLY `autoprefixer: {}` (no `tailwindcss: {}`)
- `vite.config.ts` uses `import tailwindcss from '@tailwindcss/vite'` as Vite plugin
- No `tailwind.config.js` file

**MUST NOT**:
- Use `@tailwind base;` / `@tailwind components;` / `@tailwind utilities;`
- Define `tailwindcss: {}` in postcss plugins (causes "Cannot find module 'tailwindcss'" error)
- Put cross-referenced custom classes inside `@layer components` (they cannot be `@apply`-ed)

### T-2 · `@utility` Rule for Composable Custom Classes
Any class that is referenced via `@apply` inside another class in `@layer components`
MUST be defined with `@utility className { ... }`, NOT `@layer components`.

```css
/* CORRECT — badge can be @apply-ed */
@utility badge {
  display: inline-flex;
  align-items: center;
  /* ... */
}
@layer components {
  .badge-success { @apply badge; background: ...; color: ...; }
}

/* WRONG — causes "Cannot apply unknown utility class 'badge'" error */
@layer components {
  .badge { display: inline-flex; }
  .badge-success { @apply badge; } /* ERROR */
}
```

### T-3 · React Fast Refresh (HMR) File Rule
Each file must export ONLY one category:
- **Component files**: export only React components (functions returning JSX)
- **Hook/util files**: export only hooks, functions, constants

**Mixing breaks Fast Refresh** with error: `"X" export is incompatible with React Fast Refresh`.

Applied to:
- `src/context/AppContext.jsx` → exports `AppContext` (const) + `AppProvider` (component). No hooks.
- `src/hooks/useApp.js` → exports ONLY `useApp` hook. Imports `AppContext` from context file.
- `src/hooks/useOrders.js` → exports ONLY `useOrders` hook.

### T-4 · Import Paths for `useApp`
All components that need app state MUST import from `../../hooks/useApp` (or `../hooks/useApp`).
Never import `useApp` directly from `context/AppContext` — that file no longer exports it.

```js
// CORRECT
import { useApp } from '../../hooks/useApp'

// WRONG (useApp no longer exported from AppContext)
import { useApp } from '../../context/AppContext'
```

### T-5 · Peer Dependency Resolution
`@tailwindcss/vite@4.x` declares peerDependencies `"vite": "^5.2.0 || ^6 || ^7"`.
If project uses `vite@8.x`, always run:
```bash
npm install --legacy-peer-deps
```
Do NOT downgrade Vite. `--legacy-peer-deps` is the correct resolution.

### T-6 · Entry Point File
`index.html` script tag MUST point to `main.jsx`:
```html
<script type="module" src="/src/main.jsx"></script>
```
If the Vite scaffold generated `main.tsx`, rename it to `main.jsx` and update the HTML.

### T-7 · React Router v7 Compatibility Flags
`<BrowserRouter>` must include future flags to suppress deprecation warnings:
```jsx
<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
```

### T-8 · No TypeScript
The project uses `.jsx` files throughout. `vite.config.ts` may remain as TypeScript (Vite scaffold default), but all application code is `.jsx`. The `tsc -b` command must be removed from the `build` npm script to prevent TypeScript compilation errors.

```json
// package.json — CORRECT
"build": "vite build"

// WRONG
"build": "tsc -b && vite build"
```

### T-9 · Currency Formatting
All monetary values must use `formatCurrency(value)` from `src/utils/accounting.js`:
```js
new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)
```
Never inline currency formatting in components.

### T-10 · State Mutation Rule
Global state is managed via `useReducer` in `AppContext`. Components must NEVER mutate
state objects directly. All changes go through the action functions exposed by `AppContext`
(`addOrder`, `updateOrderStatus`, `assignCustomer`, `generateInvoice`, `showNotification`).

---

## ARCHITECTURAL INVARIANTS

### A-1 · Cashier / Waiter Separation
`/dashboard` is the waiter/kitchen view: create orders, track items.
`/cobros` is the cashier view: collect payment, assign customers, generate invoices.
These responsibilities must NOT bleed into each other.

### A-2 · Enriched Orders are Derived, Not Stored
`enrichedOrders` (from `useOrders`) is computed at read time by joining:
- `order.customer` ← customers array lookup by `customerId`
- `order.subtotal`, `order.vat`, `order.total` ← from `computeInvoiceFigures(order.items)`
- `order.invoice` ← invoices array lookup by `orderId`

Never persist these derived fields in state.

### A-3 · Invoice Generation is Atomic
`generateInvoice(orderId)` dispatches a SINGLE `ADD_INVOICE` action that:
1. Creates the `Invoice` object (with journal entries embedded)
2. Updates `order.status` to `'invoiced'`
Both must happen in the same reducer dispatch (same state transition).

### A-4 · Notification Auto-Clear
After `showNotification()`, a 3-second timeout auto-dispatches `CLEAR_NOTIFICATION`.
This is implemented with `setTimeout` inside the `showNotification` callback in `AppContext`.

---

## ENFORCEMENT CHECKLIST

Before considering GastroFlow complete, verify:
- [ ] B-1: `computeInvoiceFigures` used for all totals, no manual rounding
- [ ] B-2: Invoice blocked without customer — button disabled + amber warning visible
- [ ] B-3: Only emerald for success, rose/red for errors in all badges and notifications
- [ ] B-4: No UI allows backwards status transitions
- [ ] B-5: Every invoice has exactly 3 journal entries summing to zero (DR = CR)
- [ ] T-1: No tailwind.config.js, `@import "tailwindcss"` in CSS, no tailwindcss in postcss
- [ ] T-2: `.badge` defined as `@utility`, not `@layer components`
- [ ] T-3: AppContext.jsx has NO useApp export; useApp.js has NO components
- [ ] T-4: All imports of useApp point to `hooks/useApp`
- [ ] T-7: BrowserRouter has v7 future flags
- [ ] T-8: No `tsc -b` in build script, all app files are `.jsx`
