# 09-skills — Tesorería
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar contra la fuente oficial. Importes de ejemplo. Sin referencias a productos comerciales de terceros.

**SK-T01 validar_iban** — Entrada: IBAN. Salida: válido o motivo. RN-T01; INV-T01.
**SK-T02 importar_norma43** — Entrada: fichero. Salida: movimientos y controles. RN-T04..T08; INV-T02, T03.
**SK-T03 importar_camt053** — Igual para ISO 20022.
**SK-T04 proponer_conciliacion** — Entrada: movimiento y pendientes. Salida: coincidencias con confianza. RN-T10; POL-T01.
**SK-T05 conciliar** — Confirma, parcial o agrupada. RN-T09, T11..T13; INV-T04, T05.
**SK-T06 deshacer_conciliacion** — RN-T14; INV-T12.
**SK-T07 clasificar_movimiento** — RN-T15; POL-T04.
**SK-T08 gestionar_mandato** — RN-T16, T17; INV-T07.
**SK-T09 generar_remesa_sepa** — RN-T18..T21; POL-T05, T06; INV-T07, T08.
**SK-T10 procesar_devolucion** — RN-T22; POL-T07.
**SK-T11 generar_orden_pago** — RN-T23, T24; INV-T08.
**SK-T12 aprobar_pago** — RN-T25; POL-T08.
**SK-T13 comparar_saldos** — RN-T26; INV-T09.
**SK-T14 calcular_prevision** — RN-T26; POL-T09.
