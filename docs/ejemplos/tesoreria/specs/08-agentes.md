# 08-agentes — Tesorería
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar contra la fuente oficial. Importes de ejemplo. Sin referencias a productos comerciales de terceros.

**AG-T01 AgenteExtractos** — Importa y valida extractos. SK-T01..T03. Produce EV-T01, EV-T02. INV-T02, T03.
**AG-T02 AgenteConciliador** — Propone y confirma conciliaciones. SK-T04..T06. Produce EV-T03, EV-T04. INV-T04, T05, T12.
**AG-T03 AgenteClasificador** — Clasifica movimientos sin factura. SK-T07. Produce EV-T05. INV-T06.
**AG-T04 AgenteCobros** — Mandatos, remesas y devoluciones. SK-T08..T10. Produce EV-T06, EV-T07. INV-T07, T08.
**AG-T05 AgentePagos** — Órdenes de pago y aprobación. SK-T11, T12. Produce EV-T08. INV-T08.
**AG-T06 AgentePrevisión** — Previsión y alertas. SK-T13, T14. Produce EV-T10. INV-T09.
