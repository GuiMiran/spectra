# 09-skills — Módulo Contabilidad
> Generado con SPECTRA · github.com/GuiMiran/spectra

Capacidades atómicas e invocables.

**SK-K01 — generar_asiento_desde_evento**
- Descripción: crea el asiento de un evento aplicando su plantilla.
- Entrada: evento (tipo, identificador, empresa, fecha, importes por familia fiscal, tercero, retención, recargo).
- Salida: asiento contabilizado o incidencia.
- Reglas: RN-K01, RN-K02, RN-K04, RN-K05, RN-K16, RN-K20, RN-K21, RN-K22.
- Invariantes: INV-K01, INV-K04, INV-K06, INV-K07, INV-K11, INV-K12.
- Usado por: AG-K01, AG-K06.

**SK-K02 — validar_cuadre**
- Descripción: comprueba que un conjunto de apuntes cuadra.
- Entrada: lista de apuntes.
- Salida: cuadra o diferencia.
- Reglas: RN-K01.
- Invariantes: INV-K01.
- Usado por: AG-K01.

**SK-K03 — resolver_cuenta**
- Descripción: decide la cuenta de un apunte según política.
- Entrada: familia fiscal, territorio, tipo de operación, producto, naturaleza.
- Salida: cuenta o subcuenta activa.
- Reglas: RN-K10, RN-K13, RN-K22; POL-K01, POL-K03, POL-K05.
- Invariantes: INV-K05, INV-K15.
- Usado por: AG-K01, AG-K05.

**SK-K04 — calcular_cuota_deducible**
- Descripción: separa la cuota soportada en deducible y no deducible.
- Entrada: cuota, porcentaje de deducibilidad o causa de no deducibilidad.
- Salida: cuota deducible y cuota que se suma al gasto.
- Reglas: RN-K06; POL-K04.
- Invariantes: INV-K01.
- Usado por: AG-K01.

**SK-K05 — anular_asiento**
- Descripción: crea el asiento inverso de otro.
- Entrada: asiento, fecha, motivo.
- Salida: asiento de anulación enlazado.
- Reglas: RN-K03, RN-K04.
- Invariantes: INV-K03, INV-K14.
- Usado por: AG-K03, AG-K06.

**SK-K06 — generar_libro_diario**
- Descripción: produce el diario de un periodo.
- Entrada: empresa, periodo, nivel de detalle.
- Salida: documento del diario.
- Reglas: RN-K12, RN-K17.
- Invariantes: INV-K04.
- Usado por: AG-K04.

**SK-K07 — generar_mayor**
- Descripción: movimientos y saldo acumulado de una o varias cuentas.
- Entrada: empresa, cuentas, fechas.
- Salida: extracto de mayor.
- Reglas: RN-K01.
- Invariantes: INV-K01.
- Usado por: AG-K04.

**SK-K08 — generar_sumas_y_saldos**
- Descripción: balance de sumas y saldos a una fecha.
- Entrada: empresa, fecha, nivel de cuenta.
- Salida: listado con suma del debe, del haber y saldo, o error de descuadre.
- Reglas: RN-K18.
- Invariantes: INV-K02.
- Usado por: AG-K02, AG-K04.

**SK-K09 — conciliar_impuestos**
- Descripción: compara 477, 472 y 430 con los libros registro y facturas pendientes.
- Entrada: empresa, periodo.
- Salida: sin diferencias o diferencias por tipo con facturas afectadas.
- Reglas: RN-K16.
- Invariantes: INV-K08, INV-K09.
- Usado por: AG-K02, AG-K03.

**SK-K10 — cerrar_periodo**
- Descripción: cierra o reabre un periodo tras las comprobaciones.
- Entrada: empresa, periodo, acción, motivo.
- Salida: estado del periodo.
- Reglas: RN-K04, RN-K15.
- Invariantes: INV-K10, INV-K16.
- Usado por: AG-K03.

**SK-K11 — generar_balance_y_pyg**
- Descripción: balance de situación y cuenta de pérdidas y ganancias.
- Entrada: empresa, fecha o periodo.
- Salida: dos informes con comparativa opcional.
- Reglas: RN-K18.
- Invariantes: INV-K02.
- Usado por: AG-K04.

**SK-K12 — generar_extracto_tercero**
- Descripción: facturas, cobros o pagos y saldo de un cliente o proveedor.
- Entrada: empresa, tercero (identificador del core), fechas.
- Salida: extracto y antigüedad de saldos.
- Reglas: RN-K24.
- Invariantes: INV-K08, INV-K11.
- Usado por: AG-K04.

**SK-K13 — crear_plan_de_cuentas**
- Descripción: genera el plan desde una plantilla y las subcuentas de impuestos desde las familias fiscales.
- Entrada: empresa, plantilla, familias fiscales.
- Salida: plan activo.
- Reglas: RN-K10, RN-K13.
- Invariantes: INV-K15.
- Usado por: AG-K05.

## Factura Lite
**SK-K14 — registrar_factura** — Entrada: tercero, fecha, número, bases y cuotas por familia fiscal, retención. Salida: Registro y asiento. Reglas: RN-K27..K30. Invariantes: INV-K17, INV-K18. Usado por: AG-K01.
**SK-K15 — importar_registros** — Entrada: fichero. Salida: creados y rechazados con motivo. Reglas: RN-K30. Usado por: AG-K05.
**SK-K16 — detectar_duplicado** — Entrada: tercero, número, fecha. Salida: posible duplicado o no. Reglas: RN-K30. Usado por: AG-K01.
**SK-K17 — conciliar_con_facturacion** — Entrada: Registros y facturas de Facturación. Salida: cruce por tercero, número, fecha e importe, y diferencias. Reglas: RN-K32. Invariantes: INV-K17. Usado por: AG-K05.
**SK-K18 — generar_libro_registro** — Entrada: empresa, periodo, impuesto. Salida: libro registro desde Registros. Reglas: RN-K31. Usado por: AG-K04.
