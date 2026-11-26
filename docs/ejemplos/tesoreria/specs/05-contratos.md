# 05-contratos — Tesorería
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar contra la fuente oficial. Importes de ejemplo. Sin referencias a productos comerciales de terceros.

**CT-T01 importar_extracto** — PRE: licencia, cuenta existente, fichero legible, periodo abierto. POST: movimientos creados sin duplicados, saldos coinciden, EV-T01. ERROR: formato no reconocido, controles que no cuadran, cuenta ajena.
**CT-T02 conciliar_movimiento** — PRE: movimiento y factura pendiente, importes compatibles. POST: conciliación guardada, EV-T03. ERROR: importe superior, periodo cerrado, ya conciliado.
**CT-T03 deshacer_conciliacion** — PRE: conciliación existente y periodo abierto. POST: efecto revertido, EV-T04. ERROR: periodo cerrado.
**CT-T04 clasificar_movimiento** — PRE: movimiento sin factura, cuenta contable válida. POST: clasificado, EV-T05 para Contabilidad. ERROR: sin Contabilidad (queda pendiente).
**CT-T05 generar_remesa** — PRE: facturas con mandato vigente y cuenta del acreedor válida. POST: fichero pain.008 y EV-T06. ERROR: mandato caducado, IBAN inválido, factura ya remesada.
**CT-T06 procesar_devolucion** — PRE: adeudo remesado. POST: factura pendiente, motivo guardado, EV-T07. ERROR: adeudo desconocido.
**CT-T07 generar_orden_pago** — PRE: facturas aprobadas, IBAN del proveedor válido. POST: fichero pain.001, EV-T08. ERROR: sin aprobar, ya pagada.
**CT-T08 calcular_prevision** — PRE: saldos y vencimientos. POST: saldo previsto por fecha, alertas. ERROR: sin saldo de partida (se estima).
**CT-T09 cerrar_periodo** — PRE: movimientos conciliados o decididos. POST: periodo cerrado, EV-T09. ERROR: partidas sin decidir.
