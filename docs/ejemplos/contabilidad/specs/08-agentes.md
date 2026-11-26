# 08-agentes — Módulo Contabilidad
> Generado con SPECTRA · github.com/GuiMiran/spectra

Roles funcionales autónomos, no técnicos.

**AG-K01 — AgenteContabilizador**
- Responsabilidad: convertir los hechos de Facturación en asientos correctos, una sola vez.
- Skills: SK-K01, SK-K02, SK-K03, SK-K04.
- Escucha: EV-F01, EV-F02, EV-F03, EV-F04, EV-F05, EV-C07.
- Produce: EVT-K01, EVT-K06.
- Invariantes: INV-K01, INV-K04, INV-K05, INV-K06, INV-K07, INV-K11, INV-K12, INV-K13.

**AG-K02 — AgenteConciliador**
- Responsabilidad: comprobar que lo contabilizado coincide con los libros registro de Facturación y con los saldos de terceros.
- Skills: SK-K09, SK-K08.
- Escucha: EVT-K01, EVT-K02, EVT-K03.
- Produce: EVT-K07.
- Invariantes: INV-K02, INV-K08, INV-K09.

**AG-K03 — AgenteCierre**
- Responsabilidad: cerrar periodos y ejercicios con todas las comprobaciones previas.
- Skills: SK-K10, SK-K09, SK-K05.
- Escucha: EVT-K07, EV-C06.
- Produce: EVT-K03, EVT-K04, EVT-K05.
- Invariantes: INV-K03, INV-K10, INV-K16.

**AG-K04 — AgenteInformes**
- Responsabilidad: producir los libros e informes y los ficheros para legalizar.
- Skills: SK-K06, SK-K07, SK-K08, SK-K11, SK-K12.
- Escucha: EVT-K03, EVT-K05.
- Produce: documentos de libro e informe.
- Invariantes: INV-K02.

**AG-K05 — AgenteConfiguración**
- Responsabilidad: crear y mantener el plan de cuentas y las correspondencias fiscal-contable.
- Skills: SK-K03, SK-K13.
- Escucha: EV-C01, EV-C05, EV-C03.
- Produce: planes de cuentas y subcuentas.
- Invariantes: INV-K05, INV-K15.

**AG-K06 — AgenteCorrecciones**
- Responsabilidad: anular y ajustar asientos y resolver incidencias.
- Skills: SK-K05, SK-K01.
- Escucha: EVT-K06.
- Produce: EVT-K02.
- Invariantes: INV-K03, INV-K14.
