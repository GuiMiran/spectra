# SPEC-INDEX — Tesorería
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar contra la fuente oficial. Importes de ejemplo. Sin referencias a productos comerciales de terceros.

Archivos 00 a 12 en esta carpeta. Core: [core-contratos.md](../../plataforma-modular/core-contratos.md). Facturación: [SPEC-INDEX](../../facturacion/specs/SPEC-INDEX.md). Contabilidad: [SPEC-INDEX](../../contabilidad/specs/SPEC-INDEX.md).

## Referencias cruzadas
- Conciliación: HU-T06 → WF-T02 → AG-T02 → SK-T04, T05 → EV-T03 → Facturación EV-F04 → Contabilidad PLA-K04.
- Sin factura: HU-T10 → WF-T03 → EV-T05 → Contabilidad PLA-K09 (pendiente).
- Remesas: HU-T15 → WF-T04 → SK-T09 (pain.008).

## Cambios que este módulo pide a otros
- **Core:** CE-20 Cuenta bancaria de tercero (DEC-T01).
- **Contabilidad:** plantilla PLA-K09 para movimientos sin factura y escucha de EV-T03 cuando no hay Facturación.
- **Facturación:** escucha EV-T03 para registrar cobros y pagos; marca facturas remesadas o en pago.

## Convenciones
Sufijo -T. ⚠ sin verificar, ❓ decisión de negocio.

## Fuentes consultadas
Estructura de Norma 43 (registros 11, 22, 23, 24, 33 y 88) según la documentación pública del formato; reglas de adeudos SEPA (mandato, preaviso de 14 días, reembolso a 8 semanas, reclamación a 13 meses, caducidad a 36 meses) según la guía pública de un banco. Estas guías varían por entidad: confirmar contra el esquema de la AEB y los reglamentos del EPC antes de usarlas como verdad.

## Cómo consumir (IA agéntica)
Leer 00-index y decisiones → glosario, reglas, invariantes, políticas → contratos y skills → workflows y agentes → AC como pruebas → rellenar 12-trace. No inventar plazos, cuentas ni códigos de motivo: preguntar.

## Pendiente de revisión
Plazos y cortes de adeudos por banco, códigos de motivo de devolución, formato exacto de ficheros contra el esquema oficial, renovación del consentimiento en acceso por API bancaria (PSD2), cuentas contables de gastos financieros y verificación del beneficiario en transferencias.
