# 02-historias — Módulo Contabilidad
> Generado con SPECTRA · github.com/GuiMiran/spectra

Roles: **Contable** (despacho o empresa), **Responsable de despacho**, **Administrador de empresa**, **Auditor** (solo lectura) y **Sistema** (para asientos automáticos).

## Plan de cuentas y configuración
**HU-K01 — Crear el plan de cuentas de una empresa** · Must
COMO Contable QUIERO crear el plan de cuentas a partir de una plantilla PARA empezar a contabilizar.
- DADO una empresa sin plan, CUANDO elijo la plantilla PGC de pymes, ENTONCES se crean las cuentas y quedan activas.
- DADO una empresa con plan, CUANDO intento crear otro, ENTONCES se rechaza y se indica el plan existente.

**HU-K02 — Abrir subcuentas** · Must
COMO Contable QUIERO abrir subcuentas PARA llevar el detalle por cliente, proveedor o impuesto.
- DADO una cuenta existente, CUANDO añado la subcuenta 4300001, ENTONCES queda enlazada a su cuenta padre.
- DADO un código ya usado, CUANDO intento repetirlo, ENTONCES se rechaza.

**HU-K03 — Configurar cuentas por producto** · Should
COMO Contable QUIERO fijar la cuenta de ventas y de compras de cada producto PARA que los asientos automáticos usen la cuenta correcta.
- DADO un producto sin cuenta, CUANDO llega una factura con él, ENTONCES se usa la cuenta por defecto de su familia y se avisa.

## Asientos automáticos
**HU-K04 — Contabilizar una factura emitida** · Must
COMO Sistema QUIERO generar el asiento cuando Facturación emite una factura PARA que la contabilidad esté al día sin trabajo manual.
- DADO la licencia activa y un periodo abierto, CUANDO llega `FacturaEmitida`, ENTONCES se crea un asiento cuadrado con cliente, IVA o IGIC repercutido, retención si la hay e ingreso.
- DADO que el mismo evento llega dos veces, CUANDO se procesa la segunda, ENTONCES no se crea otro asiento.

**HU-K05 — Contabilizar una factura recibida** · Must
COMO Sistema QUIERO generar el asiento de una factura recibida PARA registrar gasto, impuesto soportado y deuda.
- DADO una factura con cuota parcialmente deducible, CUANDO se contabiliza, ENTONCES la parte no deducible se suma al gasto.

**HU-K06 — Contabilizar cobros y pagos** · Must
COMO Sistema QUIERO asentar cada cobro y pago PARA mantener actualizado el saldo de clientes y proveedores.

**HU-K07 — Contabilizar una rectificativa** · Must
COMO Sistema QUIERO generar el asiento inverso al de la factura original PARA reflejar la corrección sin tocar el asiento previo.
- DADO una rectificativa por diferencias, CUANDO se contabiliza, ENTONCES el asiento recoge solo la diferencia.

**HU-K08 — Contabilizar una liquidación de IVA o IGIC** · Must
COMO Contable QUIERO que se cancelen el impuesto repercutido y el soportado del periodo PARA dejar la cuenta con Hacienda en su saldo real.

**HU-K09 — Resumen diario de TPV** · Should
COMO Sistema QUIERO un asiento diario por caja con las ventas agrupadas por familia fiscal PARA no saturar el diario con un asiento por ticket.

## Asientos manuales y correcciones
**HU-K10 — Crear un asiento manual** · Must
COMO Contable QUIERO registrar asientos a mano PARA operaciones que no vienen de otro módulo.
- DADO un asiento con debe distinto de haber, CUANDO intento guardarlo, ENTONCES se rechaza con la diferencia.

**HU-K11 — Anular un asiento** · Must
COMO Contable QUIERO anular un asiento con otro inverso PARA corregir sin borrar historia.
- DADO un asiento ya contabilizado, CUANDO intento editarlo, ENTONCES se me ofrece anularlo o ajustarlo.

## Libros e informes
**HU-K12 — Consultar el libro diario y el mayor** · Must
COMO Contable QUIERO consultar el diario y el mayor por fechas y cuentas PARA revisar y justificar movimientos.

**HU-K13 — Obtener el balance de sumas y saldos** · Must
COMO Contable QUIERO el balance de sumas y saldos a una fecha PARA comprobar que todo cuadra.

**HU-K14 — Obtener balance de situación y pérdidas y ganancias** · Must
COMO Administrador de empresa QUIERO ver mi situación y mi resultado PARA tomar decisiones.

**HU-K15 — Extracto de cliente o proveedor** · Should
COMO Contable QUIERO el extracto de un tercero con facturas, cobros y saldo PARA reclamar o revisar pagos.

**HU-K16 — Antigüedad de saldos** · Should
COMO Administrador de empresa QUIERO ver lo pendiente de cobro y pago por tramos PARA gestionar la tesorería.

## Control y cierre
**HU-K17 — Conciliar con Facturación** · Must
COMO Contable QUIERO comparar el impuesto contabilizado con los libros registro PARA detectar descuadres antes de presentar modelos.
- DADO un descuadre en 477, CUANDO ejecuto la conciliación, ENTONCES se lista la diferencia y las facturas afectadas.

**HU-K18 — Cerrar un periodo** · Must
COMO Responsable de despacho QUIERO cerrar un periodo PARA que no se pueda contabilizar más en él.
- DADO un periodo cerrado, CUANDO llega una factura fechada dentro, ENTONCES no se crea el asiento y se abre una incidencia.

**HU-K19 — Reabrir un periodo** · Should
COMO Responsable de despacho QUIERO reabrir un periodo con motivo PARA corregir un error, dejando constancia.

**HU-K20 — Generar los libros para legalizar** · Should
COMO Contable QUIERO exportar diario y libro de inventarios y cuentas anuales PARA presentarlos en el Registro Mercantil dentro de plazo.

## Licencia y datos
**HU-K21 — Procesar pendientes al activar Contabilidad** · Must
COMO Responsable de despacho QUIERO que al activar la licencia se ofrezcan los eventos pendientes PARA no perder operaciones.
- DADO eventos de menos de 90 días, CUANDO activo la licencia, ENTONCES se me ofrece procesarlos.
- DADO eventos de más de 90 días, CUANDO activo la licencia, ENTONCES no se procesan solos y se avisa.

**HU-K22 — Conservar datos sin licencia** · Must
COMO Administrador de empresa QUIERO exportar mi contabilidad aunque la licencia haya vencido PARA no perder mis datos.

**HU-K23 — Elegir modalidad de autónomo** · Should
COMO Administrador de empresa (autónomo) QUIERO elegir entre contabilidad mercantil o solo libros registro PARA ajustar el módulo a mi obligación.

**HU-K24 — Auditoría de cambios** · Must
COMO Auditor QUIERO ver quién hizo cada asiento, anulación o cierre PARA comprobar la trazabilidad.
