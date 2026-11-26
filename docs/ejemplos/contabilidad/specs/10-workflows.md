# 10-workflows — Módulo Contabilidad
> Generado con SPECTRA · github.com/GuiMiran/spectra

**WF-K01 — Contabilización automática de una factura**
- Trigger: `FacturaEmitida` o `FacturaRecibidaRegistrada`.
- Agentes: AG-K01.
- Pasos:
  1. AG-K01 comprueba licencia y periodo (CT-K01).
  2. SK-K03 resuelve las cuentas.
  3. SK-K04 calcula la cuota deducible (solo recibidas).
  4. SK-K01 construye el asiento con la plantilla de POL-K02.
  5. SK-K02 valida el cuadre.
  6. Se guarda y emite EVT-K01.
- Resultado: asiento cuadrado, único, enlazado a la factura.
- Errores: sin licencia (cola), periodo cerrado (incidencia), cuenta sin configurar (aviso), descuadre (incidencia y no se guarda).

**WF-K02 — Cobro y pago**
- Trigger: `CobroRegistrado` o `PagoRegistrado`.
- Agentes: AG-K01.
- Pasos: SK-K03 (bancos o caja y cuenta del tercero) → SK-K01 (PLA-K04) → EVT-K01.
- Resultado: saldo del tercero actualizado.
- Errores: factura sin asiento previo (se genera primero o se crea incidencia).

**WF-K03 — Liquidación trimestral (303 o 420)**
- Trigger: `LiquidacionPreparada`.
- Agentes: AG-K01, AG-K02.
- Pasos: SK-K09 concilia el periodo → SK-K01 genera PLA-K06 → al presentarse y pagarse, otro asiento contra 572.
- Resultado: 477 y 472 cancelados y saldo en 4750 o 4700.
- Errores: conciliación descuadrada (se detiene y se abre incidencia).

**WF-K04 — Cierre de periodo**
- Trigger: orden del Responsable de despacho.
- Agentes: AG-K03, AG-K02.
- Pasos: SK-K09 concilia → SK-K08 comprueba sumas y saldos → SK-K10 cierra → EVT-K03.
- Resultado: periodo cerrado y congelado.
- Errores: pendientes, descuadre o periodo anterior abierto (CT-K04).

**WF-K05 — Conciliación periódica**
- Trigger: programado o `AsientoGenerado` masivo.
- Agentes: AG-K02.
- Pasos: SK-K09 → si hay diferencias, EVT-K07 con facturas afectadas.
- Resultado: informe de conciliación.
- Errores: sin Facturación, se informa de que no hay con qué comparar.

**WF-K06 — Corrección de un asiento o de una rectificativa**
- Trigger: orden del Contable o `FacturaRectificada`.
- Agentes: AG-K06, AG-K01.
- Pasos: SK-K05 anula (si procede) → SK-K01 genera el asiento corregido con PLA-K05 → EVT-K02 y EVT-K01.
- Resultado: historial íntegro y saldos correctos.
- Errores: periodo cerrado del original (se anula en el abierto con aviso).

**WF-K07 — Activación de licencia con procesamiento de pendientes**
- Trigger: `LicenciaActivada`.
- Agentes: AG-K05, AG-K01.
- Pasos: SK-K13 crea el plan si falta → se ofrece procesar los eventos de menos de 90 días → AG-K01 los procesa por fecha (CT-K09).
- Resultado: contabilidad al día.
- Errores: eventos de más de 90 días se avisan y no se procesan solos.

**WF-K08 — Cierre de ejercicio y legalización**
- Trigger: fin de ejercicio.
- Agentes: AG-K03, AG-K04.
- Pasos: cerrar periodos pendientes → regularización (PLA-K08) → EVT-K05 → SK-K06, SK-K08 y SK-K11 generan los libros → recordatorio de legalizar en cuatro meses.
- Resultado: libros listos para el Registro Mercantil.
- Errores: periodos abiertos o descuadre.

**WF-K09 — Alta de empresa o nueva familia fiscal**
- Trigger: `EmpresaCreada` o `FamiliaFiscalActualizada`.
- Agentes: AG-K05.
- Pasos: SK-K13 crea el plan o las subcuentas nuevas.
- Resultado: cuentas listas antes de la primera factura.
- Errores: plantilla no elegida (se pide elegir).
