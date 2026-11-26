# 05-contratos — Módulo Facturación
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. Los puntos marcados ⚠ se verifican contra BOE / AEAT / Agencia Tributaria Canaria antes de usarse como verdad. Importes de ejemplo.

**CT-F01 emitir_factura** — PRE: licencia activa, periodo abierto, cliente y líneas válidos, serie con contador. POST: factura con número único, registro de facturación encadenado, libro actualizado, EV-F01. ERROR: sin licencia, periodo cerrado, familia fiscal sin resolver, cliente sin datos obligatorios.
**CT-F02 rectificar_factura** — PRE: original emitida, motivo, tipo R1–R5. POST: rectificativa referenciada, libro y saldos ajustados, EV-F02. ERROR: original inexistente, ya rectificada por el total.
**CT-F03 registrar_recibida** — PRE: proveedor identificado, fechas y bases. POST: nº de recepción, libro de recibidas, cuota deducible fijada, EV-F03. ERROR: NIF inválido, periodo cerrado, cuota deducible > soportada.
**CT-F04 registrar_cobro_pago** — PRE: factura pendiente, importe ≤ saldo. POST: saldo actualizado, EV-F04. ERROR: importe mayor que el saldo.
**CT-F05 preparar_liquidacion** — PRE: periodo con libros. POST: resumen 303 o 420 por tipo y régimen, EV-F05. ERROR: diferencias con libros.
**CT-F06 remitir_registro** — PRE: modo verificable, registro generado. POST: estado de envío. ERROR: rechazo o fallo de red (incidencia, reintento).
**CT-F07 cerrar_periodo** — PRE: sin facturas en borrador. POST: periodo cerrado. ERROR: borradores o remisiones pendientes.
**CT-F08 anular_factura** — PRE: factura emitida. POST: registro de anulación, libro marcado, EV-F02. ERROR: ya anulada.
