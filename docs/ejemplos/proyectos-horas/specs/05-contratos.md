# 05-contratos — Proyectos y horas
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar. Depende de CE-17..CE-19 del core (PR #47). Sin referencias a productos comerciales de terceros.

**CT-H01 crear_encargo** — PRE: licencia, empresa y servicio del despacho. POST: encargo activo, enlace a honorario. ERROR: empresa de otro despacho, servicio inexistente.
**CT-H02 registrar_parte** — PRE: persona asignada, periodo abierto, minutos válidos. POST: parte, EV-H01, EV-C10. ERROR: periodo cerrado, encargo cerrado, límite diario superado, sin asignación.
**CT-H03 aprobar_partes** — PRE: rol responsable, partes sin aprobar. POST: partes bloqueados, EV-H02. ERROR: sin permiso.
**CT-H04 ajustar_parte** — PRE: parte aprobado, motivo. POST: parte de ajuste enlazado, auditoría. ERROR: periodo cerrado.
**CT-H05 calcular_rentabilidad** — PRE: periodo con partes aprobados. POST: margen, esfuerzo y carga por cliente. ERROR: sin coste hora definido (se avisa y estima).
**CT-H06 proponer_honorario** — PRE: horas facturables sin proponer. POST: propuesta, EV-H05. ERROR: horas ya propuestas.
**CT-H07 fijar_presupuesto** — PRE: encargo activo. POST: presupuesto con umbrales. ERROR: presupuesto negativo.
**CT-H08 cerrar_periodo** — PRE: partes aprobados o decididos. POST: periodo cerrado, minutos entregados al core, EV-H04. ERROR: partes sin aprobar.
**CT-H09 gestionar_plazo** — PRE: encargo, fecha, responsable. POST: plazo con aviso. ERROR: fecha pasada sin motivo.
