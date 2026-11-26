# 00-index — Módulo Contabilidad
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador v0.2. Base: [dominio-contable.md](../dominio-contable.md), contrato del core y dominio fiscal de Facturación.

## Para qué sirve este índice
Dice al agente constructor qué ficheros leer según la tarea. Todo el módulo se rige por los IDs de estas specs: HU-K, RN-K, INV-K, CT-K, POL-K, EVT-K, AG-K, SK-K, WF-K, AC-K.

## Tabla de despacho
| Tarea | Leer, por orden |
|---|---|
| Construir el módulo desde cero | 01, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12 |
| Añadir un informe o libro | 01, 03, 04, 09 (SK de informes), 11 |
| Depurar un asiento mal generado | 03, 04, 06 (POL de cuentas), 05 (CT-K01), 11 |
| Depurar un descuadre con Facturación | 04 (INV-K09), 05 (CT-K07), 07, 10 (WF-K05) |
| Implementar un workflow concreto | 10, los agentes y skills que cita, 05 |
| Verificar que el módulo está completo | 11, 12 |
| Añadir un territorio (por ejemplo Ceuta y Melilla) | 03 (RN-K10, RN-K11), 06 (POL-K01, POL-K05), 11 |

## Decisiones cerradas (propuesta, modificables)
| ID | Decisión | Regla |
|---|---|---|
| **DEC-K01** | Plan de cuentas | Plantilla por defecto: PGC de pymes. El PGC general es una plantilla alternativa que se elige al crear el plan de la empresa. El cuadro de cuentas no es obligatorio: la empresa puede abrir subcuentas |
| **DEC-K02** | Subcuentas de IVA e IGIC | Se generan automáticamente una subcuenta de 472 y otra de 477 por cada combinación de impuesto, tipo y régimen de las familias fiscales. El IGIC usa sus propias subcuentas dentro de 472 y 477 ⚠ pendiente de contrastar con la resolución del ICAC de 16-12-1992 |
| **DEC-K03** | Momento de contabilización | Por defecto, en la fecha de devengo (fecha de la factura o de la operación). El criterio de caja se deja para la fase 2 |
| **DEC-K04** | Tickets de TPV | Un asiento resumen diario por caja, con las ventas agrupadas por familia fiscal y trazabilidad a los tickets. Las facturas completas generan asiento individual |
| **DEC-K05** | Autónomos personas físicas | La empresa elige modalidad: **Contabilidad mercantil** (con asientos y 550 Titular de la explotación) o **Solo libros registro** (sin asientos, solo los libros de Facturación). El módulo avisa de la diferencia al activarlo |
| **DEC-K06** | Alcance de la fase 2 | Cuentas anuales completas, amortizaciones, Impuesto sobre Sociedades y criterio de caja. En la fase 1 se entregan balance, cuenta de pérdidas y ganancias y sumas y saldos |

## Ficheros
| Fichero | Contenido |
|---|---|
| [01-glosario.md](01-glosario.md) | Lenguaje canónico |
| [02-historias.md](02-historias.md) | Historias de usuario |
| [03-reglas-negocio.md](03-reglas-negocio.md) | Reglas RN-K |
| [04-invariantes.md](04-invariantes.md) | Invariantes INV-K |
| [05-contratos.md](05-contratos.md) | Contratos de operación CT-K |
| [06-politicas.md](06-politicas.md) | Políticas y tablas de decisión POL-K |
| [07-eventos.md](07-eventos.md) | Eventos EVT-K |
| [08-agentes.md](08-agentes.md) | Agentes AG-K |
| [09-skills.md](09-skills.md) | Skills SK-K |
| [10-workflows.md](10-workflows.md) | Workflows WF-K |
| [11-criterios-aceptacion.md](11-criterios-aceptacion.md) | Criterios AC-K |
| [12-trace.md](12-trace.md) | SPECTRA-TRACE |
| [SPEC-INDEX.md](SPEC-INDEX.md) | Mapa y referencias cruzadas |
