# Módulo horizontal: Contabilidad — dominio contable y enlace con Facturación
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador v0.1. Insumo para el prompt maestro del módulo Contabilidad (se pega junto al contrato del core y el dominio fiscal de Facturación).
> Los puntos marcados con ⚠ deben verificarse contra el BOE, el PGC o la hacienda correspondiente antes de usarse como fuente de verdad.

---

## 0. Alcance y posición en la plataforma

| | |
|---|---|
| **Qué es** | Módulo horizontal con licencia que genera la contabilidad a partir de los hechos del negocio y entrega libros e informes |
| **Depende de** | Core (empresas, terceros, productos, periodos, licencias). Facturación es **opcional**: sin ella, los asientos se hacen a mano |
| **Recibe de** | Facturación (`FacturaEmitida`, `FacturaRectificada`, `FacturaRecibidaRegistrada`, `CobroRegistrado`, `PagoRegistrado`, `LiquidacionPreparada`) |
| **Emite** | `AsientoGenerado`, `PeriodoContableCerrado`, `EjercicioCerrado` |
| **No incluye (fase 1)** | Nóminas, amortizaciones automáticas, cierre del Impuesto sobre Sociedades, estado de flujos de efectivo, memoria, consolidación, Ceuta y Melilla (IPSI) |

**Reparto con Facturación** (para no duplicar):
- **Facturación** es dueña de las facturas, sus registros de facturación y los **libros registro de IVA/IGIC** (emitidas, recibidas, bienes de inversión).
- **Contabilidad** es dueña de los asientos, el plan de cuentas, los **libros contables** (diario, mayor, sumas y saldos, inventarios y cuentas anuales) y los informes.

---

## 1. Marco territorial

| Territorio | Impuesto indirecto | Qué cambia en la contabilidad |
|---|---|---|
| Península y Baleares | IVA | Cuentas 472 y 477 del PGC |
| Canarias | IGIC (Ley 20/1991) | La contabilización del IGIC es un reflejo de la del IVA. El cuadro de cuentas del PGC no es obligatorio, así que se usan subcuentas propias ⚠ (la Resolución del ICAC de 16-12-1992 propone cuentas específicas) |
| País Vasco | IVA foral | Contabilidad mercantil igual (PGC). Cambian los modelos y la facturación: TicketBAI en los tres territorios y Batuz en Bizkaia |
| Navarra | IVA foral | Contabilidad mercantil igual. Régimen de facturación propio ⚠ pendiente de verificar |
| Ceuta y Melilla | IPSI | Fase 2 |

**Regla de oro:** la contabilidad mercantil (PGC, Código de Comercio) es **estatal** y la misma en todos los territorios. Lo que cambia por territorio es el **impuesto indirecto**, los **modelos de declaración** y las **obligaciones de facturación**, no el plan de cuentas.

---

## 2. Plan de cuentas

- **Base:** Plan General de Contabilidad (RD 1514/2007) y su versión para pymes (RD 1515/2007). ❓ DEC-K01: ¿PGC general, PGC pymes o ambos como plantillas?
- **Estructura:** nueve grupos. 1 financiación básica, 2 activo no corriente, 3 existencias, 4 acreedores y deudores comerciales, 5 cuentas financieras, 6 compras y gastos, 7 ventas e ingresos, 8 y 9 gastos e ingresos imputados al patrimonio neto.
- **El cuadro de cuentas no es obligatorio** (solo sus criterios de valoración y registro): cada empresa puede abrir subcuentas.

### Cuentas clave de la fase 1
| Cuenta | Nombre | Uso |
|---|---|---|
| 430 | Clientes | Facturas emitidas pendientes de cobro |
| 400 / 410 | Proveedores / Acreedores por prestaciones de servicios | Facturas recibidas pendientes de pago |
| 570 / 572 | Caja / Bancos | Cobros y pagos |
| 472 | H.P., IVA soportado | IVA deducible de las compras |
| 477 | H.P., IVA repercutido | IVA de las ventas |
| 4700 | H.P., deudor por IVA | Saldo a devolver o compensar |
| 4750 | H.P., acreedora por IVA | Saldo a ingresar |
| 473 | H.P., retenciones y pagos a cuenta | Retenciones **soportadas** por la empresa (cuando le retienen) |
| 4751 | H.P., acreedora por retenciones practicadas | Retenciones **practicadas** por la empresa (cuando retiene a otros) |
| 600–629 | Compras y gastos de explotación | Según naturaleza del gasto |
| 700–705 | Ventas y prestaciones de servicios | Según naturaleza del ingreso |
| 708 / 709 | Devoluciones y rappels sobre ventas | Facturas rectificativas emitidas ⚠ |
| 129 | Resultado del ejercicio | Cierre |
| 550 | Titular de la explotación | Autónomos personas físicas ⚠ |

