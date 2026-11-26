# 07-eventos — Proyectos y horas
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar. Depende de CE-17..CE-19 del core (PR #47). Sin referencias a productos comerciales de terceros.

| ID | Evento | Dispara |
|---|---|---|
| EV-H01 | ParteRegistrado | Presupuesto consumido, EV-C10 |
| EV-H02 | PartesAprobados | Bloqueo, entrada a rentabilidad |
| EV-H03 | PresupuestoSuperado | Aviso al responsable |
| EV-H04 | PeriodoDeHorasCerrado | Entrega de minutos al core, cálculo de rentabilidad |
| EV-H05 | HonorarioPropuesto | Facturación puede crear la factura (consume H) |
| EV-H06 | PlazoProximo | Aviso a la persona asignada |
| EV-H07 | PlazoVencido | Incidencia |
| EV-H08 | ParteAjustado | Auditoría, recálculo del margen |
| EV-H09 | RentabilidadCalculada | Informe disponible |
| EV-H10 | IncidenciaHoras | Tarea al responsable |

Consume: EV-C01 (empresa creada), EV-C06 (periodo cerrado), EV-C07/C08 (licencias), EV-F01 y EV-F04 (honorarios facturados y cobrados, para el ingreso) y, de Fiscal, el calendario de plazos.
