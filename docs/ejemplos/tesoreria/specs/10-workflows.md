# 10-workflows — Tesorería
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar contra la fuente oficial. Importes de ejemplo. Sin referencias a productos comerciales de terceros.

**WF-T01 Importación de extracto** — AG-T01: SK-T02/T03 → controles → EV-T01 → WF-T02.
**WF-T02 Conciliación diaria** — AG-T02: SK-T04 → revisión → SK-T05 → EV-T03 → Facturación (WF-F) o Contabilidad (WF-K02).
**WF-T03 Movimientos sin factura** — AG-T03: SK-T07 → EV-T05 → Contabilidad.
**WF-T04 Remesa de cobro** — AG-T04: SK-T08 → SK-T09 → fichero → EV-T06.
**WF-T05 Devolución** — AG-T04: SK-T10 → EV-T07 → factura pendiente.
**WF-T06 Orden de pago** — AG-T05: SK-T12 → SK-T11 → fichero → EV-T08.
**WF-T07 Previsión semanal** — AG-T06: SK-T14 → EV-T10.
**WF-T08 Cierre bancario** — SK-T13 → conciliar o decidir pendientes → CT-T09 → EV-T09.
**WF-T09 Activación con Facturación o Contabilidad** — Trigger EV-C07: se ofrece importar histórico y enlazar con vencimientos existentes.
