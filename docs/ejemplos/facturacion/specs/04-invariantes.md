# 04-invariantes — Módulo Facturación
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. Los puntos marcados ⚠ se verifican contra BOE / AEAT / Agencia Tributaria Canaria antes de usarse como verdad. Importes de ejemplo.

**INV-F01** — Total = bases + cuotas + recargo − retención.
**INV-F02** — La numeración de cada serie es correlativa y sin saltos.
**INV-F03** — Una factura emitida no se modifica; solo se rectifica.
**INV-F04** — Toda rectificativa referencia a una factura original existente.
**INV-F05** — Una línea no mezcla IVA e IGIC.
**INV-F06** — El tipo aplicado existe en la familia fiscal vigente en la fecha.
**INV-F07** — La cuota deducible nunca supera la cuota soportada.
**INV-F08** — El nº de recepción de recibidas es correlativo.
**INV-F09** — Cada factura emitida tiene exactamente un registro de facturación encadenado.
**INV-F10** — Toda factura emitida o recibida figura en su libro registro.
**INV-F11** — La suma de la liquidación coincide con la suma de los libros del periodo.
**INV-F12** — Saldo de un tercero = facturas pendientes − cobros o pagos.
**INV-F13** — Ninguna factura con fecha en un periodo cerrado se crea o modifica.
**INV-F14** — Una factura nunca genera dos asientos: el evento es único (alineado con RN-K20 e INV-K17).