⚠ Para IGIC: subcuentas de 472 y 477 o cuentas específicas según la resolución del ICAC; decisión DEC-K02.

---

## 3. Entidades del módulo

| ID | Entidad | Contenido clave |
|---|---|---|
| ENT-K01 | **Plan de cuentas** de una empresa | Cuentas y subcuentas, naturaleza (deudora/acreedora), activa/inactiva |
| ENT-K02 | **Ejercicio contable** | Fechas, estado (abierto, en cierre, cerrado), vínculo con el ejercicio del core |
| ENT-K03 | **Asiento** | Número correlativo, fecha, descripción, origen (manual o automático), estado, líneas |
| ENT-K04 | **Apunte** (línea de asiento) | Cuenta, importe en debe o haber, tercero opcional, concepto, documento de origen |
| ENT-K05 | **Plantilla de asiento** | Evento que la dispara, reglas de cuentas, condiciones (territorio, régimen, retención) |
| ENT-K06 | **Extensión contable de producto** | Cuenta de ventas y de compras por producto o servicio (patrón DEC-03 del core: se guarda aparte, enlazada por identificador) |
| ENT-K07 | **Correspondencia fiscal-contable** | Familia fiscal → cuenta de IVA/IGIC soportado o repercutido, por tipo |
| ENT-K08 | **Libro contable** | Tipo (diario, mayor, sumas y saldos, inventarios y cuentas anuales), periodo, estado, fecha de legalización |
| ENT-K09 | **Cierre de periodo** | Periodo, resultado, quién y cuándo, asientos de regularización |

Una **línea de asiento** nunca contiene datos del tercero más allá de su identificador del core.

---

## 4. Libros e informes

### 4.1 Libros contables (obligatorios y de uso práctico)
| Libro | Obligatorio | Contenido | Observaciones |
|---|---|---|---|
| **Diario** | Sí (Código de Comercio) | Todas las operaciones día a día | Se admiten totales por periodos no superiores al trimestre si el detalle consta en otros registros |
| **Inventarios y cuentas anuales** | Sí | Balance inicial, balances de comprobación con sumas y saldos al menos trimestrales, inventario de cierre y cuentas anuales | |
| **Mayor** | No legalmente, sí en la práctica | Movimientos y saldo de cada cuenta | Se deriva del diario |
| **Balance de sumas y saldos** | Parte del libro de inventarios | Sumas del debe y haber y saldo por cuenta | |

**Legalización:** presentación en el Registro Mercantil del domicilio, antes de los **cuatro meses siguientes al cierre del ejercicio** (art. 27 del Código de Comercio). La forma electrónica de presentación y los libros de actas y de socios no están cubiertos en esta spec ⚠.
**Conservación:** seis años desde el último asiento ⚠ (art. 30 del Código de Comercio, a confirmar).

### 4.2 Informes de la fase 1
| Informe | Descripción |
|---|---|
| Balance de situación | Activo, pasivo y patrimonio neto a una fecha |
| Cuenta de pérdidas y ganancias | Ingresos y gastos de un periodo |
| Balance de sumas y saldos | Control de cuadre |
| Mayor por cuenta | Detalle con saldo acumulado |
| Extracto de tercero | Facturas, cobros o pagos y saldo de un cliente o proveedor |
| Antigüedad de saldos | Pendiente de cobro y de pago por tramos de vencimiento |
| Conciliación Facturación ↔ Contabilidad | Cuadre de IVA/IGIC repercutido y soportado contra los libros registro |

Las **cuentas anuales completas** (balance, PyG, estado de cambios en el patrimonio neto, estado de flujos de efectivo y memoria; art. 34 del Código de Comercio) quedan para la fase 2, salvo balance y PyG.

---

## 5. Reglas de negocio

