# 02-historias — Tesorería
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar contra la fuente oficial. Importes de ejemplo. Sin referencias a productos comerciales de terceros.

**HU-T01 — Dar de alta cuentas** · Must. DADO una empresa CUANDO añado un IBAN válido ENTONCES queda disponible.
**HU-T02 — Importar un extracto** · Must. DADO un fichero Norma 43 CUANDO lo importo ENTONCES se crean los movimientos de la cuenta y se comprueba el saldo de cierre.
**HU-T03 — Importar camt.053** · Should. Igual con ISO 20022.
**HU-T04 — Evitar duplicados al importar** · Must. DADO un extracto ya importado CUANDO lo vuelvo a importar ENTONCES no se duplican movimientos.
**HU-T05 — Alta manual** · Should. Registrar un movimiento a mano.
**HU-T06 — Conciliar un cobro** · Must. DADO un abono de 1.060 € CUANDO coincide con una factura pendiente ENTONCES se propone y, al confirmar, se concilia y se informa a Facturación.
**HU-T07 — Conciliar un pago** · Must. Igual para cargos y facturas recibidas.
**HU-T08 — Conciliación parcial y agrupada** · Should. DADO un abono que paga dos facturas o una parcialmente CUANDO concilio ENTONCES se reparte el importe.
**HU-T09 — Reglas de conciliación** · Should. DADO un concepto recurrente CUANDO creo una regla ENTONCES se aplica a los próximos movimientos.
**HU-T10 — Clasificar un movimiento sin factura** · Must. DADO una comisión CUANDO la clasifico ENTONCES se genera su asiento en Contabilidad.
**HU-T11 — Deshacer una conciliación** · Must. DADO una conciliación CUANDO la deshago ENTONCES la factura vuelve a pendiente y se anula el efecto.
**HU-T12 — Ver partidas pendientes** · Must. Listar movimientos sin conciliar por antigüedad.
**HU-T13 — Comparar saldo bancario y contable** · Must. DADO una fecha CUANDO comparo ENTONCES veo la diferencia y sus causas.
**HU-T14 — Gestionar mandatos SEPA** · Must. Alta, baja y vigencia de mandatos de clientes.
**HU-T15 — Generar una remesa de cobro** · Must ⚠. DADO facturas con mandato CUANDO genero la remesa ENTONCES obtengo un fichero pain.008 válido.
**HU-T16 — Gestionar devoluciones** · Must. DADO una devolución CUANDO la importo ENTONCES la factura vuelve a pendiente y se registra el motivo.
**HU-T17 — Generar órdenes de pago** · Must. DADO facturas a pagar CUANDO creo la orden ENTONCES obtengo un fichero pain.001.
**HU-T18 — Aprobar pagos** · Should. Requiere aprobación de un rol autorizado antes de generar el fichero.
**HU-T19 — Previsión de tesorería** · Must. DADO vencimientos y saldo CUANDO consulto ENTONCES veo el saldo previsto por fecha y alertas de descubierto.
**HU-T20 — Escenarios** · Could. Probar "¿y si el cliente X paga tarde?".
**HU-T21 — Cierre de periodo bancario** · Must. DADO un periodo conciliado CUANDO se cierra ENTONCES se congela.
**HU-T22 — Conectar con la API del banco** · Could ⚠. Consentimiento del titular y renovación.
**HU-T23 — Conservar datos sin licencia** · Must. Solo lectura y exportación.
**HU-T24 — Auditoría** · Must. Quién importó, concilió, deshizo o aprobó.
**HU-T25 — Permisos sobre datos bancarios** · Must. Solo roles autorizados ven saldos y movimientos.
**HU-T26 — Cuenta de tercero** · Must. DADO un IBAN de cliente o proveedor CUANDO lo guardo ENTONCES se valida y queda en el tercero (core, DEC-T01).
