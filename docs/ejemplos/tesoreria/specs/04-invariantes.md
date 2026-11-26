# 04-invariantes — Tesorería
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar contra la fuente oficial. Importes de ejemplo. Sin referencias a productos comerciales de terceros.

**INV-T01** — Todo IBAN guardado es válido.
**INV-T02** — Saldo final = saldo inicial + abonos − cargos, por extracto.
**INV-T03** — Un movimiento no existe dos veces.
**INV-T04** — La suma conciliada de un movimiento no supera su importe.
**INV-T05** — La suma conciliada contra una factura no supera su pendiente.
**INV-T06** — Un movimiento genera como máximo un asiento (idempotencia, alineada con RN-K20).
**INV-T07** — Todo adeudo tiene un mandato vigente.
**INV-T08** — Una factura no se incluye en dos remesas ni en dos órdenes de pago a la vez.
**INV-T09** — La diferencia entre saldo bancario y saldo de 572 se explica por partidas pendientes identificadas.
**INV-T10** — Un periodo cerrado no cambia sin reapertura con constancia.
**INV-T11** — Ningún usuario sin permiso ve saldos ni movimientos.
**INV-T12** — Una conciliación deshecha deja la factura exactamente como estaba.
