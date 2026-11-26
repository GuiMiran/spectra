# 04-invariantes — Proyectos y horas
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar. Depende de CE-17..CE-19 del core (PR #47). Sin referencias a productos comerciales de terceros.

**INV-H01** — Todo parte tiene persona, fecha, minutos > 0 y encargo o marca interna.
**INV-H02** — Un parte aprobado no cambia; solo se ajusta con otro parte enlazado.
**INV-H03** — La suma de ajustes y original da los minutos efectivos.
**INV-H04** — Ningún parte cae en un periodo cerrado tras el cierre.
**INV-H05** — Coste de un parte = minutos × coste hora vigente de su fecha.
**INV-H06** — Margen = ingreso − coste de horas − coste de uso.
**INV-H07** — Una hora facturable pertenece a una sola propuesta de honorario.
**INV-H08** — La suma de minutos por empresa entregada al core coincide con los partes aprobados.
**INV-H09** — Una persona sin permiso no accede a costes, márgenes ni partes ajenos.
**INV-H10** — Todo encargo pertenece a una empresa y un servicio del mismo despacho.
**INV-H11** — Un parte interno no suma coste a ningún cliente.
**INV-H12** — La rentabilidad de un periodo cerrado no cambia salvo reapertura con constancia (alineado con INV-C17).
