# 05-contratos — Módulo Contabilidad
> Generado con SPECTRA · github.com/GuiMiran/spectra

## CT-K01 — Contabilizar un evento de Facturación
- **PRE:** licencia activa; plan de cuentas creado; modalidad mercantil; el evento no ha generado asiento (INV-K07); fecha en periodo abierto; plantilla aplicable existe.
- **POST:** existe un asiento cuadrado con su evento y documento de origen; se emite `AsientoGenerado`; el evento queda marcado como procesado.
- **ERROR:**
  - Sin licencia: el evento queda en cola 90 días.
  - Periodo cerrado: no se crea asiento y se abre incidencia (RN-K21).
  - Cuenta no configurada: se usa la cuenta por defecto y se avisa (RN-K22).
  - Plantilla inexistente: incidencia con el evento intacto.
- **REVIERTE:** nada se guarda a medias; si falla un apunte, no se crea el asiento.

## CT-K02 — Crear un asiento manual
- **PRE:** rol Contable o superior; licencia activa; fecha en periodo abierto; cuentas activas; al menos dos apuntes.
- **POST:** asiento cuadrado, numerado y auditado.
- **ERROR:** descuadre (se indica la diferencia), cuenta inactiva, periodo cerrado.
- **REVIERTE:** si falla la numeración o el guardado, no queda asiento.

## CT-K03 — Anular un asiento
- **PRE:** el asiento existe, está contabilizado y no está ya anulado; la fecha del asiento de anulación cae en un periodo abierto.
- **POST:** se crea el asiento inverso; ambos quedan enlazados; el original conserva su número y pasa a "anulado".
- **ERROR:** periodo cerrado del original (se ofrece anular en el periodo abierto actual con aviso).
- **REVIERTE:** si el inverso no se guarda, el original sigue como estaba.

## CT-K04 — Cerrar un periodo
- **PRE:** rol autorizado; todos los eventos del periodo procesados o con incidencia asumida; conciliación sin diferencias o con diferencia aceptada y registrada; periodos anteriores cerrados.
- **POST:** periodo cerrado; emite `PeriodoContableCerrado`; no admite asientos con fecha dentro.
- **ERROR:** eventos pendientes, descuadre sin aceptar, periodo anterior abierto.
- **REVIERTE:** el estado del periodo no cambia si falla alguna comprobación.

## CT-K05 — Reabrir un periodo
- **PRE:** rol autorizado; motivo informado; ningún modelo presentado depende del periodo, o el usuario lo confirma explícitamente.
- **POST:** periodo abierto; auditoría con motivo y autor; emite `PeriodoContableReabierto`.
- **ERROR:** falta de motivo o de permiso.

## CT-K06 — Generar un libro o informe
- **PRE:** licencia activa o modalidad de solo lectura; periodo y empresa válidos; INV-K02 cumplida si es sumas y saldos.
- **POST:** documento generado con fecha, versión de datos y periodo.
- **ERROR:** descuadre del balance (se bloquea y se indica); modalidad solo libros registro (informe no disponible).

## CT-K07 — Conciliar con Facturación
- **PRE:** periodo con datos de ambos módulos.
- **POST:** resultado por tipo de impuesto (sin diferencias, o diferencias con las facturas afectadas); si hay diferencia se emite `ConciliacionDescuadrada`.
- **ERROR:** falta de licencia de Facturación (se informa de que no hay con qué conciliar).

## CT-K08 — Crear el plan de cuentas
- **PRE:** la empresa no tiene plan; plantilla elegida (DEC-K01).
- **POST:** cuentas y subcuentas de impuestos generadas por familia fiscal (DEC-K02); plan activo.
- **ERROR:** plan ya existente.

## CT-K09 — Procesar pendientes al activar la licencia
- **PRE:** licencia recién activada; eventos con menos de 90 días.
- **POST:** cada evento seleccionado genera su asiento o una incidencia, en orden de fecha.
- **ERROR:** eventos de más de 90 días no se procesan solos; se avisa.