| ID | Regla | Fuente |
|---|---|---|
| RN-K01 | Todo asiento cuadra: suma del debe igual a la suma del haber | Partida doble, Código de Comercio |
| RN-K02 | Los asientos se numeran de forma correlativa por ejercicio | Práctica contable |
| RN-K03 | Un asiento no se modifica una vez contabilizado: se corrige con un asiento de ajuste o de anulación | Principio de inalterabilidad |
| RN-K04 | La fecha de un asiento pertenece a un ejercicio abierto | Cierre contable |
| RN-K05 | Las facturas se contabilizan en la fecha de devengo del impuesto o de la operación, según el criterio fijado por la empresa ❓ DEC-K03 | PGC, IVA |
| RN-K06 | El IVA soportado no deducible se suma al gasto o a la inversión | PGC, Ley del IVA |
| RN-K07 | Las retenciones practicadas a terceros se abonan en 4751; las soportadas se cargan en 473 | PGC |
| RN-K08 | El saldo de la liquidación periódica se contabiliza contra 4750 (a ingresar) o 4700 (a devolver o compensar) | PGC |
| RN-K09 | Las rectificativas generan el asiento inverso del original por la diferencia o por el total, según el tipo | Reglamento de facturación |
| RN-K10 | El IGIC se contabiliza igual que el IVA, con sus propias subcuentas | Ley 20/1991 y resolución del ICAC ⚠ |
| RN-K11 | La contabilidad mercantil no cambia por territorio; cambian los modelos y la facturación | Código de Comercio |
| RN-K12 | Los libros se legalizan antes de los cuatro meses siguientes al cierre | Art. 27 del Código de Comercio |

---

## 6. Plantillas de asiento (Facturación → Contabilidad)

Cuentas orientativas; el detalle de subcuentas depende de DEC-K01 y DEC-K02.

### PLA-K01 — FacturaEmitida (con IVA y retención)
Ejemplo: servicios por 1.000 €, IVA 21 %, retención IRPF 15 %.

| Cuenta | Debe | Haber |
|---|---|---|
| 430 Clientes | 1.060 | |
| 473 H.P., retenciones y pagos a cuenta | 150 | |
| 477 H.P., IVA repercutido (21 %) | | 210 |
| 705 Prestación de servicios | | 1.000 |

Cuadra: debe 1.210, haber 1.210. El cliente debe 1.060 (1.000 + 210 − 150).
⚠ Un ejemplo de una fuente consultada colocaba esta retención en 4751. Según el PGC, 473 es la cuenta de retenciones que **sufre** quien factura.
Con recargo de equivalencia, la cuota del recargo se abona en una subcuenta propia de 477. Con IGIC, se usa su subcuenta en lugar de la del IVA.

### PLA-K02 — FacturaRecibidaRegistrada
Ejemplo: suministro de 300 € con IVA 21 % (63 €), totalmente deducible.

| Cuenta | Debe | Haber |
|---|---|---|
| 628 Suministros | 300 | |
| 472 H.P., IVA soportado (21 %) | 63 | |
| 410 Acreedores por prestaciones de servicios | | 363 |

Si la cuota es parcialmente deducible, la parte no deducible se suma al gasto. Con retención practicada (profesional o alquiler), se abona 4751 y el proveedor se reduce en esa cuantía.

### PLA-K03 — Inversión del sujeto pasivo
Se cargan gasto e IVA soportado y se abonan IVA repercutido y proveedor solo por la base. La operación no mueve efectivo por el impuesto.

### PLA-K04 — CobroRegistrado / PagoRegistrado
- Cobro: debe 572 (o 570), haber 430.
- Pago: debe 400 o 410, haber 572 (o 570).

### PLA-K05 — FacturaRectificada
Asiento inverso del original por la diferencia (rectificativa por diferencias) o anulación y nuevo asiento (por sustitución). Ventas: 708 y 477 en el debe. ⚠ Verificar el tratamiento de cada tipo R1–R5.

### PLA-K06 — LiquidacionPreparada (303 / 420)
Se cancelan 477 y 472 del periodo y la diferencia va a 4750 (a ingresar) o 4700 (a devolver o compensar). El pago posterior: debe 4750, haber 572. El IGIC usa sus subcuentas y su modelo (420) ⚠.

### PLA-K07 — Retenciones (modelo 111 y 115)
Presentación y pago: debe 4751, haber 572.

### PLA-K08 — Cierre del ejercicio (fase 1 mínima)
Regularización de los grupos 6 y 7 contra 129. El Impuesto sobre Sociedades y los ajustes fiscales quedan para la fase 2.

### Autónomos personas físicas
Los pagos a cuenta del IRPF (modelo 130) y el reparto de resultados se tratan contra 550 Titular de la explotación, no como Impuesto sobre Sociedades ⚠.

---

## 7. Contrato con Facturación

### 7.1 Qué debe traer cada evento de Facturación
Solo identificadores y los datos económicos necesarios, nunca copias de la entidad:

