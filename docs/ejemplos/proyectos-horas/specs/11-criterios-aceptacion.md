# 11-criterios-aceptacion — Proyectos y horas
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar. Depende de CE-17..CE-19 del core (PR #47). Sin referencias a productos comerciales de terceros.

**AC-H01** (HU-H03, RN-H01) DADO un encargo CUANDO anoto 90 min ENTONCES hay un parte de 90 min con persona y fecha.
**AC-H02** (HU-H03, RN-H02) DADO 23 h ya anotadas en el día CUANDO anoto 2 h más ENTONCES se rechaza ⚠.
**AC-H03** (HU-H04) DADO el temporizador de 45 min CUANDO paro ENTONCES se crea un parte de 45 min.
**AC-H04** (HU-H05, RN-H06) DADO 60 min internos CUANDO calculo el coste de un cliente ENTONCES no se suman.
**AC-H05** (HU-H07, RN-H04) DADO un parte aprobado CUANDO intento editarlo ENTONCES se impide y se ofrece ajustar.
**AC-H06** (HU-H26, INV-H03) DADO un parte aprobado de 90 min CUANDO ajusto -30 ENTONCES los minutos efectivos son 60 y el original sigue.
**AC-H07** (HU-H08) DADO partes de la semana CUANDO el responsable aprueba ENTONCES se bloquean.
**AC-H08** (RN-H03, POL-H04) DADO un periodo cerrado CUANDO imputo con fecha dentro ENTONCES se rechaza y se ofrece reabrir con motivo.
**AC-H09** (RN-H05) DADO un colaborador sin asignación CUANDO imputa a ese encargo ENTONCES se rechaza.
**AC-H10** (HU-H10, POL-H05) DADO presupuesto de 10 h y 8 h consumidas CUANDO anoto 30 min ENTONCES se avisa.
**AC-H11** (HU-H13, RN-H08) DADO coste hora 40 € y un parte de 90 min CUANDO calculo ENTONCES el coste es 60 €.
**AC-H12** (HU-H14, RN-H10, INV-H06) DADO ingreso 300 €, horas por 120 € y uso por 10 € CUANDO calculo ENTONCES el margen es 170 € (56,7 %).
**AC-H13** (HU-H15, RN-H13) DADO una cartera CUANDO ordeno por esfuerzo ENTONCES el cliente con más horas por documento queda el primero.
**AC-H14** (HU-H16, RN-H11) DADO 8 h facturables y 7 facturadas CUANDO calculo ENTONCES la realización es 87,5 %.
**AC-H15** (HU-H17) DADO 14 h facturables sin propuesta CUANDO consulto ENTONCES veo 14 h sin facturar.
**AC-H16** (HU-H18, RN-H21, INV-H07) DADO horas ya propuestas CUANDO intento proponerlas otra vez ENTONCES se rechaza.
**AC-H17** (HU-H18, RN-H20) DADO una propuesta CUANDO se consulta ENTONCES no es una factura y no tiene número de factura.
**AC-H18** (HU-H22, RN-H23, INV-H09) DADO un colaborador CUANDO consulta márgenes ENTONCES no los ve.
**AC-H19** (HU-H25, INV-H08) DADO partes aprobados por 600 min de la empresa X CUANDO se cierra el periodo ENTONCES el core recibe 600 minutos para X.
**AC-H20** (HU-H20, INV-H04) DADO un periodo cerrado CUANDO se intenta crear un parte ENTONCES se rechaza.
**AC-H21** (HU-H23, RN-H26) DADO licencia vencida CUANDO intento registrar ENTONCES no se permite pero se pueden exportar.
**AC-H22** (POL-H09) DADO un periodo sin partes CUANDO calculo ENTONCES se calcula por uso y se marca como estimación.
**AC-H23** (HU-H11, RN-H15) ⚠ DADO un plazo vencido sin cumplir CUANDO pasa la fecha ENTONCES se abre una incidencia.
**AC-H24** (HU-H24) DADO un ajuste CUANDO consulto la auditoría ENTONCES consta quién, cuándo y por qué.
