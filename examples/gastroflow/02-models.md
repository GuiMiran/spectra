# GastroFlow — Data Models, State & Hooks

---

## Data Models

### Customer
```js
{
  id: string,        // 'c1', 'c2', 'c3'
  name: string,      // nombre completo
  nif: string,       // NIF/CIF fiscal
  email: string,
}
```

### MenuItem (catálogo de productos)
```js
{
  id: string,        // 'm1', 'm2', ...
  name: string,
  price: number,     // EUR sin IVA
  category: string,  // 'food' | 'beverage' | 'dessert'
}
```

### OrderItem (línea de pedido)
```js
{
  id: string,        // = menuItem.id
  name: string,
  price: number,     // precio unitario
  qty: number,
  lineTotal: number, // price × qty (calculado al crear)
}
```

### Order
```js
{
  id: string,              // 'ORD-001', 'ORD-002', ...
  tableNumber: number,     // número de mesa
  items: OrderItem[],
  status: 'confirmed' | 'paid' | 'invoiced',
  customerId: string | null,
  createdAt: string,       // ISO 8601

  // Campos DERIVADOS — no se almacenan, se calculan al leer:
  // customer: Customer | null    ← join por customerId
  // subtotal: number             ← computeInvoiceFigures(items).subtotal
  // vat: number                  ← computeInvoiceFigures(items).vat
  // total: number                ← computeInvoiceFigures(items).total
  // invoice: Invoice | null      ← join por orderId
}
```

**Estado del pedido — máquina de estados (una dirección)**:
```
confirmed ──[Cobrar]──> paid ──[Generar Factura + customerId]──> invoiced
```
No hay transiciones hacia atrás. `invoiced` es terminal.

### Invoice
```js
{
  id: string,
  invoiceNumber: string,   // 'FAC-2024-001'
  orderId: string,
  customerId: string,
  customerName: string,    // desnormalizado para render sin joins
  customerTaxId: string,   // desnormalizado
  items: OrderItem[],
  subtotal: number,
  vat: number,
  total: number,
  vatRate: 0.21,
  date: string,            // ISO 8601
  status: 'issued',
  journalEntries: JournalEntry[],
}
```

### JournalEntry (asiento contable)
```js
{
  id: string,
  date: string,
  account: string,       // '430' | '700' | '477'
  accountName: string,   // 'Clientes' | 'Ventas' | 'IVA Repercutido'
  debit: number,
  credit: number,
  description: string,
}
```
Cada factura genera exactamente 3 asientos (ver `skills/accounting.md`).

---

## Mock Data Seed (`src/data/mockData.js`)

Exporta `initialState` con:
- **3 customers**: distintos NIFs
- **6 menuItems**: mezcla de comida, bebida alcohólica, bebida sin alcohol
- **4 orders** que cubren todos los estados:
  - 1 × `confirmed` (sin cliente)
  - 1 × `paid` sin `customerId` (necesita cliente → Invariante B-2)
  - 1 × `paid` con `customerId` (lista para facturar)
  - 1 × `invoiced` (ya tiene factura)
- **1 invoice** pre-existente para la orden `invoiced`

---

## Global State (`src/context/AppContext.jsx`)

### Regla HMR crítica
`AppContext.jsx` exporta **solo**:
- `export const AppContext = createContext(null)`
- `export function AppProvider({ children })`

**NO exportar `useApp`** — va en `src/hooks/useApp.js` (fichero separado).

### Shape del estado
```js
{
  customers: Customer[],
  menuItems: MenuItem[],
  orders: Order[],
  invoices: Invoice[],
  notification: { type: 'success' | 'error', message: string } | null,
}
```

### Reducer actions

| Action                | Payload                          | Efecto                                                    |
|-----------------------|----------------------------------|-----------------------------------------------------------|
| `ADD_ORDER`           | `Order`                          | Append to `orders`                                        |
| `UPDATE_ORDER_STATUS` | `{ orderId, status }`            | Actualiza `order.status`                                  |
| `ASSIGN_CUSTOMER`     | `{ orderId, customerId }`        | Actualiza `order.customerId`                              |
| `ADD_INVOICE`         | `Invoice`                        | Append to `invoices` + sets `order.status = 'invoiced'`  |
| `SET_NOTIFICATION`    | `{ type, message }`              | Muestra toast, auto-clear en 3 segundos                   |
| `CLEAR_NOTIFICATION`  | —                                | Pone `notification = null`                                |

### Action callbacks en el contexto
```js
// Expuestos via value={{ ...state, addOrder, updateOrderStatus, ... }}

const addOrder = useCallback((order) => {
  dispatch({ type: 'ADD_ORDER', payload: order })
  showNotification('success', `Mesa ${order.tableNumber} creada`)
}, [])

const generateInvoice = useCallback((orderId) => {
  const order = state.orders.find(o => o.id === orderId)
  const { valid, error } = validateInvoiceable(order)   // Invariante B-2
  if (!valid) { showNotification('error', error); return }

  const figures = computeInvoiceFigures(order.items)    // Invariante B-1
  const invoice = buildInvoice(order, figures, state)   // ver invoiceGen.js
  const entries = generateJournalEntries(invoice)       // Invariante B-5
  invoice.journalEntries = entries

  dispatch({ type: 'ADD_INVOICE', payload: invoice })   // Invariante A-3 (atómico)
  showNotification('success', `Factura ${invoice.invoiceNumber} generada`)
}, [state])

const showNotification = useCallback((type, message) => {
  dispatch({ type: 'SET_NOTIFICATION', payload: { type, message } })
  setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 3000)  // A-4
}, [])
```

---

## Hooks

### `src/hooks/useApp.js`
```js
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
```
**Import correcto en componentes**: `import { useApp } from '../../hooks/useApp'`

### `src/hooks/useOrders.js`
```js
// Retorna enrichedOrders: órdenes con campos derivados calculados
export function useOrders() {
  const { orders, customers, invoices, updateOrderStatus, assignCustomer, generateInvoice } = useApp()

  const enrichedOrders = orders.map(order => {
    const customer = customers.find(c => c.id === order.customerId) ?? null
    const { subtotal, vat, total } = computeInvoiceFigures(order.items)
    const invoice = invoices.find(i => i.orderId === order.id) ?? null
    return { ...order, customer, subtotal, vat, total, invoice }
  })

  const stats = {
    confirmed: enrichedOrders.filter(o => o.status === 'confirmed').length,
    paid:      enrichedOrders.filter(o => o.status === 'paid').length,
    invoiced:  enrichedOrders.filter(o => o.status === 'invoiced').length,
    total:     enrichedOrders.length,
  }

  return { enrichedOrders, stats, updateOrderStatus, assignCustomer, generateInvoice }
}
```

Los campos `customer`, `subtotal`, `vat`, `total`, `invoice` **no se persisten en estado** (Invariante A-2).
