# 03-reglas-negocio — Módulo Facturación
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. Los puntos marcados ⚠ se verifican contra BOE / AEAT / Agencia Tributaria Canaria antes de usarse como verdad. Importes de ejemplo.

## Emisión
**RN-F01** — Una factura emitida es inmutable; solo se corrige con rectificativa. *Fuente: reglamento de facturación ⚠ (RD 1619/2012) y VeriFactu.*
**RN-F02** — Cada serie se numera de forma correlativa y sin saltos.
**RN-F03** — Total = suma de bases + cuotas + recargo − retención.
**RN-F04** — Una línea pertenece a una sola familia fiscal y no mezcla IVA e IGIC.
**RN-F05** — El tipo aplicado es el vigente en la fecha de la operación.
**RN-F06** — Una factura lleva, como mínimo, emisor, destinatario, fecha, descripción, base, tipo y cuota ⚠ (contenido exacto por verificar).
**RN-F07** — La factura simplificada solo se emite dentro de los límites legales ⚠; fuera de ellos se exige completa.
**RN-F08** — Con inversión del sujeto pasivo no se repercute cuota y la factura lo indica.
**RN-F09** — Recargo de equivalencia solo a clientes en ese régimen ⚠.
**RN-F10** — La retención se aplica según el tipo del perceptor y es la misma en cualquier territorio.
## Rectificativas
**RN-F11** — Toda rectificativa referencia a una factura original existente.
**RN-F12** — El tipo de rectificativa (R1–R5) depende del motivo ⚠. Importes por diferencia o por sustitución según política.
## Recibidas
**RN-F13** — Cada recibida recibe un nº de recepción correlativo.
**RN-F14** — La cuota deducible nunca supera la cuota soportada.
**RN-F15** — Se distingue fecha de expedición y fecha de operación; el devengo usa la de operación.
**RN-F16** — Recibidas con distintos tipos se anotan en un asiento por tipo.
**RN-F17** — Asiento resumen del libro de recibidas solo dentro de los límites de la AEAT ⚠ (mismo día y proveedor, hasta 6.000 € total y 500 € cada una).
## Libros y liquidaciones
**RN-F18** — Toda factura emitida y recibida se anota en su libro registro.
**RN-F19** — La liquidación se calcula desde los libros, no desde otra fuente.
**RN-F20** — El modelo de liquidación depende del territorio (303 península, 420 Canarias).
**RN-F21** — El MVP prepara los modelos; no presenta ante la Administración.
## VeriFactu
**RN-F22** — Cada factura emitida tiene exactamente un registro de facturación encadenado (huella del anterior).
**RN-F23** — La anulación de una factura se registra, no se borra.
**RN-F24** — Un registro rechazado no impide el cobro, pero genera incidencia y debe subsanarse ⚠.
## Licencia y datos
**RN-F25** — Sin licencia, Facturación no emite ni registra, pero conserva y permite exportar.
**RN-F26** — Periodo cerrado: no se emiten ni registran facturas con fecha dentro.
**RN-F27** — Los datos de facturas se conservan el plazo legal ⚠ (por confirmar).
**RN-F28** — La medición de uso registra conteos, nunca contenido (EV-C10).
