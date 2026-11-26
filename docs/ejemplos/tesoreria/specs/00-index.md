# 00-index — Módulo Tesorería (H-03)
> Generado con SPECTRA · github.com/GuiMiran/spectra
> Borrador. ⚠ = por verificar contra la fuente oficial. Importes de ejemplo. Sin referencias a productos comerciales de terceros.

## Alcance
Tesorería gestiona **el dinero real de la empresa**: cuentas bancarias, movimientos, conciliación bancaria, remesas de cobro, órdenes de pago y previsión de caja. Es dueña de la **cuenta bancaria de la empresa**, el **movimiento bancario**, la **conciliación**, el **mandato SEPA**, la **remesa** y la **previsión**. No emite facturas (Facturación) ni lleva asientos (Contabilidad).
- Depende del core: empresa, tercero, periodo, licencias.
- Opcionales: Facturación (vencimientos, cobros y pagos) y Contabilidad (asientos).
- Consume: EV-F01, EV-F03 (vencimientos), EV-F02, EVT-K01 (asiento generado), EV-C06, EV-C07, EV-C08.
- Produce: EV-T01..T10.
- Fuera de alcance: ejecución de pagos con firma bancaria en nombre del usuario, factoring, pagarés (fase 2), tarjetas, divisas ⚠.

## Fuentes de datos bancarios
1. **Fichero de extracto** (Norma 43 / Cuaderno 43 de la AEB, y ISO 20022 camt.053): fase 1.
2. **Acceso por API bancaria** (PSD2, con consentimiento y renovación periódica ⚠): fase 2.
3. **Alta manual** de movimientos: respaldo.
Formatos de salida: SEPA transferencias (ISO 20022 pain.001) y adeudos (pain.008).

## Dispatch
| Capa | IDs |
|---|---|
| 02 historias | HU-T01..T26 |
| 03 reglas | RN-T01..T30 |
| 04 invariantes | INV-T01..T12 |
| 05 contratos | CT-T01..T09 |
| 06 políticas | POL-T01..T10 |
| 07 eventos | EV-T01..T10 |
| 08 agentes | AG-T01..T06 |
| 09 skills | SK-T01..T14 |
| 10 workflows | WF-T01..T09 |
| 11 criterios | AC-T01..T24 |

## Decisiones (propuesta, modificables)
- **DEC-T01:** la **cuenta bancaria de un tercero** (IBAN) la usan Facturación (forma de pago) y Tesorería (remesas, pagos). Por la regla de ≥ 2 módulos, **sube al core como CE-20**. Pendiente de aprobar con el core (PR #47).
- **DEC-T02:** fase 1 importa ficheros (Norma 43 y camt.053); la API bancaria es fase 2.
- **DEC-T03:** la conciliación propone coincidencias; el usuario confirma. Solo las de confianza alta se confirman solas si la empresa lo activa.
- **DEC-T04:** con Facturación activa, Tesorería concilia y Facturación registra el cobro (EV-F04). Sin Facturación, Contabilidad consume EV-T03 directamente.
- **DEC-T05:** los movimientos sin factura (comisiones, intereses) generan su asiento desde Tesorería con una plantilla nueva de Contabilidad (PLA-K09, pendiente de añadir).
- **DEC-T06:** el MVP **genera** los ficheros de remesa y de pago; el envío al banco lo hace el usuario.
