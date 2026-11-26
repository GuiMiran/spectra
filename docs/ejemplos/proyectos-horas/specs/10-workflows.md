# 10-workflows — Proyectos y horas
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar. Depende de CE-17..CE-19 del core (PR #47). Sin referencias a productos comerciales de terceros.

**WF-H01 Registro de horas** — AG-H01: SK-H01 → SK-H02 → EV-H01. Errores: periodo cerrado, sin asignación.
**WF-H02 Aprobación semanal** — AG-H02: SK-H04 → bloqueo → EV-H02.
**WF-H03 Corrección** — AG-H02: SK-H05 → EV-H08.
**WF-H04 Control de presupuesto** — AG-H03: SK-H06 → EV-H03 si procede.
**WF-H05 Plazos** — Programado: SK-H07 → EV-H06 / EV-H07.
**WF-H06 Cierre de periodo** — AG-H06: comprobar aprobaciones → SK-H12 → SK-H13 → EV-H04.
**WF-H07 Rentabilidad por cliente** — AG-H04: SK-H08 → SK-H09 → SK-H10 → EV-H09.
**WF-H08 Propuesta de honorario** — AG-H05: SK-H11 → EV-H05 → Facturación crea la factura (WF-F01).
**WF-H09 Alta de empresa** — Trigger EV-C01: se ofrece crear los encargos básicos.
