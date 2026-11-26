# 04-invariantes — Módulo Contabilidad
> Generado con SPECTRA · github.com/GuiMiran/spectra

Si una invariante se viola, el sistema está en estado corrupto.

| ID | Condición | Tipo | Consecuencia si se viola | Verificado por |
|---|---|---|---|---|
| **INV-K01** | Todo asiento tiene la suma del debe igual a la del haber | Business | Contabilidad descuadrada | SK-K02 |
| **INV-K02** | En el balance de sumas y saldos de cualquier fecha, el total del debe es igual al del haber | Business | Se bloquea la emisión de informes | SK-K08 |
| **INV-K03** | Un asiento contabilizado no cambia: solo se anula o se ajusta con otro | Business | Pérdida de trazabilidad | SK-K05, WF-K06 |
| **INV-K04** | La numeración de asientos es correlativa y sin saltos dentro del ejercicio | Business | Libro diario inválido | SK-K01 |
| **INV-K05** | Un asiento solo usa cuentas activas del plan de su empresa | Business | Asiento rechazado | SK-K03 |
| **INV-K06** | La fecha de un asiento pertenece a un ejercicio abierto y a un periodo no cerrado | Business | Asiento rechazado y incidencia | SK-K01 |
| **INV-K07** | Un evento de origen produce como máximo un asiento automático | Technical | Doble contabilización | SK-K01 |
| **INV-K08** | El saldo de 430 es igual a la suma de las facturas emitidas pendientes de cobro | Business | Descuadre con Facturación | SK-K09 |
| **INV-K09** | Por periodo cerrado, el saldo de 477 y 472 coincide con los libros registro de Facturación | Business | Modelos con importes erróneos | SK-K09, WF-K05 |
| **INV-K10** | Un periodo cerrado no admite asientos nuevos con fecha dentro de él | Business | Alteración de periodos presentados | SK-K10 |
| **INV-K11** | Los apuntes referencian terceros solo por su identificador del core | Architectural | Datos personales duplicados | SK-K01 |
| **INV-K12** | Todo asiento automático guarda el identificador de su evento y de su documento de origen | Technical | No se puede auditar ni reprocesar | SK-K01 |
| **INV-K13** | Sin licencia activa, Contabilidad no crea ni modifica asientos | Business | Operaciones sin licencia | CT-K01 |
| **INV-K14** | Un asiento de anulación revierte exactamente los apuntes del asiento anulado | Business | La anulación no neutraliza | SK-K05 |
| **INV-K15** | Un plan de cuentas tiene un solo código por cuenta | Business | Ambigüedad de cuentas | SK-K03 |
| **INV-K16** | Un periodo cerrado solo se reabre con motivo y rol autorizado, y deja auditoría | Business | Reapertura sin control | SK-K10 |

## Factura Lite
**INV-K17** — Una factura nunca tiene a la vez un Registro de Contabilidad y un evento de Facturación que generen asiento.
**INV-K18** — Todo Registro de factura contabilizado tiene exactamente un asiento enlazado.
