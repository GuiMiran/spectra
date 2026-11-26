# 09-skills — Módulo Facturación
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. Los puntos marcados ⚠ se verifican contra BOE / AEAT / Agencia Tributaria Canaria antes de usarse como verdad. Importes de ejemplo.

**SK-F01 resolver_familia_fiscal** — Entrada: producto, territorio, cliente, fecha. Salida: familia. RN-F04, RN-F05, RN-F08; POL-F01.
**SK-F02 calcular_factura** — Entrada: líneas, retención, recargo. Salida: bases, cuotas, total. RN-F03, RN-F09, RN-F10; INV-F01.
**SK-F03 asignar_numero** — Entrada: serie. Salida: número correlativo. RN-F02; INV-F02.
**SK-F04 emitir_factura** — Orquesta SK-F01..F03 y SK-F12. RN-F01, RN-F06; INV-F03, INV-F09.
**SK-F05 clasificar_recibida** — Entrada: factura del proveedor. Salida: familia, ISP, intracomunitaria. RN-F15, RN-F16.
**SK-F06 decidir_deducibilidad** — Entrada: cuota, afectación. Salida: cuota deducible. RN-F14; POL-F06; INV-F07.
**SK-F07 registrar_cobro** — RN-F18; INV-F12.
**SK-F08 registrar_pago** — igual para recibidas.
**SK-F09 generar_libro_registro** — Entrada: empresa, periodo, tipo. Salida: libro. RN-F18; INV-F10.
**SK-F10 preparar_liquidacion** — Salida: resumen 303 o 420. RN-F19, RN-F20, RN-F21; INV-F11.
**SK-F11 preparar_retenciones_y_347** — Salida: resumen 111/115 y listado 347 ⚠.
**SK-F12 generar_registro_facturacion** — Huella, QR y remisión. RN-F22..F24; INV-F09.
**SK-F13 rectificar_factura** — RN-F11, RN-F12; POL-F05; INV-F04.
**SK-F14 anular_factura** — RN-F23.
