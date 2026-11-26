# 03-reglas-negocio — Tesorería
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar contra la fuente oficial. Importes de ejemplo. Sin referencias a productos comerciales de terceros.

## Cuentas e IBAN
**RN-T01** — Todo IBAN supera la validación de formato y de dígitos de control (módulo 97 de ISO 13616).
**RN-T02** — Una cuenta pertenece a una empresa; un IBAN no se repite en la misma empresa.
**RN-T03** — Una cuenta con movimientos no se borra; se desactiva.
## Importación
**RN-T04** — Un movimiento se identifica por cuenta, fecha, importe, sentido, concepto y referencia; el mismo no se importa dos veces.
**RN-T05** — Un extracto en Norma 43 se valida: saldo inicial + abonos − cargos = saldo final; los totales del registro de cierre coinciden con los movimientos; el registro final cuenta los registros del fichero ⚠.
**RN-T06** — Si un extracto no cuadra, no se importa y se informa de qué control falla.
**RN-T07** — Fecha de operación y fecha valor se guardan separadas; la conciliación usa la de operación y la previsión, la valor.
**RN-T08** — El sentido (cargo o abono) lo da el extracto, nunca el signo inferido.
## Conciliación
**RN-T09** — Un movimiento se concilia por completo o parcialmente; el importe conciliado no supera el del movimiento ni el pendiente de la factura.
**RN-T10** — Criterios de coincidencia por orden: referencia o nº de factura, importe exacto, tercero por IBAN o nombre, fecha cercana.
**RN-T11** — Una coincidencia propuesta no se confirma sin el usuario, salvo regla automática activada (DEC-T03).
**RN-T12** — Un cobro conciliado informa a Facturación para registrar el cobro (DEC-T04).
**RN-T13** — Sin Facturación, Contabilidad consume la conciliación y genera el asiento.
**RN-T14** — Deshacer una conciliación revierte su efecto y deja constancia.
**RN-T15** — Un movimiento sin factura (comisión, interés) exige una clasificación contable ⚠ (cuentas de gastos e ingresos financieros).
## Mandatos y remesas
**RN-T16** — Todo adeudo directo exige un mandato vigente, con referencia única y identificador del acreedor ⚠.
**RN-T17** — El mandato caduca a los 36 meses sin uso; se conserva la copia el plazo exigido ⚠ (14 meses tras la última cobranza, según la guía bancaria consultada).
**RN-T18** — Se avisa al deudor antes del adeudo con importe y fecha, al menos 14 días antes salvo pacto ⚠.
**RN-T19** — La fecha de adeudo respeta los plazos y días hábiles bancarios del banco ⚠ (varían por entidad).
**RN-T20** — Se distingue adeudo básico (Core) del entre empresas (B2B); el B2B exige que el deudor registre el mandato en su banco ⚠.
**RN-T21** — El tipo de secuencia del adeudo (primero, recurrente, único, último) se fija según el historial del mandato ⚠.
**RN-T22** — Un adeudo reclamado por el deudor o no autorizado puede devolverse en plazos legales: reembolso hasta 8 semanas (Core) y reclamación hasta 13 meses ⚠.
## Pagos
**RN-T23** — Una orden de pago solo incluye facturas recibidas aprobadas y con IBAN del proveedor válido.
**RN-T24** — Un pago se genera una vez; no se incluye dos veces la misma factura.
**RN-T25** — Un pago superior al umbral exige aprobación ❓ (umbral por empresa).
## Previsión y datos
**RN-T26** — La previsión usa vencimientos de facturas pendientes, remesas y pagos programados, y el saldo bancario real.
**RN-T27** — Los saldos bancarios son datos reservados: acceso por rol y auditoría.
**RN-T28** — Sin licencia activa Tesorería no escribe pero conserva y permite exportar.
**RN-T29** — Con periodo cerrado no se concilian ni clasifican movimientos con fecha dentro.
**RN-T30** — La medición de uso registra conteos, nunca importes ni conceptos (EV-C10).
