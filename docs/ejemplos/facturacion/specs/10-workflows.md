# 10-workflows — Módulo Facturación
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. Los puntos marcados ⚠ se verifican contra BOE / AEAT / Agencia Tributaria Canaria antes de usarse como verdad. Importes de ejemplo.

**WF-F01 Emisión de factura** — Trigger: orden del usuario. AG-F01 → SK-F01 → SK-F02 → SK-F03 → SK-F12 → EV-F01. Errores: periodo cerrado, sin licencia, familia sin resolver.
**WF-F02 Registro de recibida** — AG-F02 → SK-F05 → SK-F06 → libro → EV-F03.
**WF-F03 Cobro y pago** — AG-F03 → SK-F07/F08 → EV-F04.
**WF-F04 Rectificación** — AG-F06 → SK-F13 → SK-F12 → EV-F02.
**WF-F05 Liquidación trimestral** — AG-F04 → SK-F09 → SK-F10 → EV-F05. Errores: diferencias con libros.
**WF-F06 Remisión VeriFactu** — AG-F05 → SK-F12 → EV-F07 o EV-F08 (reintento y incidencia).
**WF-F07 Cierre de periodo** — Comprobar borradores y remisiones → CT-F07.
**WF-F08 Vencimientos** — Programado: detectar vencidas → EV-F06.
**WF-F09 Activación sobre Registros de factura de Contabilidad** — Trigger: LicenciaActivada de Facturación. Ver WF-K11: se importan los Registros como histórico, la serie continúa tras el último número y se bloquea el alta manual.
