# 03-reglas-negocio — Proyectos y horas
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar. Depende de CE-17..CE-19 del core (PR #47). Sin referencias a productos comerciales de terceros.

## Partes
**RN-H01** — Todo parte pertenece a una persona, una fecha y un encargo, o es interno.
**RN-H02** — La duración se guarda en minutos y es mayor que cero y menor o igual a 24 h por persona y día ⚠ (límite configurable).
**RN-H03** — No se imputa a encargos cerrados ni a periodos cerrados.
**RN-H04** — Un parte aprobado no se edita ni se borra; se ajusta (HU-H26).
**RN-H05** — Una persona solo imputa a encargos que tiene asignados, salvo permiso del responsable.
**RN-H06** — El tiempo interno no suma coste a ningún cliente.
**RN-H07** — El redondeo por incrementos (6 min por defecto) se aplica al facturar, no al guardar el minuto real.
## Cálculos
**RN-H08** — Coste de un parte = minutos × coste hora vigente del rol en su fecha.
**RN-H09** — Ingreso del cliente = honorarios facturados y cobrados del periodo (DEC-H02); vista alternativa por pactado.
**RN-H10** — Margen = ingreso − coste de horas − coste de uso (CE-13 × CE-14).
**RN-H11** — Realización = horas facturadas / horas facturables. Utilización = horas facturables / horas disponibles ⚠ (definición de "disponibles" configurable).
**RN-H12** — Desviación = (horas reales − presupuesto) / presupuesto.
**RN-H13** — Esfuerzo alto, medio o bajo por comparación con la mediana de la cartera ❓ (umbrales de negocio).
## Presupuestos y plazos
**RN-H14** — Un encargo con presupuesto avisa al llegar al 80 % y al 100 % ❓ (umbrales configurables).
**RN-H15** — Cada plazo tiene fecha, persona responsable y estado; un plazo vencido sin cumplir genera incidencia.
**RN-H16** — Los plazos fiscales del calendario se alimentan desde Fiscal (H-05); aquí solo se gestionan ⚠.
## Aprobación y bloqueo
**RN-H17** — La aprobación bloquea los partes de la persona en el periodo aprobado.
**RN-H18** — Reabrir un periodo exige motivo y rol autorizado, y queda en auditoría.
**RN-H19** — El cierre de periodo del core (EV-C06) bloquea los partes de ese periodo.
## Honorarios
**RN-H20** — La propuesta de honorario no es una factura: la emite Facturación.
**RN-H21** — Una hora facturable no entra en dos propuestas.
**RN-H22** — El honorario pactado se toma del core (CE-17); este módulo no lo edita.
## Datos y privacidad
**RN-H23** — El coste real por persona es un dato laboral sensible: solo lo ve el rol autorizado ⚠ (RGPD).
**RN-H24** — Los informes por persona no se muestran a terceros ni al cliente.
**RN-H25** — Las horas que se entregan a la rentabilidad del core son minutos por empresa, nunca texto libre del parte.
**RN-H26** — Sin licencia activa el módulo no escribe pero conserva y permite exportar.
**RN-H27** — Este módulo no es el registro de jornada laboral; no sustituye al registro legal ⚠ (Estatuto de los Trabajadores, art. 34.9).
**RN-H28** — La medición de uso registra conteos, nunca el contenido (EV-C10).
