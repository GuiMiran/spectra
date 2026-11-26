# SPEC-INDEX — Módulo Facturación
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. Los puntos marcados ⚠ se verifican contra BOE / AEAT / Agencia Tributaria Canaria antes de usarse como verdad. Importes de ejemplo.

Archivos: 00-index … 12-trace, en esta carpeta. Dominio de partida: [dominio-fiscal.md](../../saas-facturacion/dominio-fiscal.md). Core: [core-contratos.md](../../plataforma-modular/core-contratos.md). Contabilidad: [SPEC-INDEX](../../contabilidad/specs/SPEC-INDEX.md).

## Referencias cruzadas
- Emisión: HU-F01 → WF-F01 → AG-F01 → SK-F01..F04, F12 → EV-F01 → Contabilidad WF-K01.
- Liquidación: HU-F16 → WF-F05 → AG-F04 → SK-F09, F10 → EV-F05 → Contabilidad WF-K03.
- Con Contabilidad: ver CT-K01 e INV-K09 (conciliación) e INV-F14 / INV-K17 (un asiento por factura).

## Convenciones
Sufijo -F = Facturación. EV-F01..F05 son los eventos del core-contratos; EV-F06..F09 son nuevos. ⚠ = sin verificar. Sin referencias a productos comerciales de terceros.

## Cómo consumir (IA agéntica)
Leer 00-index y decisiones → glosario, reglas, invariantes, políticas → contratos y skills → workflows y agentes → usar los AC como pruebas → rellenar 12-trace. No inventar tipos, plazos ni códigos: si hay ⚠, preguntar.

## Pendiente de revisión experta
Fechas de VeriFactu y factura electrónica, límites de simplificada, recargo de equivalencia, tipos de rectificativa, códigos de impuesto, retención, conservación, Canarias (IGIC) y forales.
