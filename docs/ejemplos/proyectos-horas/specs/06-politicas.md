# 06-politicas — Proyectos y horas
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar. Depende de CE-17..CE-19 del core (PR #47). Sin referencias a productos comerciales de terceros.

**POL-H01 — Ingreso de referencia.** SI se elige "cobrado" ENTONCES ingreso = honorarios cobrados. SI_NO SI "facturado" ENTONCES emitidos. SI_NO pactado.
**POL-H02 — Coste hora.** SI existe coste por persona y el rol autorizado lo permite ENTONCES se usa. SI_NO el del rol. SI_NO se avisa y se estima.
**POL-H03 — Aprobación.** SI el despacho exige aprobación ENTONCES los partes se bloquean al aprobar. SI_NO se bloquean al cerrar el periodo.
**POL-H04 — Parte en periodo cerrado.** SI la fecha cae en periodo cerrado ENTONCES se rechaza con opción de reabrir con motivo.
**POL-H05 — Desviación.** SI horas reales ≥ 80 % del presupuesto ENTONCES aviso. SI_NO SI ≥ 100 % ENTONCES alerta y propuesta de revisar el honorario.
**POL-H06 — Clasificación de esfuerzo.** SI horas por documento ≤ 0,75 × mediana ENTONCES bajo. SI_NO SI ≥ 1,5 × mediana ENTONCES alto ❓ SI_NO medio.
**POL-H07 — Visibilidad.** Responsable: todo. Gestor: sus encargos. Colaborador: sus partes. Cliente: nada de horas.
**POL-H08 — Licencia.** Activa normal; suspendida solo lectura y exportación; vencida solo exportación en plazo de gracia.
**POL-H09 — Sin partes en un periodo.** SI no hay partes ENTONCES la rentabilidad se calcula por uso y se marca como estimación.
**POL-H10 — Incremento de facturación.** SI el despacho factura por incrementos ENTONCES se redondea al incremento al proponer honorario; el minuto real se conserva.
