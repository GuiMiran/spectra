# 08-agentes — Módulo Facturación
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. Los puntos marcados ⚠ se verifican contra BOE / AEAT / Agencia Tributaria Canaria antes de usarse como verdad. Importes de ejemplo.

**AG-F01 AgenteEmisor** — Crea, valida y emite facturas. Skills: SK-F01..F04. Produce EV-F01. Invariantes: INV-F01..F06, INV-F09.
**AG-F02 AgenteRecibidas** — Registra y clasifica recibidas. Skills: SK-F05, SK-F06. Produce EV-F03. Invariantes: INV-F07, INV-F08.
**AG-F03 AgenteCobros** — Cobros, pagos y vencimientos. Skills: SK-F07, SK-F08. Produce EV-F04, EV-F06. Invariantes: INV-F12.
**AG-F04 AgenteLibros** — Libros registro y liquidaciones. Skills: SK-F09..F11. Produce EV-F05. Invariantes: INV-F10, INV-F11.
**AG-F05 AgenteVeriFactu** — Registros encadenados y remisión. Skills: SK-F12. Produce EV-F07, EV-F08. Invariantes: INV-F09.
**AG-F06 AgenteRectificaciones** — Rectificativas y anulaciones. Skills: SK-F13, SK-F14. Produce EV-F02. Invariantes: INV-F03, INV-F04.
