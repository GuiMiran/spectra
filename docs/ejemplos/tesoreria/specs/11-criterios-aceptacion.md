# 11-criterios-aceptacion — Tesorería
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar contra la fuente oficial. Importes de ejemplo. Sin referencias a productos comerciales de terceros.

**AC-T01** (HU-T01, RN-T01) DADO un IBAN con dígitos de control erróneos CUANDO lo guardo ENTONCES se rechaza.
**AC-T02** (HU-T02, RN-T05) DADO un extracto con saldo inicial 1.000 €, abonos 500 € y cargos 200 € CUANDO importo ENTONCES el saldo final es 1.300 €; si el fichero dice otro valor, no se importa.
**AC-T03** (HU-T04, INV-T03) DADO un extracto ya importado CUANDO lo importo otra vez ENTONCES no se duplica ningún movimiento.
**AC-T04** (HU-T06, RN-T10) DADO un abono de 1.060 € con el nº de factura en el concepto CUANDO propongo ENTONCES hay coincidencia de confianza alta.
**AC-T05** (HU-T06, RN-T12, POL-T03) DADO Facturación activa CUANDO confirmo la conciliación ENTONCES se informa a Facturación y esta registra el cobro.
**AC-T06** (HU-T06, RN-T13, POL-T03) DADO solo Contabilidad CUANDO confirmo ENTONCES Contabilidad genera el asiento de cobro, uno solo.
**AC-T07** (HU-T08, INV-T04) DADO un abono de 1.000 € CUANDO intento conciliar 1.200 € ENTONCES se rechaza.
**AC-T08** (HU-T08) DADO un abono de 1.500 € que paga dos facturas de 1.000 € y 500 € CUANDO concilio ENTONCES ambas quedan cobradas.
**AC-T09** (HU-T11, INV-T12) DADO una conciliación CUANDO la deshago ENTONCES la factura vuelve a pendiente y el asiento se anula.
**AC-T10** (HU-T10, POL-T04) DADO una comisión de 3,50 € CUANDO la clasifico ENTONCES se genera un asiento de gasto bancario contra el banco ⚠.
**AC-T11** (HU-T13, INV-T09) DADO saldo bancario 12.400 € y contable 12.150 € CUANDO comparo ENTONCES la diferencia de 250 € queda explicada por partidas pendientes.
**AC-T12** (HU-T14, RN-T17) ⚠ DADO un mandato sin uso en 36 meses CUANDO intento remesar ENTONCES se rechaza por caducado.
**AC-T13** (HU-T15, RN-T16) DADO una factura sin mandato CUANDO la incluyo en la remesa ENTONCES se rechaza.
**AC-T14** (HU-T15, INV-T08) DADO una factura ya remesada CUANDO la incluyo en otra remesa ENTONCES se rechaza.
**AC-T15** (HU-T15, POL-T05) ⚠ DADO el primer adeudo de un mandato recurrente CUANDO genero la remesa ENTONCES la secuencia es "primero".
**AC-T16** (HU-T15, POL-T06) ⚠ DADO una fecha de adeudo en sábado CUANDO genero ENTONCES pasa al siguiente día hábil y se avisa.
**AC-T17** (HU-T16, POL-T07) DADO una devolución por falta de fondos CUANDO la importo ENTONCES la factura vuelve a pendiente con el motivo.
**AC-T18** (HU-T17, RN-T23) DADO una factura recibida sin IBAN válido del proveedor CUANDO creo la orden ENTONCES se rechaza.
**AC-T19** (HU-T18, POL-T08) ❓ DADO un pago sobre el umbral CUANDO genero el fichero sin aprobación ENTONCES se impide.
**AC-T20** (HU-T19, POL-T09) DADO un saldo previsto negativo en 20 días CUANDO consulto ENTONCES hay alerta de descubierto.
**AC-T21** (RN-T29, INV-T10) DADO un periodo cerrado CUANDO intento conciliar un movimiento con fecha dentro ENTONCES se rechaza.
**AC-T22** (HU-T25, INV-T11) DADO un usuario sin permiso CUANDO consulta saldos ENTONCES no los ve.
**AC-T23** (HU-T23, RN-T28) DADO licencia vencida CUANDO intento importar ENTONCES no se permite pero se puede exportar.
**AC-T24** (INV-T06, RN-K20) DADO un movimiento ya contabilizado CUANDO llega el mismo evento ENTONCES no se crea un segundo asiento.
