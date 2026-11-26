# 07-eventos — Tesorería
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar contra la fuente oficial. Importes de ejemplo. Sin referencias a productos comerciales de terceros.

| ID | Evento | Dispara |
|---|---|---|
| EV-T01 | ExtractoImportado | Propuestas de conciliación |
| EV-T02 | MovimientoSinConciliar | Aviso y partida pendiente |
| EV-T03 | MovimientoConciliado | Facturación registra cobro o pago (EV-F04); sin Facturación, Contabilidad (PLA-K04) |
| EV-T04 | ConciliacionDeshecha | Reversión del cobro o pago |
| EV-T05 | MovimientoClasificado | Contabilidad genera asiento (PLA-K09, pendiente) |
| EV-T06 | RemesaGenerada | Facturas marcadas como remesadas |
| EV-T07 | AdeudoDevuelto | Factura vuelve a pendiente, aviso |
| EV-T08 | OrdenPagoGenerada | Facturas marcadas como en pago |
| EV-T09 | PeriodoBancarioCerrado | Congela la conciliación |
| EV-T10 | PrevisionActualizada | Alertas de descubierto |

Consume: EV-F01, EV-F03 (vencimientos), EV-F02, EV-F04, EVT-K01, EV-C01, C06, C07, C08.
