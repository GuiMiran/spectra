# 01-glosario — Módulo Facturación
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. Los puntos marcados ⚠ se verifican contra BOE / AEAT / Agencia Tributaria Canaria antes de usarse como verdad. Importes de ejemplo.

| Término | Definición | Ejemplo | Evitar |
|---|---|---|---|
| **Factura emitida** | Documento legal que la empresa expide a un tercero por una operación. Inmutable una vez emitida | F-2026-0001 | "ticket", "albarán" |
| **Factura recibida** | Factura que un proveedor expide a la empresa y que esta registra | Recibo de luz | "compra" |
| **Factura simplificada** | Factura con menos datos, solo en los casos y límites legales ⚠ | Venta de mostrador | "ticket" |
| **Factura rectificativa** | Documento que corrige una factura emitida, referenciándola (R1–R5) | R-2026-0003 | "abono" sin referencia |
| **Serie** | Secuencia correlativa sin saltos de numeración | F-, R-, S- | "contador" |
| **Registro de facturación** | Registro técnico encadenado de cada factura (huella, QR) exigido por VeriFactu | Huella de F-2026-0001 | "log" |
| **Familia fiscal** | Impuesto + tipo + calificación + régimen que decide el tratamiento de una línea (CE-07) | FF-IVA-21 | "tipo de IVA" |
| **Base imponible** | Importe de una línea o grupo sin impuesto | 1.000 € | "neto" |
| **Cuota** | Impuesto resultante de aplicar el tipo a la base | 210 € | "IVA" si es IGIC |
| **Retención** | Parte del importe que el pagador ingresa a cuenta del IRPF del perceptor | 15 % profesional | "descuento" |
| **Recargo de equivalencia** | Recargo para comerciantes minoristas sobre la cuota ⚠ | 5,2 % sobre 21 % | "extra" |
| **Inversión del sujeto pasivo** | El destinatario liquida el impuesto, no el emisor | Obra a promotor | "IVA inverso" |
| **Cuota deducible** | Parte de la cuota soportada que se resta en la liquidación | 105 € de 210 € | "IVA recuperable" |
| **Libro registro** | Libro de facturas emitidas, recibidas y bienes de inversión | Libro de emitidas T1 | "listado" |
| **Liquidación** | Resumen periódico de impuesto repercutido menos soportado (303 o 420) | 303 T1 | "declaración" |
| **Vencimiento** | Fecha en que una factura debe cobrarse o pagarse | 30 días | "plazo" |
