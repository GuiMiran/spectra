# 02-historias — Módulo Facturación
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. Los puntos marcados ⚠ se verifican contra BOE / AEAT / Agencia Tributaria Canaria antes de usarse como verdad. Importes de ejemplo.

**HU-F01 — Emitir una factura** · Must. COMO Empresa QUIERO emitir una factura PARA cobrar una operación.
- DADO un cliente y líneas con producto CUANDO emito ENTONCES se asigna número correlativo, se calcula el total y se genera el registro de facturación.
- DADO una factura emitida CUANDO intento editarla ENTONCES se impide y se ofrece rectificarla.
**HU-F02 — Resolver la familia fiscal** · Must. DADO una línea CUANDO emito ENTONCES la familia final depende del territorio del emisor, el cliente, su régimen y la fecha.
**HU-F03 — Aplicar retención** · Must. DADO un profesional con retención del 15 % CUANDO emito ENTONCES el total es bases + cuotas − retención.
**HU-F04 — Aplicar recargo de equivalencia** · Should ⚠. DADO un cliente con recargo CUANDO emito ENTONCES se añade el recargo sobre la cuota.
**HU-F05 — Emitir con inversión del sujeto pasivo** · Should. DADO una operación con inversión CUANDO emito ENTONCES la cuota no se repercute y se indica en la factura.
**HU-F06 — Emitir factura simplificada** · Should ⚠. DADO una venta dentro del límite legal CUANDO emito ENTONCES se genera con los datos mínimos; fuera del límite se exige factura completa.
**HU-F07 — Rectificar una factura** · Must. DADO una factura emitida CUANDO la rectifico ENTONCES se crea una rectificativa R1–R5 que referencia a la original.
**HU-F08 — Registrar una factura recibida** · Must. DADO una factura de proveedor CUANDO la registro ENTONCES se asigna nº de recepción, se clasifica fiscalmente y se anota en el libro.
**HU-F09 — Decidir la deducibilidad** · Must. DADO una recibida CUANDO la registro ENTONCES se fija cuota deducible total, parcial o nula.
**HU-F10 — Registrar cobros** · Must. DADO una emitida CUANDO registro un cobro ENTONCES baja el saldo del cliente.
**HU-F11 — Registrar pagos** · Must. Igual para recibidas.
**HU-F12 — Controlar vencimientos** · Should. DADO facturas vencidas CUANDO consulto ENTONCES las veo por antigüedad.
**HU-F13 — Libro de emitidas** · Must. Consultar y exportar por periodo.
**HU-F14 — Libro de recibidas** · Must. Consultar y exportar por periodo, con cuota deducible.
**HU-F15 — Libro de bienes de inversión** · Could. Anotar bienes de inversión.
**HU-F16 — Preparar la liquidación 303 / 420** · Must. DADO un trimestre cerrado en facturas CUANDO preparo ENTONCES el resumen coincide con los libros.
**HU-F17 — Resumen de retenciones (111 / 115)** · Should. Preparar el resumen por periodo.
**HU-F18 — Listado de operaciones con terceros (347)** · Could ⚠. Operaciones por encima del umbral.
**HU-F19 — Cerrar un periodo de facturación** · Must. DADO un periodo CUANDO se cierra ENTONCES no se emiten ni registran facturas con fecha dentro.
**HU-F20 — Remitir a la AEAT (VeriFactu)** · Must ⚠. DADO el modo verificable CUANDO se emite ENTONCES se remite el registro y se guarda el estado.
**HU-F21 — Gestionar un rechazo** · Must. DADO un registro rechazado CUANDO ocurre ENTONCES se avisa y se permite subsanar.
**HU-F22 — Gestionar series** · Should. Crear series sin saltos.
**HU-F23 — Cambio de licencia** · Must. Sin licencia solo lectura y exportación; datos nunca borrados.
**HU-F24 — Auditoría** · Must. Quién emitió, rectificó o anuló, y cuándo.
