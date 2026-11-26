# 02-historias — Proyectos y horas
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar. Depende de CE-17..CE-19 del core (PR #47). Sin referencias a productos comerciales de terceros.

**HU-H01 — Definir servicios** · Must. DADO un despacho CUANDO creo un servicio con su tarifa de venta ENTONCES queda disponible para encargos.
**HU-H02 — Crear un encargo** · Must. DADO una empresa y un servicio CUANDO creo el encargo con periodicidad y honorario ENTONCES queda activo y enlazado al honorario pactado (CE-17).
**HU-H03 — Registrar horas** · Must. DADO un encargo CUANDO anoto 90 minutos ENTONCES se crea un parte con persona, fecha y encargo.
**HU-H04 — Temporizador** · Should. DADO un encargo CUANDO inicio y paro el temporizador ENTONCES se crea un parte con la duración.
**HU-H05 — Horas internas** · Must. DADO tiempo sin cliente CUANDO lo anoto ENTONCES va a "interno" y cuenta para utilización, no para el coste del cliente.
**HU-H06 — Marcar facturable o no** · Must. DADO un parte CUANDO lo marco no facturable ENTONCES no entra en horas sin facturar.
**HU-H07 — Editar o borrar un parte** · Must. DADO un parte aprobado CUANDO intento editarlo ENTONCES se impide; solo se corrige con ajuste.
**HU-H08 — Aprobar partes** · Should. DADO partes de la semana CUANDO el responsable los aprueba ENTONCES quedan bloqueados.
**HU-H09 — Presupuestar horas** · Should. DADO un encargo CUANDO fijo 12 h/mes ENTONCES se compara con lo real.
**HU-H10 — Avisar de desviación** · Should. DADO el 80 % del presupuesto consumido CUANDO se registra más tiempo ENTONCES se avisa al responsable.
**HU-H11 — Gestionar plazos** · Must ⚠. DADO un encargo fiscal CUANDO se acerca el plazo ENTONCES se avisa a la persona asignada.
**HU-H12 — Asignar personas** · Should. DADO un encargo CUANDO asigno persona y rol ENTONCES solo ellas imputan por defecto.
**HU-H13 — Coste hora por rol** · Must. DADO un rol CUANDO fijo su coste hora con vigencia ENTONCES se usa en los cálculos de ese periodo.
**HU-H14 — Margen por cliente** · Must. DADO un periodo CUANDO consulto un cliente ENTONCES veo ingresos, coste, margen y esfuerzo.
**HU-H15 — Ranking de clientes** · Must. DADO la cartera CUANDO ordeno por margen o por esfuerzo ENTONCES identifico los más caros.
**HU-H16 — Realización y utilización** · Should. Ver ambas por persona, equipo y periodo.
**HU-H17 — Horas sin facturar** · Must. Ver las horas facturables aún no cubiertas por un honorario.
**HU-H18 — Proponer honorario a Facturación** · Could. DADO horas facturables CUANDO lo ordeno ENTONCES se emite una propuesta para que Facturación la convierta en factura.
**HU-H19 — Comparar presupuesto y real** · Should. Ver desviación por encargo.
**HU-H20 — Cierre de periodo** · Must. DADO un periodo CUANDO se cierra ENTONCES los partes quedan bloqueados.
**HU-H21 — Exportar partes** · Should. Exportar por cliente, persona y periodo.
**HU-H22 — Permisos y confidencialidad** · Must. DADO un usuario sin rol de responsable CUANDO consulta ENTONCES no ve costes ni márgenes ni horas ajenas.
**HU-H23 — Conservar datos sin licencia** · Must. Sin licencia solo lectura y exportación.
**HU-H24 — Auditoría** · Must. Quién registró, editó, aprobó o ajustó.
**HU-H25 — Alimentar la rentabilidad del core** · Must. DADO partes aprobados CUANDO se cierra el periodo ENTONCES el core recibe los minutos por empresa.
**HU-H26 — Corregir con ajuste** · Must. DADO un parte aprobado erróneo CUANDO se ajusta ENTONCES se crea un parte de ajuste enlazado, sin borrar el original.