| Evento | Datos mínimos |
|---|---|
| `FacturaEmitida` | Factura, empresa, fecha de devengo, tercero, por cada línea: familia fiscal, base, tipo y cuota; recargo, retención, total, vencimientos, origen de la operación |
| `FacturaRecibidaRegistrada` | Lo anterior, más cuota deducible y causa de no deducibilidad |
| `FacturaRectificada` | Factura original, tipo (R1–R5), importes rectificados |
| `CobroRegistrado` / `PagoRegistrado` | Factura, importe, fecha, medio |
| `LiquidacionPreparada` | Modelo, periodo, totales repercutido y soportado, resultado |

### 7.2 Comportamiento
- **Idempotencia:** un mismo evento nunca genera dos asientos. El asiento guarda el identificador del evento de origen.
- **Sin licencia de Contabilidad:** el evento espera en cola 90 días (DEC-01 del core). Al activarla se ofrece procesar los pendientes.
- **Periodo cerrado:** si la fecha cae en un ejercicio cerrado, el asiento no se crea. Se genera una incidencia para decidir si reabrir o imputar al ejercicio abierto.
- **Cuenta no configurada:** si un producto no tiene extensión contable, se usa la cuenta por defecto de su familia y se avisa.
- **Correcciones:** nunca se edita el asiento; se contabiliza el inverso.
- **Resultado:** Contabilidad emite `AsientoGenerado` con el identificador del evento de origen. Facturación puede mostrar "contabilizada".

### 7.3 Conciliación
Para cada periodo, el saldo de 477 (por tipo) debe coincidir con la suma de cuotas del libro registro de emitidas, y el de 472 con el de recibidas. Una diferencia es una incidencia.

---

## 8. Invariantes

- **INV-K01:** todo asiento tiene la suma del debe igual a la del haber.
- **INV-K02:** el balance de sumas y saldos de cualquier fecha tiene total del debe igual al del haber.
- **INV-K03:** un asiento contabilizado no cambia; solo se anula o ajusta con otro asiento.
- **INV-K04:** la numeración de asientos es correlativa y sin saltos dentro del ejercicio.
- **INV-K05:** un asiento solo usa cuentas activas del plan de su empresa.
- **INV-K06:** la fecha de un asiento pertenece a un ejercicio abierto.
- **INV-K07:** un evento de origen produce como máximo un asiento automático.
- **INV-K08:** el saldo de 430 es igual a la suma de facturas emitidas pendientes de cobro.
- **INV-K09:** por periodo cerrado, el saldo de 477 y 472 coincide con los libros registro de Facturación.
- **INV-K10:** un periodo cerrado no admite asientos nuevos con fecha dentro de él.
- **INV-K11:** las líneas de un asiento referencian terceros solo por su identificador del core.

---

## 9. Decisiones abiertas ❓
- **DEC-K01:** ¿PGC general, PGC pymes o ambos como plantillas?
- **DEC-K02:** estructura de subcuentas por impuesto y tipo (IVA, IGIC, recargo) y qué cuentas usar para IGIC.
- **DEC-K03:** momento de contabilización: al devengo, al emitir o al cobrar (criterio de caja).
- **DEC-K04:** tickets de TPV: asiento resumen diario o uno por ticket.
- **DEC-K05:** autónomos personas físicas: contabilidad completa con 550 o libros registro simplificados.
- **DEC-K06:** alcance de la fase 2: cuentas anuales completas, amortizaciones, Impuesto sobre Sociedades.

## 10. Puntos ⚠ por verificar
1. Subcuentas y cuentas específicas del IGIC (Resolución del ICAC de 16-12-1992).
2. Tratamiento contable de cada tipo de rectificativa R1–R5.
3. Plazo de conservación de libros y forma de legalización electrónica.
4. Autónomos personas físicas: 550 frente a contabilidad simplificada.
5. Navarra: régimen de facturación y obligaciones frente a TicketBAI.
6. TicketBAI y Batuz: fechas exactas por territorio, confirmadas en las haciendas forales.
7. Tratamiento de retenciones en el modelo 115 y de pagos fraccionados.

## 11. Fuentes consultadas
- AEAT: Obligaciones contables y registrales, libros obligatorios (art. 27 y 34 del Código de Comercio).
- Revista de Contabilidad y Tributación (CEF): La contabilidad del IGIC (resumen del artículo).
- Guía Fiscal: TicketBAI y Batuz por territorio, 2026 (fuente secundaria).
- Ejemplos de asientos de facturas emitidas y recibidas de proveedores de software contable (fuente secundaria, corregida en PLA-K01).
