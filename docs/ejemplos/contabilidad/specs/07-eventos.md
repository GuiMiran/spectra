# 07-eventos — Módulo Contabilidad
> Generado con SPECTRA · github.com/GuiMiran/spectra

## Eventos que Contabilidad produce
**EVT-K01 — AsientoGenerado**
- Trigger: un asiento automático o manual queda contabilizado.
- Dispara: marca el documento de origen como "contabilizado" (Facturación lo muestra); alimenta la medición de uso (EV-C10 del core).
- Notifica a: nadie, salvo incidencias.
- Registra en: libro diario y auditoría.

**EVT-K02 — AsientoAnulado**
- Trigger: se crea un asiento de anulación.
- Dispara: recalcula saldos afectados; reabre el pendiente de cobro o pago si procede.
- Notifica a: Contable.
- Registra en: auditoría, con enlace entre ambos asientos.

**EVT-K03 — PeriodoContableCerrado**
- Trigger: cierre de un periodo.
- Dispara: bloquea asientos con fecha dentro; congela la conciliación de ese periodo.
- Notifica a: Responsable de despacho y Administrador de empresa.
- Registra en: auditoría.

**EVT-K04 — PeriodoContableReabierto**
- Trigger: reapertura de un periodo con motivo.
- Dispara: invalida la conciliación congelada; avisa si había modelos presentados.
- Notifica a: Responsable de despacho.
- Registra en: auditoría, con el motivo.

**EVT-K05 — EjercicioCerrado**
- Trigger: cierre y regularización del ejercicio.
- Dispara: asiento de regularización; apertura del ejercicio siguiente; recordatorio de legalización a cuatro meses.
- Notifica a: Responsable de despacho.
- Registra en: libro diario.

**EVT-K06 — IncidenciaContable**
- Trigger: periodo cerrado, cuenta sin configurar, plantilla inexistente o evento no procesable.
- Dispara: crea una tarea para el Contable con el evento intacto.
- Notifica a: Contable.
- Registra en: bandeja de incidencias.

**EVT-K07 — ConciliacionDescuadrada**
- Trigger: la conciliación con Facturación encuentra diferencias.
- Dispara: bloquea el cierre del periodo hasta resolver o aceptar la diferencia.
- Notifica a: Contable.
- Registra en: auditoría y bandeja de incidencias.

## Eventos que Contabilidad consume
| Evento | Origen | Reacción |
|---|---|---|
| `FacturaEmitida` (EV-F01) | Facturación | Asiento con PLA-K01 |
| `FacturaRectificada` (EV-F02) | Facturación | Asiento con PLA-K05 |
| `FacturaRecibidaRegistrada` (EV-F03) | Facturación | Asiento con PLA-K02 o K03 |
| `CobroRegistrado` / `PagoRegistrado` (EV-F04) | Facturación | Asiento con PLA-K04 |
| `LiquidacionPreparada` (EV-F05) | Facturación | Asiento con PLA-K06 |
| `FamiliaFiscalActualizada` (EV-C05) | Core | Genera subcuentas nuevas si hay familias nuevas |
| `PeriodoCerrado` (EV-C06) | Core | Cierra el periodo contable correspondiente |
| `LicenciaActivada` (EV-C07) | Core | Ofrece procesar pendientes (WF-K07) |
| `LicenciaSuspendida` / `LicenciaVencida` (EV-C08) | Core | Pasa a solo lectura o solo exportación |
| `TerceroBaja` (EV-C03) | Core | Marca el tercero como inactivo en subcuentas, sin borrarlo |

## Factura Lite
**EVT-K08 — RegistroFacturaCreado** → DISPARA: asiento (PLA-K01..K03); actualización del libro registro. Escucha: AG-K01.
**EVT-K09 — RegistrosImportadosComoHistorico** → DISPARA: marca los Registros como históricos sin nuevo asiento. Origen: activación de Facturación.
