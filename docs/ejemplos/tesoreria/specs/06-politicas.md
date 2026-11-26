# 06-politicas — Tesorería
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar contra la fuente oficial. Importes de ejemplo. Sin referencias a productos comerciales de terceros.

**POL-T01 — Coincidencia.** SI hay referencia o nº de factura exacto Y importe igual ENTONCES confianza alta. SI_NO SI solo importe y tercero ENTONCES media. SI_NO baja y solo se sugiere.
**POL-T02 — Auto-confirmación.** SI la empresa la activa Y confianza alta ENTONCES se concilia sola. SI_NO se propone.
**POL-T03 — Quién registra el cobro.** SI Facturación está activa ENTONCES Tesorería informa y Facturación registra (EV-F04). SI_NO Contabilidad consume EV-T03.
**POL-T04 — Movimiento sin factura.** SI es comisión ENTONCES gasto por servicios bancarios. SI_NO SI es interés cobrado ENTONCES ingreso financiero. SI_NO SI es interés pagado ENTONCES gasto financiero. SI_NO partida pendiente de aplicación hasta decidir ⚠ (cuentas por confirmar en el plan).
**POL-T05 — Secuencia del adeudo.** SI es el primero del mandato ENTONCES primero. SI_NO SI hay más previstos ENTONCES recurrente. SI_NO SI único ENTONCES único. SI_NO SI es el último ENTONCES final ⚠.
**POL-T06 — Fecha de adeudo.** SI la fecha cae en día no hábil bancario ENTONCES se mueve al siguiente hábil y se avisa ⚠.
**POL-T07 — Devolución.** SI hay devolución ENTONCES la factura vuelve a pendiente y se avisa; SI es reiterada ENTONCES se sugiere suspender el mandato.
**POL-T08 — Aprobación de pagos.** SI el importe supera el umbral ❓ ENTONCES exige aprobador. SI_NO no.
**POL-T09 — Alerta de descubierto.** SI el saldo previsto es negativo en los próximos N días ❓ ENTONCES alerta.
**POL-T10 — Licencia.** Activa normal; suspendida solo lectura y exportación; vencida solo exportación en plazo de gracia.
