# 11-criterios-aceptacion — Módulo Contabilidad
> Generado con SPECTRA · github.com/GuiMiran/spectra

Importes de ejemplo; los tipos son ilustrativos y los marcados ⚠ requieren verificación fiscal.

## Camino feliz
**AC-K01** (HU-K04, RN-K01, RN-K16, INV-K01)
DADO una factura emitida de 1.000 € con IVA 21 % y retención del 15 %
CUANDO llega `FacturaEmitida`
ENTONCES hay un asiento con 430 al debe 1.060 €, 473 al debe 150 €, 477 al haber 210 € y 705 al haber 1.000 €, y cuadra.

**AC-K02** (HU-K04, RN-K10, POL-K01) ⚠
DADO una factura de empresa en Canarias de 1.000 € con IGIC 7 %
CUANDO se contabiliza
ENTONCES la cuota de 70 € va a la subcuenta de IGIC dentro de 477 y 430 queda en 1.070 €.

**AC-K03** (HU-K05, RN-K06, POL-K04)
DADO una factura recibida de 1.000 € con IVA 21 % del que solo es deducible el 50 %
CUANDO se contabiliza
ENTONCES 472 recibe 105 € y los otros 105 € se suman al gasto.

**AC-K04** (HU-K06)
DADO una factura emitida contabilizada y pendiente
CUANDO se registra su cobro completo
ENTONCES se carga el banco, se abona 430 y el saldo del cliente queda en cero.

**AC-K05** (HU-K08, RN-K08, POL-K11)
DADO un trimestre con 477 de 2.000 € y 472 de 1.200 €
CUANDO se prepara la liquidación
ENTONCES se cancelan 477 y 472 y 800 € se llevan a 4750.

**AC-K06** (HU-K07, RN-K09)
DADO una factura emitida y su rectificativa por el total
CUANDO se contabiliza la rectificativa
ENTONCES el asiento es el inverso del original y los saldos del cliente y de los impuestos quedan en cero.

**AC-K07** (HU-K12, HU-K13, INV-K02)
DADO cualquier conjunto de asientos contabilizados
CUANDO se pide el balance de sumas y saldos
ENTONCES el total del debe es igual al total del haber.

## Errores esperados
**AC-K08** (RN-K21, POL-K07, INV-K10)
DADO un periodo cerrado
CUANDO llega una factura con fecha dentro de ese periodo
ENTONCES no se crea asiento, se abre una incidencia y se ofrece reabrir o imputar al periodo abierto.

**AC-K09** (RN-K01, HU-K10)
DADO un asiento manual con debe de 100 € y haber de 90 €
CUANDO se intenta contabilizar
ENTONCES se rechaza indicando la diferencia de 10 €.

**AC-K10** (RN-K13)
DADO un asiento con una cuenta inexistente en el plan de la empresa
CUANDO se intenta contabilizar
ENTONCES se rechaza y se indica qué cuenta falta.

**AC-K11** (RN-K23, HU-K22, POL-K10)
DADO una empresa sin licencia activa
CUANDO llega un evento de Facturación
ENTONCES no se crea asiento, el evento queda en cola y los datos existentes se pueden exportar.

**AC-K12** (RN-K03, HU-K11)
DADO un asiento contabilizado
CUANDO alguien intenta editar un importe
ENTONCES se impide y se ofrece anularlo con un asiento inverso.

**AC-K13** (RN-K15, HU-K19)
DADO un periodo cerrado
CUANDO se reabre sin motivo o por un rol no autorizado
ENTONCES se rechaza.

## Casos límite
**AC-K14** (RN-K20)
DADO un evento ya contabilizado
CUANDO el mismo evento se recibe otra vez
ENTONCES no se crea un segundo asiento.

**AC-K15** (RN-K02)
DADO un ejercicio con asientos 1 al 100
CUANDO se anula el 57
ENTONCES la anulación recibe el número 101 y no queda hueco.

**AC-K16** (RN-K22, HU-K03)
DADO un producto sin cuenta propia
CUANDO se contabiliza su venta
ENTONCES se usa la cuenta por defecto de su familia y se muestra un aviso.

**AC-K17** (HU-K21, WF-K07)
DADO 30 eventos de menos de 90 días y 3 de más
CUANDO se activa la licencia
ENTONCES se ofrece procesar los 30 por orden de fecha y se avisa de los 3.

**AC-K18** (HU-K17, INV-K09, WF-K05)
DADO un periodo donde el 477 difiere del libro registro de IVA repercutido en 10 €
CUANDO se concilia
ENTONCES se emite `ConciliacionDescuadrada` con las facturas afectadas y se bloquea el cierre.

**AC-K19** (HU-K09, POL-K08)
DADO 50 tickets de TPV de un día
CUANDO se cierra la caja
ENTONCES se genera un único asiento resumen del día.

**AC-K20** (HU-K23, RN-K26)
DADO un autónomo en modalidad solo libros registro
CUANDO llega una factura
ENTONCES no se genera asiento y el balance no se ofrece.

**AC-K21** (HU-K20, RN-K12, WF-K08)
DADO un ejercicio cerrado
CUANDO se piden los libros
ENTONCES se generan diario, mayor, sumas y saldos y balance, y se programa el recordatorio de legalizar antes de cuatro meses.

## Combinaciones fiscales
**AC-K22** (POL-K01, RN-K11) ⚠
DADO una factura con productos a 21 %, 10 % y 4 % en la misma factura
CUANDO se contabiliza
ENTONCES cada tipo va a su propia subcuenta de 477 y la suma coincide con el total de impuestos.

**AC-K23** (RN-K07, POL-K03)
DADO una factura recibida de un profesional con retención del 15 %
CUANDO se contabiliza
ENTONCES la retención se abona en 4751 y el proveedor queda por el neto.

**AC-K24** (HU-K24)
DADO cualquier asiento creado o anulado
CUANDO se consulta la auditoría
ENTONCES consta quién, cuándo y por qué, sin el contenido personal del tercero.
