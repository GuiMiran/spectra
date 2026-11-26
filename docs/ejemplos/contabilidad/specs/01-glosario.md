# 01-glosario — Módulo Contabilidad
> Generado con SPECTRA · github.com/GuiMiran/spectra

Lenguaje canónico: toda la spec usa estos términos.

| Término | Definición | Ejemplo | Evitar |
|---|---|---|---|
| **Asiento** | Registro contable fechado y numerado que agrupa apuntes cuya suma del debe es igual a la del haber | Asiento 154: factura emitida F-2026-0012 | Apunte (confunde la parte con el todo) |
| **Apunte** | Línea de un asiento: una cuenta, un importe y su sentido (debe o haber) | 430 Clientes, debe 1.060 | Línea, movimiento |
| **Debe** | Lado izquierdo de un apunte. Aumenta cuentas de activo y gasto; disminuye pasivo e ingreso | Cliente que nos debe | Cargo, deudor (como sustantivo) |
| **Haber** | Lado derecho de un apunte. Aumenta pasivo e ingreso; disminuye activo y gasto | Ingreso por ventas | Abono |
| **Cuenta** | Elemento del plan de cuentas identificado por un código numérico | 430 Clientes | Código contable |
| **Subcuenta** | Cuenta de un nivel inferior que desarrolla otra | 4770021 IVA repercutido 21 % | Cuenta auxiliar |
| **Plan de cuentas** | Conjunto de cuentas y subcuentas que una empresa usa | PGC de pymes con sus subcuentas | Catálogo de cuentas |
| **Ejercicio** | Periodo contable de la empresa, normalmente el año natural | Del 1 de enero al 31 de diciembre de 2026 | Año fiscal (no siempre coincide) |
| **Periodo contable** | Subdivisión de un ejercicio que se puede cerrar | Tercer trimestre de 2026 | Mes (puede ser trimestre) |
| **Libro diario** | Libro obligatorio con todas las operaciones por fecha | Asientos del 1 al 340 | Registro |
| **Libro mayor** | Movimientos y saldo de cada cuenta | Mayor de 430 | Ficha de cuenta |
| **Balance de sumas y saldos** | Listado de cuentas con suma del debe, del haber y saldo | Al 30 de septiembre | Balance de comprobación (sinónimo admitido en la normativa) |
| **Balance de situación** | Activo, pasivo y patrimonio neto a una fecha | A 31 de diciembre | Balance general |
| **Cuenta de pérdidas y ganancias** | Ingresos menos gastos de un periodo | Resultado del ejercicio | Cuenta de resultados |
| **Devengo** | Momento en que se reconoce una operación, con independencia del cobro o pago | Fecha de la factura | Fecha de pago |
| **IVA repercutido** | Impuesto que la empresa cobra a sus clientes. Cuenta 477 | 210 € sobre 1.000 € | IVA de ventas |
| **IVA soportado** | Impuesto que la empresa paga a sus proveedores. Cuenta 472 | 63 € sobre 300 € | IVA de compras |
| **IGIC** | Impuesto General Indirecto Canario, que sustituye al IVA en Canarias | 7 % de 100 € = 7 € | IVA canario |
| **Retención soportada** | IRPF que un cliente retiene a la empresa al pagarle. Cuenta 473 | 150 € sobre 1.000 € | Retención sufrida |
| **Retención practicada** | IRPF que la empresa retiene a un proveedor profesional. Cuenta 4751 | 15 % de la factura de un abogado | Retención aplicada |
| **Cuota deducible** | Parte del IVA o IGIC soportado que se puede restar del repercutido | 63 € de 63 € | IVA recuperable |
| **Plantilla de asiento** | Regla que dice qué cuentas y signos usa un asiento automático según el evento y el contexto | PLA-K01 | Modelo de asiento |
| **Asiento automático** | Asiento generado por el sistema a partir de un evento de otro módulo | De `FacturaEmitida` | Asiento importado |
| **Asiento manual** | Asiento creado por una persona | Ajuste de una cuota | Asiento libre |
| **Asiento de anulación** | Asiento con los mismos apuntes en sentido inverso que deja sin efecto a otro | Anula el asiento 154 | Borrado |
| **Regularización** | Traspaso de los saldos de gastos e ingresos a la cuenta de resultados al cerrar | Cierre del ejercicio | Cierre (a secas) |
| **Conciliación** | Comparación entre lo contabilizado y los libros registro de Facturación | 477 igual a cuotas emitidas | Cuadre |
| **Familia fiscal** | Agrupación de impuesto, tipo, calificación y régimen. Se define en el core | IVA general 21 % | Tipo de IVA |
| **Legalización** | Presentación de los libros en el Registro Mercantil | Dentro de los cuatro meses tras el cierre | Sellado |

## Factura Lite
**Registro de factura** — Apunte contable de una factura emitida o recibida que se teclea o importa en Contabilidad. Lleva tercero, fecha, número, bases por familia fiscal, cuotas y retención. No es un documento legal ni se emite.
- Ejemplo: un cliente sin Facturación teclea la factura de un proveedor.
- Evitar: "factura" a secas, "factura lite emitida".

**Libro registro desde Contabilidad** — Libro registro de IVA o IGIC generado a partir de los Registros de factura cuando el tenant no tiene Facturación.
