# 03-reglas-negocio — Módulo Contabilidad
> Generado con SPECTRA · github.com/GuiMiran/spectra
> ⚠ marca lo que debe verificarse contra el BOE, el PGC o la hacienda correspondiente.

## Contable general
**RN-K01** — Todo asiento cuadra: suma del debe igual a la suma del haber.
- Fuente: partida doble (Código de Comercio). Ejemplo: 1.060 + 150 = 210 + 1.000. Excepción: ninguna.

**RN-K02** — Los asientos se numeran de forma correlativa por ejercicio, sin saltos.
- Fuente: práctica contable. Ejemplo: tras el 154 va el 155. Excepción: un asiento anulado conserva su número.

**RN-K03** — Un asiento contabilizado no se modifica: se anula con un asiento inverso o se ajusta con otro.
- Fuente: inalterabilidad de los registros. Excepción: un asiento en borrador (manual sin contabilizar) sí se edita.

**RN-K04** — La fecha de un asiento pertenece a un ejercicio abierto y a un periodo no cerrado.
- Fuente: cierre contable. Excepción: reapertura con motivo (RN-K15).

**RN-K05** — Las facturas se contabilizan en la fecha de devengo (fecha de la factura o de la operación). El criterio de caja se reserva para la fase 2 (DEC-K03).
- Fuente: PGC, Ley del IVA. Ejemplo: factura del 28 de septiembre cobrada en octubre: asiento en septiembre.

**RN-K13** — Las cuentas de un asiento deben existir y estar activas en el plan de la empresa.
- Fuente: plan de cuentas. Excepción: ninguna.

**RN-K14** — Un asiento manual lleva siempre fecha, descripción y al menos dos apuntes.

**RN-K15** — Reabrir un periodo exige motivo, rol autorizado y queda en auditoría.

## Impuestos y retenciones
**RN-K06** — El IVA o IGIC soportado no deducible se suma al gasto o a la inversión.
- Fuente: PGC, Ley del IVA. Ejemplo: cuota de 21 € con 50 % deducible: 10,50 € a 472 y 10,50 € al gasto.

**RN-K07** — Las retenciones practicadas a terceros se abonan en 4751; las que sufre la empresa se cargan en 473.
- Fuente: PGC ⚠. Ejemplo: factura emitida con retención de 150 €: 473 en el debe.

**RN-K08** — El saldo de la liquidación de IVA o IGIC del periodo se lleva a 4750 (a ingresar) o 4700 (a devolver o compensar).
- Fuente: PGC. Ejemplo: repercutido 1.000 y soportado 600: 4750 por 400.

**RN-K09** — Las rectificativas generan el asiento inverso del original, por la diferencia o por el total según el tipo.
- Fuente: Reglamento de facturación ⚠ tratamiento de R1–R5.

**RN-K10** — El IGIC se contabiliza como el IVA, en subcuentas propias de 472 y 477.
- Fuente: Ley 20/1991 y resolución del ICAC de 16-12-1992 ⚠ (DEC-K02).

**RN-K11** — La contabilidad mercantil no cambia por territorio; cambian el impuesto indirecto, los modelos y la facturación (península, Canarias, forales).
- Fuente: Código de Comercio y haciendas territoriales.

**RN-K16** — El impuesto de una operación no se calcula en Contabilidad: se toma de lo que informa Facturación.
- Fuente: reparto de responsabilidades de la plataforma. Excepción: asientos manuales.

## Libros y legalización
**RN-K12** — Los libros obligatorios se legalizan antes de los cuatro meses siguientes al cierre del ejercicio.
- Fuente: art. 27 del Código de Comercio.

**RN-K17** — El libro diario puede agrupar por periodos no superiores al trimestre si el detalle consta en otros registros.
- Fuente: AEAT, obligaciones contables.

**RN-K18** — El libro de inventarios y cuentas anuales incluye balances de comprobación al menos trimestrales, el inventario de cierre y las cuentas anuales.
- Fuente: AEAT, obligaciones contables.

**RN-K19** — Los libros se conservan seis años desde el último asiento ⚠ (art. 30 del Código de Comercio, a confirmar).

## Integración y datos
**RN-K20** — Un evento de origen genera como máximo un asiento automático (idempotencia).

**RN-K21** — Si el periodo de la fecha está cerrado, no se crea el asiento: se abre una incidencia.

**RN-K22** — Si un producto no tiene cuenta propia, se usa la cuenta por defecto de su familia y se avisa.

**RN-K23** — Sin licencia activa, Contabilidad no escribe pero conserva y permite exportar los datos.

**RN-K24** — La medición de uso solo registra conteos, nunca el contenido de los asientos.

## Modalidades
**RN-K25** — Un autónomo persona física elige modalidad: contabilidad mercantil (con 550 Titular de la explotación) o solo libros registro (DEC-K05).
- Fuente: normativa del IRPF y Código de Comercio ⚠.

**RN-K26** — En modalidad solo libros registro no se generan asientos y los informes contables no están disponibles.

## Factura Lite
**RN-K27** — El Registro de factura no es documento legal y no se numera ni se emite desde Contabilidad.
**RN-K28** — Con Facturación activa, el alta manual de Registros queda bloqueada; el asiento sale del evento de Facturación.
**RN-K29** — Un Registro genera como máximo un asiento (idempotencia, como RN-K20).
**RN-K30** — Si hay mismo tercero, número y fecha, se avisa de posible duplicado antes de crear.
**RN-K31** — Sin Facturación, los libros registro de IVA e IGIC los genera Contabilidad desde los Registros ⚠ (verificar requisitos formales del libro).
**RN-K32** — Al activar Facturación, los Registros se importan como histórico y no se vuelven a contabilizar.
